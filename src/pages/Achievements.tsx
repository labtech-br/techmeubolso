import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import { ACHIEVEMENTS, useAppState } from "@/lib/storage";
import { Lock } from "lucide-react";

export default function Achievements() {
  const { state, unlockAchievement } = useAppState();

  useEffect(() => {
    ACHIEVEMENTS.forEach((a) => {
      if (a.check(state) && !state.achievements.includes(a.id)) {
        unlockAchievement(a.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.expenses.length, state.salary, state.goals.length, state.accounts.length]);

  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id));

  return (
    <AppShell title="Conquistas" showBack>
      <div className="space-y-6">
        <section className="rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-elevated">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
            Suas conquistas
          </p>
          <p className="mt-2 font-display text-4xl font-bold">
            {unlocked.length} <span className="text-2xl opacity-80">/ {ACHIEVEMENTS.length}</span>
          </p>
        </section>

        {unlocked.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">Desbloqueadas</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {unlocked.map((a) => (
                <div key={a.id} className="rounded-2xl border-2 border-primary bg-card p-4 shadow-soft">
                  <div className="text-4xl">{a.emoji}</div>
                  <p className="mt-2 font-display text-lg font-bold">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {locked.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">A conquistar</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {locked.map((a) => (
                <div key={a.id} className="rounded-2xl border-2 border-dashed border-border bg-card p-4 opacity-70">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                    <span className="text-2xl grayscale">{a.emoji}</span>
                  </div>
                  <p className="mt-2 font-display text-lg font-bold">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
