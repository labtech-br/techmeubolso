import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, MicOff, X, Check } from "lucide-react";
import { CATEGORIES, Category, useAppState, formatBRL } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Rotas onde o FAB NÃO deve aparecer
const HIDDEN_ROUTES = ["/", "/bem-vindo", "/adicionar"];

type SR = {
  new (): SR;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (e: any) => void;
  onend: () => void;
  onerror: (e: any) => void;
};

function parseSpeech(text: string): { amount?: number; category?: Category; description: string } {
  const lower = text.toLowerCase();
  const m = lower.match(/(\d+[.,]?\d*)/);
  const amount = m ? parseFloat(m[1].replace(",", ".")) : undefined;
  const found = CATEGORIES.find(
    (c) => lower.includes(c.label.toLowerCase()) || lower.includes(c.id),
  );
  return { amount, category: found?.id, description: text };
}

export default function VoiceFab() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { addExpense, unlockAchievement, state } = useAppState();
  const { toast } = useToast();

  const [supported, setSupported] = useState(true);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ReturnType<typeof parseSpeech> | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const r = new SR() as SR;
    r.lang = "pt-BR";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) {
        setTranscript(text);
        setParsed(parseSpeech(text));
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
  }, []);

  if (!supported) return null;
  if (HIDDEN_ROUTES.includes(pathname)) return null;

  const startListening = () => {
    setTranscript("");
    setParsed(null);
    try {
      recRef.current?.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  };

  const openModal = () => {
    setOpen(true);
    setTimeout(startListening, 150);
  };

  const closeModal = () => {
    stopListening();
    setOpen(false);
    setTranscript("");
    setParsed(null);
  };

  const confirm = () => {
    if (!parsed?.amount || parsed.amount <= 0) return;
    const category: Category = parsed.category ?? "outros";
    addExpense({
      amount: parsed.amount,
      category,
      description: parsed.description,
    });
    unlockAchievement("primeiro_gasto");
    if (state.salary > 0) unlockAchievement("salario_definido");
    toast({
      title: "Gasto adicionado por voz!",
      description: `${formatBRL(parsed.amount)} em ${CATEGORIES.find((c) => c.id === category)?.label}.`,
    });
    closeModal();
  };

  const goManual = () => {
    closeModal();
    navigate("/adicionar");
  };

  const canConfirm = !!parsed?.amount && parsed.amount > 0;

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={openModal}
        aria-label="Adicionar gasto por voz"
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated transition-transform hover:scale-105 active:scale-95 sm:h-[72px] sm:w-[72px]"
      >
        <Mic className="h-7 w-7" />
        <span className="sr-only">Adicionar gasto por voz</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Adicionar gasto por voz"
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-sm sm:items-center"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl border-2 border-border bg-card p-6 shadow-elevated animate-fade-in-up sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                Falar um gasto
              </h2>
              <button
                onClick={closeModal}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              aria-pressed={listening}
              className={cn(
                "mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 transition-all",
                listening
                  ? "border-destructive bg-destructive/10 animate-pulse-glow"
                  : "border-primary bg-secondary hover:bg-primary/10",
              )}
            >
              {listening ? (
                <MicOff className="h-12 w-12 text-destructive" />
              ) : (
                <Mic className="h-12 w-12 text-primary" />
              )}
            </button>

            <p className="mt-3 text-center text-sm text-muted-foreground">
              {listening
                ? "Estou ouvindo… fale agora."
                : transcript
                  ? "Toque no microfone para gravar de novo."
                  : 'Ex.: "Gastei 25 reais com transporte"'}
            </p>

            {transcript && (
              <div className="mt-5 rounded-2xl border-2 border-border bg-secondary/40 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Eu ouvi
                </p>
                <p className="mt-1 text-base text-foreground">{transcript}</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-card p-3">
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-lg font-display font-bold text-foreground">
                      {parsed?.amount
                        ? formatBRL(parsed.amount)
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-card p-3">
                    <p className="text-xs text-muted-foreground">Categoria</p>
                    <p className="text-lg font-semibold text-foreground">
                      {parsed?.category
                        ? `${CATEGORIES.find((c) => c.id === parsed.category)?.emoji} ${CATEGORIES.find((c) => c.id === parsed.category)?.label}`
                        : "🧾 Outros"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <Button
                size="lg"
                disabled={!canConfirm}
                onClick={confirm}
                className="h-14 w-full rounded-2xl text-base font-bold"
              >
                <Check className="mr-1 h-5 w-5" />
                Salvar gasto
              </Button>
              <Button
                variant="ghost"
                onClick={goManual}
                className="h-12 w-full rounded-2xl text-sm"
              >
                Preencher manualmente
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
