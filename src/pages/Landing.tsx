import { Link } from "react-router-dom";
import {
  Wallet,
  Sparkles,
  PieChart,
  Target,
  HeartHandshake,
  Mic,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    Icon: Wallet,
    title: "Saldo sempre claro",
    desc: "Veja o quanto sobra do seu mês com letras grandes e cores fáceis de ler.",
  },
  {
    Icon: PieChart,
    title: "Gráficos simples",
    desc: "Entenda para onde seu dinheiro vai, sem termos complicados.",
  },
  {
    Icon: Target,
    title: "Metas que ajudam",
    desc: "Defina um teto de gasto e receba alertas amigáveis quando se aproximar.",
  },
  {
    Icon: Mic,
    title: "Anote falando",
    desc: "Sem teclado: basta falar 'gastei 20 reais com pão' e pronto.",
  },
  {
    Icon: Sparkles,
    title: "Assistente de IA",
    desc: "Tire dúvidas e receba dicas de economia em linguagem simples.",
  },
  {
    Icon: HeartHandshake,
    title: "Pensado para todos",
    desc: "Modo de alto contraste, fonte grande e navegação guiada passo a passo.",
  },
];

const passos = [
  { n: "1", t: "Diga sua renda", d: "Conte quanto você recebe por mês — leva menos de 1 minuto." },
  { n: "2", t: "Anote os gastos", d: "Por categoria, com voz ou pela calculadora integrada." },
  { n: "3", t: "Veja o que sobra", d: "Acompanhe metas, gastos fixos e dicas no painel inicial." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-sm.jpg"
              alt="Meu Bolso"
              width={48}
              height={48}
              fetchPriority="high"
              decoding="async"
              className="h-12 w-12 rounded-2xl shadow-soft object-cover"
            />
            <span className="font-display text-2xl font-bold text-foreground">
              Meu Bolso
            </span>
          </div>
          <Link to="/app">
            <Button size="lg" className="h-12 rounded-2xl px-5 text-base">
              Entrar no app
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" /> Simples, claro e gratuito
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Seu dinheiro,{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                fácil de entender
              </span>
              .
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              O <strong className="text-foreground">Meu Bolso</strong> ajuda você a controlar
              seus gastos de um jeito gentil, com letras grandes, voz e um assistente de IA
              que conversa em português simples. Pensado para quem está começando — ou
              para quem só quer paz com as contas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/app">
                <Button size="lg" className="h-14 w-full rounded-2xl px-8 text-lg sm:w-auto">
                  Começar agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full rounded-2xl border-2 px-8 text-lg sm:w-auto"
                >
                  Como funciona?
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Funciona no celular e no computador. Não precisa instalar nada.
            </p>
          </div>

          {/* Mock preview */}
          <div className="relative">
            <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-elevated">
              <div className="rounded-2xl bg-gradient-primary p-5 text-primary-foreground">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Disponível este mês
                </p>
                <p className="mt-1 font-display text-4xl font-bold">R$ 1.840,00</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-primary-foreground/10 p-2">
                    <p className="opacity-80">Hoje</p>
                    <p className="font-display font-bold">R$ 32,00</p>
                  </div>
                  <div className="rounded-xl bg-primary-foreground/10 p-2">
                    <p className="opacity-80">No mês</p>
                    <p className="font-display font-bold">R$ 1.160,00</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { e: "🍎", t: "Mercado" },
                  { e: "🚌", t: "Transporte" },
                  { e: "💊", t: "Saúde" },
                  { e: "🏠", t: "Moradia" },
                  { e: "🎉", t: "Lazer" },
                  { e: "🧾", t: "Outros" },
                ].map((c) => (
                  <div
                    key={c.t}
                    className="rounded-2xl border-2 border-border bg-secondary/40 p-3 text-center"
                  >
                    <div className="text-2xl">{c.e}</div>
                    <p className="mt-1 text-xs font-semibold">{c.t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-full bg-primary/20 blur-3xl sm:block" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="cv-auto bg-card/40 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
            Tudo o que você precisa, nada que confunda
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted-foreground">
            Recursos pensados para serem simples de usar — mesmo para quem nunca usou um
            app de finanças.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <Icon className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="cv-auto py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
            Em 3 passos você está no controle
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {passos.map((p) => (
              <div key={p.n} className="rounded-3xl border-2 border-border bg-card p-6 text-center shadow-soft">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary font-display text-2xl font-bold text-primary-foreground shadow-elevated">
                  {p.n}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{p.t}</h3>
                <p className="mt-2 text-base text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-primary p-10 text-center text-primary-foreground shadow-elevated sm:p-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">
            Leva menos de 1 minuto para configurar. E é totalmente gratuito.
          </p>
          <Link to="/app" className="mt-6 inline-block">
            <Button
              size="lg"
              variant="secondary"
              className="h-14 rounded-2xl bg-card px-8 text-lg font-bold text-foreground hover:bg-card/90"
            >
              Abrir o Meu Bolso <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background/60 py-8 text-center text-sm text-muted-foreground">
        Feito com cuidado para você cuidar do seu bolso 💚
      </footer>
    </div>
  );
}
