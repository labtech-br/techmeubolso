import AppShell from "@/components/AppShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb, ShieldCheck, Mic, Calculator } from "lucide-react";

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
    text: "Toque no botão do microfone e diga, por exemplo: \"Gastei 30 reais com transporte\".",
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
    a: "Vá em \"Ver saldo\", encontre o gasto e toque no ícone de lixeira ao lado.",
  },
  {
    q: "Como mudo o modo simples para o padrão?",
    a: "No topo da tela, toque em \"Modo: Simples\" para alternar.",
  },
  {
    q: "Posso mudar o salário depois?",
    a: "Sim, vá em Configurações e atualize o valor a qualquer momento.",
  },
];

export default function Help() {
  return (
    <AppShell title="Autoajuda" showBack>
      <section className="mb-8">
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
    </AppShell>
  );
}
