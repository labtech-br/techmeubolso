import { useEffect, useState } from "react";

export type Category =
  | "alimentacao"
  | "transporte"
  | "lazer"
  | "moradia"
  | "saude"
  | "outros";

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "alimentacao", label: "Alimentação", emoji: "🍎" },
  { id: "transporte", label: "Transporte", emoji: "🚌" },
  { id: "lazer", label: "Lazer", emoji: "🎉" },
  { id: "moradia", label: "Moradia", emoji: "🏠" },
  { id: "saude", label: "Saúde", emoji: "💊" },
  { id: "outros", label: "Outros", emoji: "🧾" },
];

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  emoji: string;
  balance: number; // saldo inicial
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  dueDay: number; // dia do mês 1-31
  accountId?: string;
  paidMonths: string[]; // ["2025-04", ...]
}

export interface Goal {
  id: string;
  category: Category | "total";
  monthlyLimit: number;
}

export interface AccessibilitySettings {
  fontScale: number; // 1, 1.15, 1.3
  highContrast: boolean;
  reduceMotion: boolean;
}

export interface AppState {
  salary: number;
  expenses: Expense[];
  onboarded: boolean;
  accounts: Account[];
  fixedExpenses: FixedExpense[];
  goals: Goal[];
  achievements: string[]; // ids desbloqueadas
  accessibility: AccessibilitySettings;
}

const KEY = "meu-bolso-state-v1";

const initial: AppState = {
  salary: 0,
  expenses: [],
  onboarded: false,
  accounts: [],
  fixedExpenses: [],
  goals: [],
  achievements: [],
  accessibility: { fontScale: 1, highContrast: false, reduceMotion: false },
};

function read(): AppState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

function write(s: AppState) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("meu-bolso:update"));
}

