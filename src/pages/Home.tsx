import { Link, Navigate } from "react-router-dom";
import {
  PlusCircle,
  Wallet,
  Calculator,
  Sparkles,
  Bell,
  Repeat,
  Target,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import {
  useAppState,
  formatBRL,
  spentThisMonth,
  spentToday,
  spentByCategory,
  CATEGORIES,
} from "@/lib/storage";

const tiles: { to: string; label: string; Icon: typeof PlusCircle; primary?: boolean; highlight?: boolean }[] = [
  { to: "/adicionar", label: "Adicionar gasto", Icon: PlusCircle, primary: true },
  { to: "/assistente", label: "Assistente IA", Icon: Sparkles, highlight: true },
  { to: "/saldo", label: "Ver saldo", Icon: Wallet },
  { to: "/fixos", label: "Gastos fixos", Icon: Repeat },
  { to: "/metas", label: "Metas", Icon: Target },
  { to: "/calculadora", label: "Calculadora", Icon: Calculator },
];

export default function Home() {
  const { state } = useAppState();
  if (!state.onboarded) return <Navigate to="/bem-vindo" replace />;

  const totalMes = spentThisMonth(state.expenses);
  const totalHoje = spentToday(state.expenses);
  const restante = state.salary - totalMes;
  const byCat = spentByCategory(state.expenses);

  const visible = tiles;

  return (
    <AppShell>
      <section className="mb-8 rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-elevated sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
          Disponível este mês
        </p>
        <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">
          {formatBRL(restante)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-primary-foreground/10 p-3">
            <p className="opacity-80">Hoje</p>
            <p className="mt-1 font-display text-lg font-bold">
              {formatBRL(totalHoje)}
            </p>
          </div>
          <div className="rounded-2xl bg-primary-foreground/10 p-3">
            <p className="opacity-80">No mês</p>
            <p className="mt-1 font-display text-lg font-bold">
              {formatBRL(totalMes)}
            </p>
          </div>
        </div>
      </section>

      {state.goals.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">Suas metas</h2>
            <Link to="/metas" className="text-sm font-semibold text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="space-y-3">
            {state.goals.slice(0, 3).map((g) => {
              const spent = g.category === "total" ? totalMes : (byCat[g.category] ?? 0);
              const pct = Math.min(100, (spent / g.monthlyLimit) * 100);
              const over = spent > g.monthlyLimit;
              const label =
                g.category === "total"
                  ? "Total do mês"
                  : CATEGORIES.find((c) => c.id === g.category)?.label;
              const emoji =
                g.category === "total"
                  ? "💯"
                  : CATEGORIES.find((c) => c.id === g.category)?.emoji;
              return (
                <li key={g.id} className="rounded-2xl border-2 border-border bg-card p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBRL(spent)} de {formatBRL(g.monthlyLimit)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <h2 className="mb-4 font-display text-xl font-bold text-foreground">
        O que você quer fazer?
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {visible.map(({ to, label, Icon, primary, highlight }) => (
          <Link
            key={to}
            to={to}
            className={`group flex flex-col items-center justify-center gap-3 rounded-3xl border-2 p-5 text-center transition-all hover:-translate-y-0.5 active:animate-press ${
              primary
                ? "border-primary bg-card shadow-soft hover:bg-secondary"
                : highlight
                  ? "border-accent bg-gradient-to-br from-accent/10 to-accent/5 shadow-soft hover:border-accent hover:from-accent/20"
                  : "border-border bg-card hover:border-primary hover:bg-secondary"
            }`}
          >
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${
                primary
                  ? "bg-gradient-primary text-primary-foreground"
                  : highlight
                    ? "bg-gradient-gold text-white shadow-soft"
                    : "bg-secondary text-primary"
              }`}
            >
              <Icon className="h-8 w-8" strokeWidth={2.2} />
            </div>
            <span className="font-display text-base font-semibold leading-tight text-foreground sm:text-lg">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
