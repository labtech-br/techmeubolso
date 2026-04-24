import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellRing, Calendar } from "lucide-react";
import { spentThisMonth, useAppState, formatBRL } from "@/lib/storage";

const KEY = "meu-bolso-reminders-v1";

type Reminders = { weekly: boolean; monthly: boolean };

function read(): Reminders {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "") || { weekly: true, monthly: true };
  } catch {
    return { weekly: true, monthly: true };
  }
}

export default function RemindersPage() {
  const { state } = useAppState();
  const { toast } = useToast();
  const [r, setR] = useState<Reminders>(read);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  );

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(r));
  }, [r]);

  const askPermission = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") {
      new Notification("Lembretes ativados ✅", {
        body: "Vamos te avisar com carinho sobre seus gastos.",
      });
    }
  };

  const testar = () => {
    const total = spentThisMonth(state.expenses);
    const msg = `Você gastou ${formatBRL(total)} este mês de ${formatBRL(state.salary)}.`;
    if (perm === "granted") {
      new Notification("Resumo do Meu Bolso", { body: msg });
    }
    toast({ title: "Resumo", description: msg });
  };

  return (
    <AppShell title="Lembretes" showBack>
      <div className="space-y-5">
        <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
              <BellRing className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg font-bold">Notificações no aparelho</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {perm === "granted"
                  ? "Notificações estão ativadas."
                  : perm === "denied"
                    ? "Notificações estão bloqueadas pelo navegador."
                    : perm === "unsupported"
                      ? "Seu aparelho não suporta notificações."
                      : "Permita para receber lembretes simpáticos."}
              </p>
              {perm === "default" && (
                <Button className="mt-3 h-12 rounded-xl" onClick={askPermission}>
                  Permitir notificações
                </Button>
              )}
            </div>
          </div>
        </div>

        {[
          { key: "weekly" as const, icon: Bell, title: "Resumo semanal", desc: "Toda segunda você recebe um resumo da semana." },
          { key: "monthly" as const, icon: Calendar, title: "Resumo mensal", desc: "No fim do mês mostramos o total que você gastou." },
        ].map(({ key, icon: Icon, title, desc }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 shadow-soft transition-all hover:border-primary/60"
          >
            <Icon className="h-7 w-7 text-primary" />
            <div className="flex-1">
              <p className="font-display text-lg font-bold">{title}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
            <input
              type="checkbox"
              checked={r[key]}
              onChange={(e) => setR((p) => ({ ...p, [key]: e.target.checked }))}
              className="h-7 w-7 cursor-pointer accent-primary"
              aria-label={title}
            />
          </label>
        ))}

        <Button
          variant="outline"
          className="h-14 w-full rounded-2xl text-base"
          onClick={testar}
        >
          Ver resumo agora
        </Button>
      </div>
    </AppShell>
  );
}
