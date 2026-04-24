import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  Category,
  formatBRL,
  spentByCategory,
  spentThisMonth,
  useAppState,
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Target, Trash2 } from "lucide-react";

export default function Goals() {
  const { state, setGoal, removeGoal, unlockAchievement } = useAppState();
  const { toast } = useToast();
  const [cat, setCat] = useState<Category | "total">("total");
  const [limit, setLimit] = useState("");

  const submit = () => {
    const n = parseFloat(limit.replace(",", "."));
    if (!isFinite(n) || n <= 0) return;
    setGoal(cat, n);
    unlockAchievement("primeira_meta");
    setLimit("");
    toast({ title: "Meta salva!" });
  };

  const byCat = spentByCategory(state.expenses);
  const totalMes = spentThisMonth(state.expenses);

  return (
    <AppShell title="Metas de gastos" showBack>
      <div className="space-y-6">
        <p className="text-base text-muted-foreground">
          Defina o quanto você quer gastar no máximo, total ou por categoria.
        </p>

        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 font-display text-xl font-bold">Nova meta</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold">Categoria</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setCat("total")}
                  className={`rounded-2xl border-2 p-3 text-sm font-semibold ${cat === "total" ? "border-primary bg-secondary" : "border-border"}`}
                >
                  <div className="text-xl">💯</div>Total do mês
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={`rounded-2xl border-2 p-3 text-sm font-semibold ${cat === c.id ? "border-primary bg-secondary" : "border-border"}`}
                  >
                    <div className="text-xl">{c.emoji}</div>{c.label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              inputMode="decimal"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Valor máximo no mês"
              className="h-14 rounded-2xl border-2 px-4 text-lg font-display"
            />
            <Button onClick={submit} className="h-14 w-full rounded-2xl text-base">
              <Target className="mr-2 h-5 w-5" /> Salvar meta
            </Button>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Suas metas</h2>
          {state.goals.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
              Nenhuma meta criada ainda.
            </div>
          ) : (
            <ul className="space-y-3">
              {state.goals.map((g) => {
                const spent = g.category === "total" ? totalMes : (byCat[g.category] ?? 0);
                const pct = Math.min(100, (spent / g.monthlyLimit) * 100);
                const over = spent > g.monthlyLimit;
                const label = g.category === "total"
                  ? "Total do mês"
                  : CATEGORIES.find((c) => c.id === g.category)?.label;
                const emoji = g.category === "total" ? "💯" : CATEGORIES.find((c) => c.id === g.category)?.emoji;
                return (
                  <li key={g.id} className="rounded-2xl border-2 border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBRL(spent)} de {formatBRL(g.monthlyLimit)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGoal(g.category)}
                        className="h-10 w-10 rounded-full text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {over && (
                      <p className="mt-2 text-sm font-semibold text-destructive">
                        Você passou da meta em {formatBRL(spent - g.monthlyLimit)}.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
