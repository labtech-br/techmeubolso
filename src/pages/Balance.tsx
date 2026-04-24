import AppShell from "@/components/AppShell";
import {
  CATEGORIES,
  Category,
  formatBRL,
  spentThisMonth,
  spentToday,
  useAppState,
} from "@/lib/storage";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/** Paleta de cores curada para combinar com o tema esmeralda */
const CATEGORY_COLORS: Record<Category, string> = {
  alimentacao: "#0d7a5f", // verde esmeralda
  transporte: "#2563eb",  // azul real
  lazer: "#c9a84c",       // dourado (accent)
  moradia: "#7c3aed",     // violeta
  saude: "#e11d48",       // rosa intenso
  outros: "#64748b",      // cinza ardósia
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: { emoji: string; pct: number } }[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-elevated">
      <p className="flex items-center gap-2 font-semibold">
        <span className="text-lg">{d.payload.emoji}</span>
        {d.name}
      </p>
      <p className="mt-1 font-display text-lg font-bold">{formatBRL(d.value)}</p>
      <p className="text-xs text-muted-foreground">{d.payload.pct.toFixed(1)}% do total</p>
    </div>
  );
}

export default function Balance() {
  const { state, removeExpense } = useAppState();

  const labelFor = (description: string, fallback: string) => {
    const m = description.match(/^__fixed:([^:]+):/);
    if (m) {
      const fx = state.fixedExpenses.find((f) => f.id === m[1]);
      return fx ? `${fx.name} (gasto fixo)` : "Gasto fixo";
    }
    return description || fallback;
  };
  const totalMes = spentThisMonth(state.expenses);
  const totalHoje = spentToday(state.expenses);
  const restante = state.salary - totalMes;
  const pct = state.salary > 0 ? Math.min(100, (totalMes / state.salary) * 100) : 0;

  const byCat = CATEGORIES.map((c) => ({
    ...c,
    name: c.label,
    value: state.expenses
      .filter((e) => e.category === (c.id as Category))
      .reduce((s, e) => s + e.amount, 0),
    total: state.expenses
      .filter((e) => e.category === (c.id as Category))
      .reduce((s, e) => s + e.amount, 0),
    pct:
      totalMes > 0
        ? (state.expenses
            .filter((e) => e.category === (c.id as Category))
            .reduce((s, e) => s + e.amount, 0) /
            totalMes) *
          100
        : 0,
  })).filter((c) => c.value > 0);

  return (
    <AppShell title="Meu saldo" showBack>
      <section className="rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-elevated sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
          Sobra deste mês
        </p>
        <p className="mt-2 font-display text-4xl font-bold sm:text-5xl">
          {formatBRL(restante)}
        </p>
        <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-primary-foreground/20">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
          />
        </div>
        <p className="mt-2 text-sm opacity-90">
          Você já usou <strong>{Math.round(pct)}%</strong> do que recebe.
        </p>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">Gastos hoje</p>
          <p className="mt-1 font-display text-2xl font-bold">{formatBRL(totalHoje)}</p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">Renda do mês</p>
          <p className="mt-1 font-display text-2xl font-bold">{formatBRL(state.salary)}</p>
        </div>
      </div>

      {/* Gráfico de rosca por categoria */}
      {byCat.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Gastos por categoria</h2>
          <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-soft sm:p-6">
            {/* Donut Chart */}
            <div className="mx-auto" style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCat}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {byCat.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={CATEGORY_COLORS[entry.id]}
                        style={{ outline: "none" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda / lista detalhada */}
            <div className="mt-4 space-y-2">
              {byCat.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[c.id] }}
                    />
                    <span className="text-xl">{c.emoji}</span>
                    <span className="font-semibold">{c.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {c.pct.toFixed(0)}%
                    </span>
                    <span className="font-display font-bold">{formatBRL(c.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold">Últimos gastos</h2>
        {state.expenses.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
            Nenhum gasto registrado ainda.
          </div>
        ) : (
          <ul className="space-y-2">
            {state.expenses.slice(0, 20).map((e) => {
              const cat = CATEGORIES.find((c) => c.id === e.category)!;
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-4"
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {labelFor(e.description, cat.label)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <span className="font-display font-bold">{formatBRL(e.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExpense(e.id)}
                    aria-label="Remover gasto"
                    className="h-11 w-11 rounded-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
