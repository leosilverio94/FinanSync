import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react";

const categoryLabels = {
  salary: 'Salário',
  food: 'Alimentação',
  transport: 'Transporte',
  housing: 'Moradia',
  health: 'Saúde',
  education: 'Educação',
  entertainment: 'Lazer',
  shopping: 'Compras',
  investment: 'Investimento',
  bills: 'Contas',
  other: 'Outros'
};

const categoryColors = {
  salary: 'bg-emerald-100 text-emerald-700',
  food: 'bg-orange-100 text-orange-700',
  transport: 'bg-blue-100 text-blue-700',
  housing: 'bg-purple-100 text-purple-700',
  health: 'bg-rose-100 text-rose-700',
  education: 'bg-cyan-100 text-cyan-700',
  entertainment: 'bg-pink-100 text-pink-700',
  shopping: 'bg-amber-100 text-amber-700',
  investment: 'bg-indigo-100 text-indigo-700',
  bills: 'bg-slate-100 text-slate-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function RecentTransactions({ transactions }) {
  const recent = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const getIcon = (type) => {
    if (type === 'income') return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (type === 'expense') return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
    return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recent.length > 0 ? recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  {getIcon(t.type)}
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{t.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">
                      {format(new Date(t.date), "dd MMM", { locale: ptBR })}
                    </span>
                    <Badge variant="secondary" className={`text-xs px-2 py-0 ${categoryColors[t.category] || categoryColors.other}`}>
                      {categoryLabels[t.category] || t.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
              </p>
            </div>
          )) : (
            <div className="h-32 flex items-center justify-center text-slate-400">
              Nenhuma transação registrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}