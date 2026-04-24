import AppShell from "@/components/AppShell";
import { CATEGORIES, formatBRL, spentLastNDays, useAppState } from "@/lib/storage";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#064e3b", "#0d7a5f", "#2dd4a8", "#c9a84c", "#9b4423", "#5a8a5c"];

export default function Charts() {
  const { state } = useAppState();

  const byCat = CATEGORIES.map((c, i) => ({
    name: c.label,
    value: state.expenses.filter((e) => e.category === c.id).reduce((s, e) => s + e.amount, 0),
    color: COLORS[i % COLORS.length],
  })).filter((x) => x.value > 0);

  const last7 = spentLastNDays(state.expenses, 7).map((d) => ({
    name: d.label,
    Gasto: Math.round(d.total * 100) / 100,
  }));

  const total = byCat.reduce((s, c) => s + c.value, 0);

  return (
    <AppShell title="Gráficos" showBack>
      <div className="space-y-6">
        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 font-display text-xl font-bold">Últimos 7 dias</h2>
          {last7.every((d) => d.Gasto === 0) ? (
            <p className="py-10 text-center text-muted-foreground">
              Nenhum gasto na última semana.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
                  <Tooltip
                    formatter={(v: number) => formatBRL(v)}
                    contentStyle={{ borderRadius: 12, border: "2px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="Gasto" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 font-display text-xl font-bold">Por categoria</h2>
          {byCat.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              Adicione gastos para ver o gráfico.
            </p>
          ) : (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCat}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {byCat.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatBRL(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2">
                {byCat.map((c) => (
                  <li key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                      <span className="font-semibold">{c.name}</span>
                    </div>
                    <span className="font-display font-bold">
                      {formatBRL(c.value)}{" "}
                      <span className="text-muted-foreground">
                        ({Math.round((c.value / total) * 100)}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
