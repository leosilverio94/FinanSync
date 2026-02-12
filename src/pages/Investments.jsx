import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, TrendingUp, TrendingDown, Trash2, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const typeLabels = {
  stocks: 'Ações', fixed_income: 'Renda Fixa', funds: 'Fundos', crypto: 'Cripto',
  real_estate: 'Imóveis', savings: 'Poupança', other: 'Outros'
};

const typeColors = {
  stocks: 'bg-blue-100 text-blue-700', fixed_income: 'bg-emerald-100 text-emerald-700',
  funds: 'bg-purple-100 text-purple-700', crypto: 'bg-amber-100 text-amber-700',
  real_estate: 'bg-rose-100 text-rose-700', savings: 'bg-cyan-100 text-cyan-700',
  other: 'bg-slate-100 text-slate-700'
};

export default function Investments() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', type: 'stocks', institution: '', invested_amount: '', current_value: '', purchase_date: format(new Date(), 'yyyy-MM-dd')
  });

  const queryClient = useQueryClient();
  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Investment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      setIsOpen(false);
      setFormData({ name: '', type: 'stocks', institution: '', invested_amount: '', current_value: '', purchase_date: format(new Date(), 'yyyy-MM-dd') });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Investment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['investments'] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      invested_amount: parseFloat(formData.invested_amount),
      current_value: parseFloat(formData.current_value)
    });
  };

  const totalInvested = investments.reduce((s, i) => s + (i.invested_amount || 0), 0);
  const totalCurrent = investments.reduce((s, i) => s + (i.current_value || 0), 0);
  const totalReturn = totalCurrent - totalInvested;
  const returnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Investimentos</h1>
            <p className="text-slate-500">Acompanhe sua carteira de investimentos</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Novo Investimento</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Instituição</Label>
                    <Input value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor Investido</Label>
                    <Input type="number" step="0.01" value={formData.invested_amount} onChange={(e) => setFormData({...formData, invested_amount: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Atual</Label>
                    <Input type="number" step="0.01" value={formData.current_value} onChange={(e) => setFormData({...formData, current_value: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Data da Compra</Label>
                  <Input type="date" value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Salvando...' : 'Salvar Investimento'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <p className="text-blue-100 text-sm">Total Investido</p>
              <p className="text-3xl font-bold mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <p className="text-emerald-100 text-sm">Valor Atual</p>
              <p className="text-3xl font-bold mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCurrent)}</p>
            </CardContent>
          </Card>
          <Card className={`border-0 shadow-lg bg-gradient-to-br ${totalReturn >= 0 ? 'from-purple-500 to-purple-600' : 'from-rose-500 to-rose-600'} text-white`}>
            <CardContent className="p-6">
              <p className="text-white/80 text-sm">Rendimento</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-bold">{totalReturn >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%</p>
                {totalReturn >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              <p className="text-sm text-white/70 mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReturn)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle>Meus Investimentos</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">Carregando...</div>
              ) : investments.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Nenhum investimento cadastrado</div>
              ) : investments.map((inv) => {
                const returnVal = (inv.current_value || 0) - (inv.invested_amount || 0);
                const returnPct = inv.invested_amount > 0 ? (returnVal / inv.invested_amount) * 100 : 0;
                return (
                  <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-100">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{inv.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={typeColors[inv.type]}>{typeLabels[inv.type]}</Badge>
                          {inv.institution && <span className="text-xs text-slate-400">{inv.institution}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.current_value)}</p>
                        <p className={`text-sm ${returnVal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {returnVal >= 0 ? '+' : ''}{returnPct.toFixed(2)}% ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(returnVal)})
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(inv.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}