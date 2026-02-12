import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wallet, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BalanceCard from '../components/dashboard/BalanceCard';
import InvestmentChart from '../components/dashboard/InvestmentChart';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import CreditCardWidget from '../components/dashboard/CreditCardWidget';
import AccountsList from '../components/dashboard/AccountsList';
import RecentTransactions from '../components/dashboard/RecentTransactions';

export default function Dashboard() {
  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 100),
  });

  const { data: investments = [], isLoading: loadingInvestments } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list(),
  });

  const { data: creditCards = [], isLoading: loadingCards } = useQuery({
    queryKey: ['creditCards'],
    queryFn: () => base44.entities.CreditCard.list(),
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const isLoading = loadingTransactions || loadingInvestments || loadingCards || loadingAccounts;

  // Cálculos
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
  const investedAmount = investments.reduce((sum, inv) => sum + (inv.invested_amount || 0), 0);
  const investmentReturn = totalInvestments - investedAmount;
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + (card.current_bill || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyIncome = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'income' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const patrimony = totalBalance + totalInvestments;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Dashboard Financeiro
            </h1>
            <p className="text-slate-500 mt-1">Visão geral das suas finanças</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-slate-600">Patrimônio Total</span>
            <span className="text-lg font-bold text-emerald-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(patrimony)}
            </span>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <BalanceCard
            title="Saldo em Contas"
            value={totalBalance}
            icon={Wallet}
            color="emerald"
            trend={monthlyIncome > monthlyExpenses ? 'up' : 'down'}
            trendValue={`R$ ${Math.abs(monthlyIncome - monthlyExpenses).toLocaleString('pt-BR')}`}
          />
          <BalanceCard
            title="Investimentos"
            value={totalInvestments}
            icon={TrendingUp}
            color="blue"
            trend={investmentReturn >= 0 ? 'up' : 'down'}
            trendValue={`${investmentReturn >= 0 ? '+' : ''}${((investmentReturn / investedAmount) * 100 || 0).toFixed(1)}%`}
          />
          <BalanceCard
            title="Fatura Cartões"
            value={totalCreditUsed}
            icon={CreditCard}
            color="rose"
          />
          <BalanceCard
            title="Receita do Mês"
            value={monthlyIncome}
            icon={PiggyBank}
            color="purple"
          />
        </div>

        {/* Gráficos e Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart transactions={transactions} />
          <InvestmentChart investments={investments} />
        </div>

        {/* Contas, Cartões e Transações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AccountsList accounts={accounts} />
          <CreditCardWidget cards={creditCards} />
          <RecentTransactions transactions={transactions} />
        </div>
      </div>
    </div>
  );
}