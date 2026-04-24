import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index.tsx";

const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));
const AddExpense = lazy(() => import("./pages/AddExpense.tsx"));
const Balance = lazy(() => import("./pages/Balance.tsx"));
const CalculatorPage = lazy(() => import("./pages/Calculator.tsx"));
const Assistant = lazy(() => import("./pages/Assistant.tsx"));
const Help = lazy(() => import("./pages/Help.tsx"));
const RemindersPage = lazy(() => import("./pages/Reminders.tsx"));
const SettingsPage = lazy(() => import("./pages/Settings.tsx"));
const Accounts = lazy(() => import("./pages/Accounts.tsx"));
const FixedExpenses = lazy(() => import("./pages/FixedExpenses.tsx"));
const Charts = lazy(() => import("./pages/Charts.tsx"));
const Goals = lazy(() => import("./pages/Goals.tsx"));
const Achievements = lazy(() => import("./pages/Achievements.tsx"));
const AccessibilityPage = lazy(() => import("./pages/Accessibility.tsx"));

const App = () => (
  <>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/app" element={<Home />} />
          <Route path="/bem-vindo" element={<Onboarding />} />
          <Route path="/adicionar" element={<AddExpense />} />
          <Route path="/saldo" element={<Balance />} />
          <Route path="/calculadora" element={<CalculatorPage />} />
          <Route path="/assistente" element={<Assistant />} />
          <Route path="/ajuda" element={<Help />} />
          <Route path="/lembretes" element={<RemindersPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/contas" element={<Accounts />} />
          <Route path="/fixos" element={<FixedExpenses />} />
          <Route path="/graficos" element={<Charts />} />
          <Route path="/metas" element={<Goals />} />
          <Route path="/conquistas" element={<Achievements />} />
          <Route path="/acessibilidade" element={<AccessibilityPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
);

export default App;
