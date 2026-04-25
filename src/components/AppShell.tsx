import { ReactNode, useEffect, useState, useRef } from "react";
import { ArrowLeft, Settings, Bell, BellRing, X, Volume2, VolumeX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState, spentThisMonth, formatBRL } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { isSpeechSupported, stopSpeaking, useSpeak, useSpeechSettings } from "@/lib/speech";

interface Props {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
}

export default function AppShell({ children, title, showBack, showSettings = true }: Props) {
  const navigate = useNavigate();
  const { state } = useAppState();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const speak = useSpeak();
  const { settings: speechSettings } = useSpeechSettings();
  const [readingScreen, setReadingScreen] = useState(false);

  const readScreen = () => {
    if (readingScreen) {
      stopSpeaking();
      setReadingScreen(false);
      return;
    }
    const el = mainRef.current;
    if (!el) return;
    // Captura texto visível da tela, ignorando ícones e botões repetidos
    const text = (el.innerText || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);
    if (!text) return;
    const intro = title ? `${title}. ` : "";
    setReadingScreen(true);
    speak(intro + text);
    setTimeout(() => setReadingScreen(false), Math.max(2000, text.length * 80));
  };

  const totalMes = spentThisMonth(state.expenses);
  const restante = state.salary - totalMes;
  const pctGasto = state.salary > 0 ? (totalMes / state.salary) * 100 : 0;

  // Gera notificações dinâmicas com base nos dados
  const notifications: { id: string; icon: string; text: string; type: "info" | "warning" | "success" }[] = [];
  if (pctGasto >= 90) {
    notifications.push({ id: "over90", icon: "🚨", text: `Atenção! Você já usou ${pctGasto.toFixed(0)}% do salário este mês.`, type: "warning" });
  } else if (pctGasto >= 70) {
    notifications.push({ id: "over70", icon: "⚠️", text: `Cuidado: ${pctGasto.toFixed(0)}% do salário já foi gasto.`, type: "warning" });
  }
  if (restante > 0 && pctGasto < 50) {
    notifications.push({ id: "good", icon: "🎉", text: `Ótimo! Ainda sobram ${formatBRL(restante)} este mês.`, type: "success" });
  }
  if (state.goals.length > 0) {
    const overGoals = state.goals.filter(g => {
      const spent = g.category === "total" ? totalMes : 0;
      return spent > g.monthlyLimit;
    });
    if (overGoals.length > 0) {
      notifications.push({ id: "goals", icon: "🎯", text: `${overGoals.length} meta(s) ultrapassada(s) este mês.`, type: "warning" });
    }
  }
  if (notifications.length === 0) {
    notifications.push({ id: "empty", icon: "✅", text: "Tudo tranquilo! Nenhum alerta no momento.", type: "info" });
  }

  // Fecha o painel ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${(state.accessibility?.fontScale ?? 1) * 100}%`;
    root.classList.toggle("hc", !!state.accessibility?.highContrast);
    root.classList.toggle("rm", !!state.accessibility?.reduceMotion);
  }, [state.accessibility]);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            {showBack ? (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate(-1)}
                className="h-12 gap-2 px-3 text-base"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            ) : (
              <Link to="/app" className="flex items-center gap-2">
                <img
                  src="/logo-sm.jpg"
                  alt="Meu Bolso"
                  width={44}
                  height={44}
                  decoding="async"
                  className="h-11 w-11 rounded-2xl shadow-soft object-cover"
                />
                <span className="font-display text-xl font-bold text-foreground">
                  Meu Bolso
                </span>
              </Link>
            )}
            {title && (
              <h1 className="ml-2 hidden text-xl font-display font-semibold sm:block">
                {title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Notificações */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-foreground/70 hover:bg-secondary transition-colors"
                aria-label="Notificações"
              >
                {notifOpen ? <BellRing className="h-5 w-5 text-primary" /> : <Bell className="h-5 w-5" />}
                {notifications.some(n => n.type === "warning") && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
                )}
              </button>

              {/* Painel de notificações */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-border bg-card shadow-elevated z-50 animate-fade-in-up overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <h3 className="font-display text-base font-bold text-foreground">Notificações</h3>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary text-muted-foreground"
                      aria-label="Fechar notificações"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="max-h-64 overflow-y-auto divide-y divide-border/40">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors ${
                          n.type === "warning" ? "bg-destructive/5" : n.type === "success" ? "bg-primary/5" : ""
                        }`}
                      >
                        <span className="mt-0.5 text-lg flex-shrink-0">{n.icon}</span>
                        <span className="text-foreground/90 leading-snug">{n.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/lembretes"
                    className="block border-t border-border/60 px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-secondary/50 transition-colors"
                    onClick={() => setNotifOpen(false)}
                  >
                    Gerenciar lembretes →
                  </Link>
                </div>
              )}
            </div>

            {showSettings && (
              <Link
                to="/configuracoes"
                className="flex h-11 w-11 items-center justify-center rounded-full text-foreground/70 hover:bg-secondary"
                aria-label="Configurações"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
        {title && (
          <div className="mx-auto max-w-3xl px-4 pb-3 sm:hidden">
            <h1 className="text-2xl font-display font-bold">{title}</h1>
          </div>
        )}
      </header>
      <main ref={mainRef} className="mx-auto max-w-3xl px-4 py-6 sm:py-10 animate-fade-in-up">
        {children}
      </main>
      <footer className="mx-auto max-w-3xl px-4 pb-10 pt-4 text-center text-sm text-muted-foreground">
        Feito com cuidado para você cuidar do seu bolso 💚
      </footer>

      {/* Botão flutuante "Ler tela" */}
      {isSpeechSupported() && speechSettings.enabled && (
        <button
          type="button"
          onClick={readScreen}
          aria-label={readingScreen ? "Parar leitura da tela" : "Ler a tela em voz alta"}
          className={`fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elevated transition-all hover:scale-105 active:scale-95 ${
            readingScreen ? "animate-pulse" : ""
          }`}
        >
          {readingScreen ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
        </button>
      )}
    </div>
  );
}
