import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, Category, useAppState, formatBRL, monthKey } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Check, AlertCircle, Calendar } from "lucide-react";

export default function FixedExpenses() {
  const { state, addFixed, removeFixed, togglePaidFixed } = useAppState();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("moradia");
  const [dueDay, setDueDay] = useState("5");

  const submit = () => {
    const n = parseFloat(amount.replace(",", "."));
    const d = parseInt(dueDay, 10);
    if (!name.trim() || !isFinite(n) || n <= 0 || !isFinite(d) || d < 1 || d > 31) return;
    addFixed({ name: name.trim(), amount: n, category, dueDay: d });
    setName(""); setAmount(""); setDueDay("5");
    toast({ title: "Gasto fixo cadastrado!" });
  };

  const mk = monthKey();
  const today = new Date().getDate();
  const totalMes = state.fixedExpenses.reduce((s, f) => s + f.amount, 0);
  const pagosMes = state.fixedExpenses.filter((f) => f.paidMonths.includes(mk)).reduce((s, f) => s + f.amount, 0);

  return (
    <AppShell title="Gastos fixos" showBack>
      <div className="space-y-6">
        <section className="rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-elevated">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
            Total fixo do mês
          </p>
          <p className="mt-2 font-display text-4xl font-bold">{formatBRL(totalMes)}</p>
          <p className="mt-2 text-sm opacity-90">
            Já pagou: <strong>{formatBRL(pagosMes)}</strong>
          </p>
        </section>

        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 font-display text-xl font-bold">Novo gasto fixo</h2>
          <div className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome (ex: Aluguel, Luz)"
              className="h-14 rounded-2xl border-2 px-4 text-lg"
            />
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Valor mensal"
              className="h-14 rounded-2xl border-2 px-4 text-lg font-display"
            />
            <div>
              <p className="mb-2 text-sm font-semibold">Categoria</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`rounded-2xl border-2 p-3 text-center text-sm font-semibold ${category === c.id ? "border-primary bg-secondary" : "border-border bg-card"}`}
                  >
                    <div className="text-xl">{c.emoji}</div>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Dia do vencimento</label>
              <Input
                inputMode="numeric"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value.replace(/\D/g, ""))}
                placeholder="5"
                className="h-14 rounded-2xl border-2 px-4 text-lg font-display"
              />
            </div>
            <Button onClick={submit} className="h-14 w-full rounded-2xl text-base">
              <Plus className="mr-2 h-5 w-5" /> Cadastrar
            </Button>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Suas contas mensais</h2>
          {state.fixedExpenses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
              Nenhum gasto fixo cadastrado.
            </div>
          ) : (
            <ul className="space-y-2">
              {state.fixedExpenses.map((f) => {
                const cat = CATEGORIES.find((c) => c.id === f.category)!;
                const paid = f.paidMonths.includes(mk);
                const overdue = !paid && f.dueDay < today;
                const dueSoon = !paid && f.dueDay >= today && f.dueDay - today <= 5;
                return (
                  <li
                    key={f.id}
                    className={`flex items-center gap-3 rounded-2xl border-2 bg-card p-4 ${overdue ? "border-destructive/50" : "border-border"}`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{f.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> Dia {f.dueDay}
                        {overdue && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-destructive"><AlertCircle className="h-3 w-3" /> Atrasado</span>}
                        {dueSoon && <span className="ml-2 rounded-full bg-warning/20 px-2 py-0.5 text-warning">Vence em breve</span>}
                      </p>
                    </div>
                    <span className="font-display font-bold">{formatBRL(f.amount)}</span>
                    <Button
                      variant={paid ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePaidFixed(f.id, mk)}
                      className="h-10 rounded-full"
                    >
                      <Check className="mr-1 h-4 w-4" /> {paid ? "Pago" : "Pagar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFixed(f.id)}
                      className="h-10 w-10 rounded-full text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
