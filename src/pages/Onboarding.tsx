import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState, formatBRL } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const { update } = useAppState();
  const [salary, setSalary] = useState("");
  const [step, setStep] = useState<0 | 1>(0);

  const num = parseFloat(salary.replace(",", "."));

  const finish = () => {
    update({ salary: isFinite(num) ? num : 0, onboarded: true });
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 py-10">
        <div className="w-full rounded-3xl border-2 border-border bg-card p-7 shadow-elevated animate-fade-in-up sm:p-10">
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Wallet className="h-10 w-10" />
              </div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">
                Olá! Bem-vindo ao Meu Bolso
              </h1>
              <p className="mt-4 text-lg text-muted-foreground text-balance">
                Vamos te ajudar a cuidar do seu dinheiro de um jeito simples,
                em pouquíssimos passos.
              </p>
              <Button
                size="lg"
                className="mt-8 h-16 w-full rounded-2xl text-lg"
                onClick={() => setStep(1)}
              >
                Começar
              </Button>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                Vamos começar
              </p>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Quanto você recebe por mês?
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                Pode ser o salário, aposentadoria ou outra renda. Fica só no seu aparelho.
              </p>
              <div className="mt-6">
                <label htmlFor="salary" className="mb-2 block text-base font-semibold">
                  Valor em reais
                </label>
                <Input
                  id="salary"
                  inputMode="decimal"
                  placeholder="Ex: 2500"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="h-16 rounded-2xl border-2 px-5 text-2xl font-display"
                />
                {isFinite(num) && num > 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Você recebe <strong className="text-primary">{formatBRL(num)}</strong>
                  </p>
                )}
              </div>
              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 flex-1 rounded-2xl text-base"
                  onClick={() => setStep(0)}
                >
                  Voltar
                </Button>
                <Button
                  size="lg"
                  disabled={!isFinite(num) || num <= 0}
                  className="h-14 flex-1 rounded-2xl text-base"
                  onClick={finish}
                >
                  Pronto, começar!
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
