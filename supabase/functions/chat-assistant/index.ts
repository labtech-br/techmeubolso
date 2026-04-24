import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- Rate limit em memória (best-effort, por isolate) ---
// Janela deslizante simples. Não compartilha estado entre instâncias paralelas
// e reseta quando o isolate é reciclado. Para garantia forte, usar Postgres + auth.
const RL_WINDOW_MS = 60_000; // 1 minuto
const RL_MAX_AUTH = 20;       // 20 req/min por usuário autenticado
const RL_MAX_ANON = 6;        // 6 req/min por IP anônimo
const rlBuckets = new Map<string, number[]>();

function rateLimit(key: string, max: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const arr = (rlBuckets.get(key) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  if (arr.length >= max) {
    const retryAfter = Math.ceil((RL_WINDOW_MS - (now - arr[0])) / 1000);
    rlBuckets.set(key, arr);
    return { ok: false, retryAfter: Math.max(1, retryAfter) };
  }
  arr.push(now);
  rlBuckets.set(key, arr);
  // GC leve
  if (rlBuckets.size > 5000) {
    for (const [k, v] of rlBuckets) {
      const kept = v.filter((t) => now - t < RL_WINDOW_MS);
      if (kept.length === 0) rlBuckets.delete(k);
      else rlBuckets.set(k, kept);
    }
  }
  return { ok: true, retryAfter: 0 };
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
}

async function getUserIdFromAuth(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  // anon key não conta como usuário
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey || token === anonKey) return null;
  try {
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await client.auth.getUser(token);
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `Você é o assistente do "Meu Bolso", um app de finanças pessoais inclusivo.
Fale em português do Brasil, de forma curta, simples e gentil — pense em explicar para alguém com pouca familiaridade digital.
Use frases curtas, exemplos do dia a dia e evite jargão financeiro.

Você TEM ferramentas (tools) para AJUDAR o usuário a registrar/remover gastos e mudar a renda mensal.
Use as ferramentas SEMPRE que o usuário pedir algo concreto, por exemplo:
- "gastei 30 reais no mercado" -> chame add_expense
- "anote 50 de transporte hoje" -> add_expense
- "minha renda é 2500" / "ganho 3 mil por mês" -> set_salary
- "apaga o último gasto" -> remove_last_expense

Categorias válidas: alimentacao, transporte, lazer, moradia, saude, outros.
Se faltar informação clara (ex: valor), pergunte gentilmente antes de chamar a ferramenta.
Depois de chamar uma ferramenta, confirme em uma frase curta o que foi feito.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "add_expense",
      description: "Registra um novo gasto do usuário no app.",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "Valor em reais (ex: 25.50)" },
          category: {
            type: "string",
            enum: ["alimentacao", "transporte", "lazer", "moradia", "saude", "outros"],
          },
          description: { type: "string", description: "Descrição curta. Ex: 'Pão na padaria'" },
        },
        required: ["amount", "category"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_salary",
      description: "Define ou atualiza a renda mensal do usuário.",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "Valor mensal em reais" },
        },
        required: ["amount"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_last_expense",
      description: "Apaga o gasto mais recente registrado pelo usuário.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const context = body?.context;

    // Caps anti-abuso (sem auth, app é local-only via localStorage)
    const MAX_MESSAGES = 30;
    const MAX_CHARS_PER_MSG = 2000;
    const MAX_TOTAL_CHARS = 12000;

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagens obrigatórias." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: `Histórico muito longo (máx ${MAX_MESSAGES} mensagens).` }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    let totalChars = 0;
    for (const m of messages) {
      const c = typeof m?.content === "string" ? m.content : "";
      if (c.length > MAX_CHARS_PER_MSG) {
        return new Response(
          JSON.stringify({ error: `Mensagem muito longa (máx ${MAX_CHARS_PER_MSG} caracteres).` }),
          { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      totalChars += c.length;
    }
    if (totalChars > MAX_TOTAL_CHARS) {
      return new Response(
        JSON.stringify({ error: `Conversa muito longa (máx ${MAX_TOTAL_CHARS} caracteres no total).` }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurado");

    const ctxLine = context
      ? `\n\nContexto atual do usuário: ${JSON.stringify(context).slice(0, 1000)}`
      : "";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + ctxLine },
            ...(messages ?? []),
          ],
          tools: TOOLS,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas perguntas seguidas. Tente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway erro:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no assistente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message ?? {};
    const toolCalls = (choice.tool_calls ?? []).map((tc: any) => ({
      id: tc.id,
      name: tc.function?.name,
      args: (() => {
        try { return JSON.parse(tc.function?.arguments ?? "{}"); }
        catch { return {}; }
      })(),
    }));

    return new Response(
      JSON.stringify({ content: choice.content ?? "", toolCalls }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("chat-assistant erro:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