export function useAppState() {
  const [state, setState] = useState<AppState>(read);

  useEffect(() => {
    const h = () => setState(read());
    window.addEventListener("meu-bolso:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("meu-bolso:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const update = (patch: Partial<AppState>) => {
    const next = { ...read(), ...patch };
    write(next);
    setState(next);
  };

  const addExpense = (e: Omit<Expense, "id" | "date"> & { date?: string }) => {
    const cur = read();
    const exp: Expense = {
      id: crypto.randomUUID(),
      amount: e.amount,
      category: e.category,
      description: e.description,
      date: e.date ?? new Date().toISOString(),
      accountId: e.accountId,
    };
    write({ ...cur, expenses: [exp, ...cur.expenses] });
    setState({ ...cur, expenses: [exp, ...cur.expenses] });
  };

  const removeExpense = (id: string) => {
    const cur = read();
    const next = { ...cur, expenses: cur.expenses.filter((x) => x.id !== id) };
    write(next);
    setState(next);
  };

  const addAccount = (a: Omit<Account, "id">) => {
    const cur = read();
    const acc: Account = { ...a, id: crypto.randomUUID() };
    const next = { ...cur, accounts: [...cur.accounts, acc] };
    write(next); setState(next);
  };
  const removeAccount = (id: string) => {
    const cur = read();
    const next = { ...cur, accounts: cur.accounts.filter((x) => x.id !== id) };
    write(next); setState(next);
  };

  const addFixed = (f: Omit<FixedExpense, "id" | "paidMonths">) => {
    const cur = read();
    const fx: FixedExpense = { ...f, id: crypto.randomUUID(), paidMonths: [] };
    const next = { ...cur, fixedExpenses: [...cur.fixedExpenses, fx] };
    write(next); setState(next);
  };
  const removeFixed = (id: string) => {
    const cur = read();
    const next = { ...cur, fixedExpenses: cur.fixedExpenses.filter((x) => x.id !== id) };
    write(next); setState(next);
  };
  const togglePaidFixed = (id: string, monthKey: string) => {
    const cur = read();
    const target = cur.fixedExpenses.find((f) => f.id === id);
    if (!target) return;
    const wasPaid = target.paidMonths.includes(monthKey);
    const fixedExpenses = cur.fixedExpenses.map((f) =>
      f.id === id
        ? {
            ...f,
            paidMonths: wasPaid
              ? f.paidMonths.filter((m) => m !== monthKey)
              : [...f.paidMonths, monthKey],
          }
        : f,
    );
    // Sincroniza com o saldo: cria/remove um Expense vinculado ao gasto fixo
    const tag = `__fixed:${id}:${monthKey}`;
    let expenses = cur.expenses;
    if (wasPaid) {
      expenses = expenses.filter((e) => e.description !== tag);
    } else {
      const exp: Expense = {
        id: crypto.randomUUID(),
        amount: target.amount,
        category: target.category,
        description: tag,
        date: new Date().toISOString(),
        accountId: target.accountId,
      };
      expenses = [exp, ...expenses];
    }
    const next = { ...cur, fixedExpenses, expenses };
    write(next); setState(next);
  };

  const setGoal = (category: Category | "total", monthlyLimit: number) => {
    const cur = read();
    const exists = cur.goals.find((g) => g.category === category);
    const goals = exists
      ? cur.goals.map((g) => (g.category === category ? { ...g, monthlyLimit } : g))
      : [...cur.goals, { id: crypto.randomUUID(), category, monthlyLimit }];
    const next = { ...cur, goals };
    write(next); setState(next);
  };
  const removeGoal = (category: Category | "total") => {
    const cur = read();
    const next = { ...cur, goals: cur.goals.filter((g) => g.category !== category) };
    write(next); setState(next);
  };

  const setAccessibility = (patch: Partial<AccessibilitySettings>) => {
    const cur = read();
    const next = { ...cur, accessibility: { ...cur.accessibility, ...patch } };
    write(next); setState(next);
  };

  const unlockAchievement = (id: string) => {
    const cur = read();
    if (cur.achievements.includes(id)) return;
    const next = { ...cur, achievements: [...cur.achievements, id] };
    write(next); setState(next);
  };

  const reset = () => {
    write(initial);
    setState(initial);
  };

  return {
    state, update, addExpense, removeExpense, reset,
    addAccount, removeAccount,
    addFixed, removeFixed, togglePaidFixed,
    setGoal, removeGoal,
    setAccessibility, unlockAchievement,
  };
}

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function totalSpent(expenses: Expense[]) {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

export function spentToday(expenses: Expense[]) {
  const today = new Date().toDateString();
  return expenses
    .filter((e) => new Date(e.date).toDateString() === today)
    .reduce((s, e) => s + e.amount, 0);
}

export function spentThisMonth(expenses: Expense[]) {
  const now = new Date();
  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + e.amount, 0);
}

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function spentByCategory(expenses: Expense[]) {
  const map: Record<string, number> = {};
  for (const e of expenses) map[e.category] = (map[e.category] ?? 0) + e.amount;
  return map;
}

export function spentLastNDays(expenses: Expense[], n = 7) {
  const days: { label: string; total: number; date: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({
      date: d,
      label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      total: 0,
    });
  }
  for (const e of expenses) {
    const ed = new Date(e.date);
    ed.setHours(0, 0, 0, 0);
    const found = days.find((x) => x.date.getTime() === ed.getTime());
    if (found) found.total += e.amount;
  }
  return days;
}

export const ACHIEVEMENTS: { id: string; title: string; description: string; emoji: string; check: (s: AppState) => boolean }[] = [
  { id: "primeiro_gasto", title: "Primeiro passo", description: "Registrou seu primeiro gasto", emoji: "🌱",
    check: (s) => s.expenses.length >= 1 },
  { id: "dez_gastos", title: "Disciplinado", description: "Registrou 10 gastos", emoji: "📒",
    check: (s) => s.expenses.length >= 10 },
  { id: "salario_definido", title: "Tudo no controle", description: "Definiu sua renda mensal", emoji: "💰",
    check: (s) => s.salary > 0 },
  { id: "primeira_meta", title: "Olhar para o futuro", description: "Criou sua primeira meta", emoji: "🎯",
    check: (s) => s.goals.length >= 1 },
  { id: "primeira_conta", title: "Organizado", description: "Cadastrou uma conta", emoji: "🏦",
    check: (s) => s.accounts.length >= 1 },
  { id: "economista", title: "Economista do mês", description: "Gastou menos de 70% da renda no mês", emoji: "🏆",
    check: (s) => s.salary > 0 && spentThisMonth(s.expenses) <= s.salary * 0.7 && s.expenses.length >= 5 },
];
