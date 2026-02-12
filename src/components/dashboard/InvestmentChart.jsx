import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const LABELS = {
  stocks: 'Ações',
  fixed_income: 'Renda Fixa',
  funds: 'Fundos',
  crypto: 'Cripto',
  real_estate: 'Imóveis',
  savings: 'Poupança',
  other: 'Outros'
};

export default function InvestmentChart({ investments }) {
  const data = investments.reduce((acc, inv) => {
    const existing = acc.find(item => item.name === LABELS[inv.type] || item.name === inv.type);
    if (existing) {
      existing.value += inv.current_value || 0;
    } else {
      acc.push({ name: LABELS[inv.type] || inv.type, value: inv.current_value || 0 });
    }
    return acc;
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-xl border border-slate-100">
          <p className="font-semibold text-slate-800">{item.name}</p>
          <p className="text-emerald-600 font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
          </p>
          <p className="text-xs text-slate-400">{((item.value / total) * 100).toFixed(1)}% do total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">Distribuição de Investimentos</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-slate-400">
            Nenhum investimento cadastrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}