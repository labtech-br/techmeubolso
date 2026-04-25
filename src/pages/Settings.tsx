import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAppState, formatBRL } from "@/lib/storage";
import { useSpeechSettings, useSpeak, isSpeechSupported } from "@/lib/speech";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Accessibility, Volume2 } from "lucide-react";

export default function SettingsPage() {
  const { state, update, reset } = useAppState();
  const { settings: speech, update: updateSpeech } = useSpeechSettings();
  const speakSample = useSpeak();
  const { toast } = useToast();
  const [salary, setSalary] = useState(String(state.salary || ""));

  const save = () => {
    const n = parseFloat(salary.replace(",", "."));
    if (!isFinite(n) || n < 0) return;
    update({ salary: n });
    toast({ title: "Salvo!", description: `Renda definida em ${formatBRL(n)}.` });
  };

  return (
    <AppShell title="Configurações" showBack showSettings={false}>
      <div className="space-y-6">
        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold">Renda mensal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualize sempre que mudar.
          </p>
          <div className="mt-4 flex gap-3">
            <Input
              inputMode="decimal"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="h-14 rounded-2xl border-2 px-4 text-xl font-display"
            />
            <Button className="h-14 rounded-2xl px-6" onClick={save}>
              Salvar
            </Button>
          </div>
        </div>

        {isSpeechSupported() && (
          <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
                <Volume2 className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold">Áudio (ler em voz alta)</h2>
                <p className="text-sm text-muted-foreground">
                  O app pode ler textos para você.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between gap-4 rounded-2xl border-2 border-border p-4">
                <span>
                  <span className="block font-semibold">Ativar leitura por voz</span>
                  <span className="text-sm text-muted-foreground">Mostra o botão 🔊 no app.</span>
                </span>
                <Switch
                  checked={speech.enabled}
                  onCheckedChange={(v) => updateSpeech({ enabled: v })}
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl border-2 border-border p-4">
                <span>
                  <span className="block font-semibold">Ler o saldo automaticamente</span>
                  <span className="text-sm text-muted-foreground">Ao abrir a tela inicial.</span>
                </span>
                <Switch
                  disabled={!speech.enabled}
                  checked={speech.autoSpeakBalance}
                  onCheckedChange={(v) => updateSpeech({ autoSpeakBalance: v })}
                />
              </label>

              <div className="rounded-2xl border-2 border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">Velocidade da fala</span>
                  <span className="text-sm text-muted-foreground">{speech.rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1.2}
                  step={0.05}
                  value={speech.rate}
                  disabled={!speech.enabled}
                  onChange={(e) => updateSpeech({ rate: parseFloat(e.target.value) })}
                  className="w-full accent-primary"
                />
                <Button
                  variant="outline"
                  className="mt-3 h-11 w-full rounded-2xl"
                  disabled={!speech.enabled}
                  onClick={() => speakSample("Olá! Eu sou o Meu Bolso. Vou ler o aplicativo para você.")}
                >
                  Ouvir um exemplo
                </Button>
              </div>
            </div>
          </div>
        )}

        <Link
          to="/acessibilidade"
          className="flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-6 shadow-soft transition-all hover:border-primary"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
            <Accessibility className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Acessibilidade</h2>
            <p className="text-sm text-muted-foreground">
              Tamanho do texto, alto contraste e mais.
            </p>
          </div>
        </Link>

        <div className="rounded-3xl border-2 border-destructive/40 bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold text-destructive">
            Apagar tudo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Remove todos os gastos e reinicia o aplicativo.
          </p>
          <Button
            variant="destructive"
            className="mt-4 h-12 rounded-2xl"
            onClick={() => {
              if (confirm("Tem certeza? Isso apaga tudo.")) {
                reset();
                toast({ title: "Tudo apagado." });
              }
            }}
          >
            Apagar todos os dados
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
