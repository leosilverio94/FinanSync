import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard as CreditCardIcon } from "lucide-react";

export default function CreditCardWidget({ cards }) {
  const getGradient = (color) => {
    const gradients = {
      black: 'from-slate-800 to-slate-900',
      gold: 'from-amber-400 to-amber-600',
      platinum: 'from-slate-400 to-slate-600',
      blue: 'from-blue-500 to-blue-700',
      green: 'from-emerald-500 to-emerald-700',
      purple: 'from-purple-500 to-purple-700',
      rose: 'from-rose-400 to-rose-600'
    };
    return gradients[color] || 'from-slate-600 to-slate-800';
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">Cartões de Crédito</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cards.length > 0 ? cards.map((card) => {
          const usage = card.limit > 0 ? ((card.current_bill || 0) / card.limit) * 100 : 0;
          return (
            <div key={card.id} className={`p-4 rounded-2xl bg-gradient-to-r ${getGradient(card.color)} text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full transform translate-x-8 -translate-y-8" />
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm opacity-80">{card.bank}</p>
                  <p className="font-semibold">{card.name}</p>
                </div>
                <CreditCardIcon className="w-8 h-8 opacity-80" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Fatura Atual</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.current_bill || 0)}
                  </span>
                </div>
                <Progress value={usage} className="h-2 bg-white/20" />
                <div className="flex justify-between text-xs opacity-70">
                  <span>Limite disponível: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit - (card.current_bill || 0))}</span>
                  <span>{usage.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="h-32 flex items-center justify-center text-slate-400">
            Nenhum cartão cadastrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}