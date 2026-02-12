import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Wallet, PiggyBank } from "lucide-react";

const accountIcons = {
  checking: Building2,
  savings: PiggyBank,
  wallet: Wallet
};

const accountLabels = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  wallet: 'Carteira'
};

export default function AccountsList({ accounts }) {
  const getColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600',
      rose: 'bg-rose-100 text-rose-600'
    };
    return colors[color] || 'bg-slate-100 text-slate-600';
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">Contas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.length > 0 ? accounts.map((account) => {
          const Icon = accountIcons[account.type] || Building2;
          return (
            <div key={account.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${getColor(account.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{account.name}</p>
                  <p className="text-xs text-slate-500">{account.bank || accountLabels[account.type]}</p>
                </div>
              </div>
              <p className={`font-bold ${account.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}
              </p>
            </div>
          );
        }) : (
          <div className="h-32 flex items-center justify-center text-slate-400">
            Nenhuma conta cadastrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}