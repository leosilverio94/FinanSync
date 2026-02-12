import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ExpenseChart({ transactions }) {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      month: format(date, 'MMM', { locale: ptBR }),
      start: startOfMonth(date),
      end: endOfMonth(date),
      income: 0,
      expense: 0
    };
  });

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    const monthData = last6Months.find(m => tDate >= m.start && tDate <= m.end);
    if (monthData) {
      if (t.type === 'income') {
        monthData.income += t.amount;
      } else if (t.type === 'expense') {
        monthData.expense += t.amount;
      }
    }
  });

  const data = last6Months.map(m => ({
    month: m.month.charAt(0).toUpperCase() + m.month.slice(1),
    Receitas: m.income,
    Despesas: m.expense
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl border border-slate-100">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className={`font-medium ${item.dataKey === 'Receitas' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {item.name}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}