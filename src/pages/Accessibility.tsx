import AppShell from "@/components/AppShell";
import { useAppState } from "@/lib/storage";
import { Type, Contrast, Wind, Check } from "lucide-react";

export default function AccessibilityPage() {
  const { state, setAccessibility } = useAppState();
  const a = state.accessibility;

  return (
    <AppShell title="Acessibilidade" showBack>
      <div className="space-y-6">
        <p className="text-base text-muted-foreground">
          Ajuste o aplicativo para ficar mais confortável de usar.
        </p>

        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <Type className="h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-bold">Tamanho do texto</h2>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { v: 1, label: "Normal", size: "text-base" },
              { v: 1.15, label: "Grande", size: "text-lg" },
              { v: 1.3, label: "Muito grande", size: "text-xl" },
            ].map((opt) => {
              const active = Math.abs(a.fontScale - opt.v) < 0.01;
              return (
                <button
                  key={opt.v}
                  onClick={() => setAccessibility({ fontScale: opt.v })}
                  className={`rounded-2xl border-2 p-4 font-display font-bold ${active ? "border-primary bg-secondary" : "border-border bg-card"} ${opt.size}`}
                >
                  Aa
                  <p className="mt-1 text-sm font-semibold">{opt.label}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <Contrast className="h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-bold">Alto contraste</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cores mais fortes para leitura mais fácil.
          </p>
          <button
            onClick={() => setAccessibility({ highContrast: !a.highContrast })}
            className={`mt-4 flex w-full items-center justify-between rounded-2xl border-2 p-4 ${a.highContrast ? "border-primary bg-secondary" : "border-border"}`}
          >
            <span className="font-display font-bold">
              {a.highContrast ? "Ligado" : "Desligado"}
            </span>
            <span className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${a.highContrast ? "bg-primary" : "bg-muted"}`}>
              <span className={`block h-5 w-5 rounded-full bg-card transition-transform ${a.highContrast ? "translate-x-5" : ""}`} />
            </span>
          </button>
        </section>

        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <Wind className="h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-bold">Reduzir animações</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Movimento menor para evitar tontura.
          </p>
          <button
            onClick={() => setAccessibility({ reduceMotion: !a.reduceMotion })}
            className={`mt-4 flex w-full items-center justify-between rounded-2xl border-2 p-4 ${a.reduceMotion ? "border-primary bg-secondary" : "border-border"}`}
          >
            <span className="font-display font-bold">
              {a.reduceMotion ? "Ligado" : "Desligado"}
            </span>
            <span className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${a.reduceMotion ? "bg-primary" : "bg-muted"}`}>
              <span className={`block h-5 w-5 rounded-full bg-card transition-transform ${a.reduceMotion ? "translate-x-5" : ""}`} />
            </span>
          </button>
        </section>

        <div className="flex items-center gap-2 rounded-2xl border-2 border-primary/40 bg-secondary p-4 text-sm">
          <Check className="h-5 w-5 text-primary" />
          As mudanças são aplicadas automaticamente.
        </div>
      </div>
    </AppShell>
  );
}
