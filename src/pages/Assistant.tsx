import { useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceInput from "@/components/VoiceInput";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Send, User, CheckCircle2, MessageSquare, Lightbulb, ShieldCheck, Mic, Calculator } from "lucide-react";
import {
  Category,
  spentThisMonth,
  spentToday,
  totalSpent,
  useAppState,
} from "@/lib/storage";

type Msg = { role: "user" | "assistant"; content: string; actions?: string[] };
type Tab = "chat" | "dicas";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SUGESTOES = [
  "Gastei 25 reais no mercado",
  "Anote 12 de transporte hoje",
  "Como posso economizar este mês?",
];

const TIPS = [
  {
    icon: Lightbulb,
    title: "Comece pelo básico",
    text: "Anote primeiro os gastos maiores: aluguel, mercado, contas. Os pequenos depois.",
  },
  {
    icon: ShieldCheck,
    title: "Guarde antes de gastar",
    text: "Quando receber, separe um pouquinho. Mesmo R$ 20 por semana vira reserva.",
  },
  {
    icon: Mic,
    title: "Use a voz",
    text: 'Toque no botão do microfone e diga, por exemplo: "Gastei 30 reais com transporte".',
  },
  {
    icon: Calculator,
    title: "Use a calculadora",
    text: "Antes de comprar, calcule quanto vai sobrar. Você decide com mais calma.",
  },
];

const FAQ = [
  {
    q: "Meus dados ficam onde?",
    a: "Ficam guardados no seu próprio aparelho. Ninguém mais vê.",
  },
  {
    q: "Como apagar um gasto?",
    a: 'Vá em "Ver saldo", encontre o gasto e toque no ícone de lixeira ao lado.',
  },
  {
    q: "Como mudo o modo simples para o padrão?",
    a: 'No topo da tela, toque em "Modo: Simples" para alternar.',
  },
  {
    q: "Posso mudar o salário depois?",
    a: "Sim, vá em Configurações e atualize o valor a qualquer momento.",
  },
];

export default function Assistant() {
  const { state, addExpense, removeExpense, update, unlockAchievement } = useAppState();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! Eu sou a Talita, sua assistente do Meu Bolso 💚 Posso te dar dicas e também anotar gastos para você. Por exemplo: diga 'gastei 30 reais com pão' que eu registro.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const runTool = (name: string, args: Record<string, unknown>): string | null => {
    if (name === "add_expense") {
      const amount = Number(args.amount);
      const category = String(args.category ?? "outros") as Category;
      const description = String(args.description ?? "");
      const valid = ["alimentacao", "transporte", "lazer", "moradia", "saude", "outros"];
      if (!isFinite(amount) || amount <= 0 || !valid.includes(category)) return null;
      addExpense({ amount, category, description });
      unlockAchievement("primeiro_gasto");
      return `Gasto de R$ ${amount.toFixed(2).replace(".", ",")} em ${category} registrado.`;
    }
    if (name === "set_salary") {
      const amount = Number(args.amount);
      if (!isFinite(amount) || amount < 0) return null;
      update({ salary: amount });
      unlockAchievement("salario_definido");
      return `Renda mensal definida em R$ ${amount.toFixed(2).replace(".", ",")}.`;
    }
    if (name === "remove_last_expense") {
      const last = state.expenses[0];
      if (!last) return "Não havia gastos para apagar.";
      removeExpense(last.id);
      return `Último gasto (R$ ${last.amount.toFixed(2).replace(".", ",")}) apagado.`;
    }
    return null;
  };

  const send = async (text: string) => {
    const userText = text.trim();
    if (!userText || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: userText }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          context: {
            renda_mensal: state.salary,
            gasto_no_mes: spentThisMonth(state.expenses),
            gasto_hoje: spentToday(state.expenses),
            total_gastos_registrados: totalSpent(state.expenses),
          },
        }),
      });

      if (resp.status === 429) {
        toast({ title: "Muitas perguntas", description: "Aguarde um instante." });
        return;
      }
      if (resp.status === 402) {
        toast({
          title: "Sem créditos de IA",
          description: "Adicione créditos no workspace.",
        });
        return;
      }
      if (!resp.ok) throw new Error("Falha");

      const data = await resp.json();
      const content: string = data.content ?? "";
      const toolCalls: { name: string; args: Record<string, unknown> }[] = data.toolCalls ?? [];

      const actions: string[] = [];
      for (const tc of toolCalls) {
        const result = runTool(tc.name, tc.args);
        if (result) actions.push(result);
      }

      const finalContent =
        content || (actions.length ? "Pronto! Já anotei aqui." : "Não consegui entender, pode repetir?");

      setMessages((m) => [...m, { role: "assistant", content: finalContent, actions }]);

      requestAnimationFrame(() =>
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        }),
      );
    } catch (e) {
      console.error(e);
      toast({
        title: "Não consegui responder agora",
        description: "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Talita (IA)" showBack>
      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setTab("chat")}
          className={`flex items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-sm font-bold transition-all ${
            tab === "chat"
              ? "border-primary bg-gradient-primary text-primary-foreground shadow-soft"
              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Conversar
        </button>
        <button
          onClick={() => setTab("dicas")}
          className={`flex items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-sm font-bold transition-all ${
            tab === "dicas"
              ? "border-primary bg-gradient-primary text-primary-foreground shadow-soft"
              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
          }`}
        >
          <Lightbulb className="h-4 w-4" /> Dicas e FAQ
        </button>
      </div>

      {/* Chat tab */}
      {tab === "chat" && (
        <div className="flex h-[65vh] flex-col rounded-3xl border-2 border-border bg-card shadow-soft">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    m.role === "assistant"
                      ? "bg-gradient-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <Sparkles className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] space-y-2 rounded-2xl px-4 py-3 text-base leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-secondary text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content || "…"}</p>
                  {m.actions?.map((a, j) => (
                    <p
                      key={j}
                      className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
                    >
                      <CheckCircle2 className="h-4 w-4" /> {a}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {messages.length <= 1 && (
            <div className="border-t border-border px-4 py-3">
              <p className="mb-2 text-sm font-semibold text-muted-foreground">
                Sugestões:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-semibold transition-all hover:border-primary hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <VoiceInput onResult={(t) => setInput((p) => (p ? p + " " : "") + t)} label="Voz" />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Diga 'gastei 20 no mercado'…"
              className="h-14 rounded-2xl border-2 px-4 text-base"
              disabled={loading}
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 rounded-2xl px-5"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}

      {/* Dicas e FAQ tab */}
      {tab === "dicas" && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 font-display text-xl font-bold">Dicas rápidas</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {TIPS.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border-2 border-border bg-card p-5 shadow-soft"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="font-display text-lg font-bold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-bold">Perguntas frequentes</h2>
            <Accordion type="single" collapsible className="rounded-2xl border-2 border-border bg-card px-4">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`q${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      )}
    </AppShell>
  );
}
