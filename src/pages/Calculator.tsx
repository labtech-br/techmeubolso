import { useState } from "react";
import AppShell from "@/components/AppShell";

const KEYS: (string | number)[][] = [
  ["C", "⌫", "%", "÷"],
  [7, 8, 9, "×"],
  [4, 5, 6, "−"],
  [1, 2, 3, "+"],
  [0, ",", "="],
];

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");

  const press = (k: string | number) => {
    setDisplay((cur) => {
      const s = String(k);
      if (s === "C") return "0";
      if (s === "⌫") return cur.length <= 1 ? "0" : cur.slice(0, -1);
      if (s === "=") {
        try {
          const expr = cur
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/−/g, "-")
            .replace(/,/g, ".")
            // x% => (x/100); a+b% => a+(a*b/100); a-b% => a-(a*b/100)
            .replace(/(\d+(?:\.\d+)?)([+\-])(\d+(?:\.\d+)?)%/g, "$1$2($1*$3/100)")
            .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
          // eslint-disable-next-line no-new-func
          const r = Function(`"use strict"; return (${expr})`)();
          if (!isFinite(r)) return "Erro";
          return String(Math.round(r * 100) / 100).replace(".", ",");
        } catch {
          return "Erro";
        }
      }
      if (cur === "0" && /[0-9]/.test(s)) return s;
      if (cur === "Erro") return /[0-9]/.test(s) ? s : "0";
      return cur + s;
    });
  };

  return (
    <AppShell title="Calculadora" showBack>
      <div className="mx-auto max-w-md">
        <div
          className="rounded-3xl bg-gradient-primary p-6 text-right text-primary-foreground shadow-elevated"
          aria-live="polite"
        >
          <p className="break-all font-display text-5xl font-bold">{display}</p>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Dica: use <strong>%</strong> para porcentagem. Ex: 200+10% = 220.
        </p>
        <div className="mt-6 space-y-3">
          {KEYS.map((row, ri) => (
            <div key={ri} className="grid grid-cols-4 gap-3">
              {row.map((k, i) => {
            const isOp = ["÷", "×", "−", "+", "="].includes(String(k));
            const isUtil = ["C", "⌫", "%"].includes(String(k));
                const isEquals = String(k) === "=";
            return (
              <button
                    key={i}
                onClick={() => press(k)}
                    className={`h-16 rounded-2xl border-2 text-2xl font-display font-bold transition-all active:animate-press sm:h-20 sm:text-3xl ${
                      isEquals ? "col-span-2" : ""
                    } ${
                  isOp
                    ? "border-primary bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
                    : isUtil
                      ? "border-accent bg-accent text-accent-foreground hover:opacity-90"
                      : "border-border bg-card text-foreground hover:border-primary hover:bg-secondary"
                }`}
                aria-label={String(k)}
              >
                {k}
              </button>
            );
              })}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
