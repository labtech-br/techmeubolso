import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurado");

    const ctxLine = context
      ? `\n\nContexto atual do usuário: ${JSON.stringify(context)}`
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
