import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, formatBRL } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

const EMOJIS = ["🏦", "💵", "💳", "🐷", "📱", "💼"];

export default function Accounts() {
  const { state, addAccount, removeAccount, unlockAchievement } = useAppState();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [emoji, setEmoji] = useState("🏦");

  const submit = () => {
    const n = parseFloat(balance.replace(",", "."));
    if (!name.trim() || !isFinite(n)) return;
    addAccount({ name: name.trim(), emoji, balance: n });
    unlockAchievement("primeira_conta");
    setName(""); setBalance(""); setEmoji("🏦");
    toast({ title: "Conta criada!", description: name });
  };

  return (
    <AppShell title="Minhas contas" showBack>
      <div className="space-y-6">
        <p className="text-base text-muted-foreground">
          Cadastre suas contas (banco, dinheiro, carteira) para organizar de onde sai cada gasto.
        </p>

        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 font-display text-xl font-bold">Nova conta</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Banco do Brasil"
                className="h-14 rounded-2xl border-2 px-4 text-lg"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Saldo inicial</label>
              <Input
                inputMode="decimal"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0,00"
                className="h-14 rounded-2xl border-2 px-4 text-lg font-display"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Ícone</p>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 text-2xl ${emoji === e ? "border-primary bg-secondary" : "border-border"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={submit} className="h-14 w-full rounded-2xl text-base">
              <Plus className="mr-2 h-5 w-5" /> Adicionar conta
            </Button>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-xl font-bold">Suas contas</h2>
          {state.accounts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
              Nenhuma conta cadastrada ainda.
            </div>
          ) : (
            <ul className="space-y-2">
              {state.accounts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4"
                >
                  <span className="text-3xl">{a.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-bold">{a.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Saldo inicial: {formatBRL(a.balance)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAccount(a.id)}
                    aria-label="Remover conta"
                    className="h-11 w-11 rounded-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
