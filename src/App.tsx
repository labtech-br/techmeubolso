import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Home from "./pages/Home.tsx";
import AddExpense from "./pages/AddExpense.tsx";
import Balance from "./pages/Balance.tsx";
import CalculatorPage from "./pages/Calculator.tsx";
import Assistant from "./pages/Assistant.tsx";
import Help from "./pages/Help.tsx";
import RemindersPage from "./pages/Reminders.tsx";
import SettingsPage from "./pages/Settings.tsx";
import Accounts from "./pages/Accounts.tsx";
import FixedExpenses from "./pages/FixedExpenses.tsx";
import Charts from "./pages/Charts.tsx";
import Goals from "./pages/Goals.tsx";
import Achievements from "./pages/Achievements.tsx";
import AccessibilityPage from "./pages/Accessibility.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
