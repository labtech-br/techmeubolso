import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, Category, useAppState, formatBRL } from "@/lib/storage";
import VoiceInput from "@/components/VoiceInput";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

export default function AddExpense() {
  const navigate = useNavigate();
  const { state, addExpense, unlockAchievement } = useAppState();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("alimentacao");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState<string | undefined>(undefined);

  const num = parseFloat(amount.replace(",", "."));
  const valid = isFinite(num) && num > 0;

  const handleVoice = (text: string) => {
    const m = text.match(/(\d+[.,]?\d*)/);
    if (m) setAmount(m[1].replace(".", ","));
    setDescription((prev) => (prev ? prev + " " : "") + text);
    const lower = text.toLowerCase();
    const found = CATEGORIES.find((c) =>
      lower.includes(c.label.toLowerCase()) || lower.includes(c.id),
    );
    if (found) setCategory(found.id);
    toast({ title: "Eu ouvi:", description: text });
  };

  const submit = () => {
    if (!valid) return;
    addExpense({ amount: num, category, description: description.trim(), accountId });
    unlockAchievement("primeiro_gasto");
    if (state.salary > 0) unlockAchievement("salario_definido");
    toast({
      title: "Gasto adicionado!",
      description: `${formatBRL(num)} em ${CATEGORIES.find((c) => c.id === category)?.label}.`,
    });
    navigate("/");
  };

  return (
    <AppShell title="Adicionar gasto" showBack>
      <div className="space-y-6">
        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <label htmlFor="amount" className="mb-2 block text-base font-semibold">
            Quanto você gastou?
          </label>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-16 rounded-2xl border-2 px-5 text-3xl font-display font-bold"
          />
          {valid && (
            <p className="mt-2 text-sm text-muted-foreground">
              Você vai registrar <strong className="text-primary">{formatBRL(num)}</strong>
            </p>
          )}
        </div>

        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <p className="mb-3 text-base font-semibold">Em qual categoria?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={active}
                  className={`relative rounded-2xl border-2 p-4 text-center transition-all active:animate-press ${
                    active
                      ? "border-primary bg-secondary shadow-soft"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {active && (
                    <Check className="absolute right-2 top-2 h-5 w-5 text-primary" />
                  )}
                  <div className="text-3xl">{c.emoji}</div>
                  <p className="mt-1 text-sm font-semibold">{c.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {state.accounts.length > 0 && (
          <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
            <p className="mb-3 text-base font-semibold">De qual conta saiu? (opcional)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setAccountId(undefined)}
                className={`rounded-2xl border-2 p-3 text-sm font-semibold ${!accountId ? "border-primary bg-secondary" : "border-border"}`}
              >
                <div className="text-2xl">—</div>Nenhuma
              </button>
              {state.accounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAccountId(a.id)}
                  className={`rounded-2xl border-2 p-3 text-sm font-semibold ${accountId === a.id ? "border-primary bg-secondary" : "border-border"}`}
                >
                  <div className="text-2xl">{a.emoji}</div>{a.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <label htmlFor="desc" className="mb-2 block text-base font-semibold">
            Descrição (opcional)
          </label>
          <Input
            id="desc"
            placeholder="Ex: padaria da esquina"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={120}
            className="h-14 rounded-2xl border-2 px-5 text-lg"
          />
          <div className="mt-4">
            <VoiceInput
              onResult={handleVoice}
              label="Falar o gasto"
              className="w-full justify-center"
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Ex.: "Gastei 25 reais com transporte"
            </p>
          </div>
        </div>

        <Button
          size="lg"
          disabled={!valid}
          onClick={submit}
          className="h-16 w-full rounded-2xl text-lg font-bold"
        >
          Salvar gasto
        </Button>
      </div>
    </AppShell>
  );
}
