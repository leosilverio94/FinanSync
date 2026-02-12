import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Building2, Wallet, PiggyBank, Trash2, Pencil } from 'lucide-react';

const typeLabels = { checking: 'Conta Corrente', savings: 'Poupança', wallet: 'Carteira' };
const typeIcons = { checking: Building2, savings: PiggyBank, wallet: Wallet };
const colorOptions = ['blue', 'green', 'purple', 'amber', 'rose'];

export default function Accounts() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'checking', bank: '', balance: '', color: 'blue' });

  const queryClient = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Account.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounts'] }); resetForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Account.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounts'] }); resetForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Account.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const resetForm = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', type: 'checking', bank: '', balance: '', color: 'blue' });
  };

  const handleEdit = (acc) => {
    setEditingId(acc.id);
    setFormData({ name: acc.name, type: acc.type, bank: acc.bank || '', balance: acc.balance?.toString() || '', color: acc.color || 'blue' });
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, balance: parseFloat(formData.balance) };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  const getColorClass = (color, type = 'bg') => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
      green: { bg: 'bg-emerald-100', text: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', gradient: 'from-amber-500 to-amber-600' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600', gradient: 'from-rose-500 to-rose-600' }
    };
    return colors[color]?.[type] || colors.blue[type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Contas</h1>
            <p className="text-slate-500">Gerencie suas contas bancárias e carteiras</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(o) => { if (!o) resetForm(); else setIsOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Nova'} Conta</DialogTitle></DialogHeader>
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
                    <Label>Banco (opcional)</Label>
                    <Input value={formData.bank} onChange={(e) => setFormData({...formData, bank: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Saldo</Label>
                    <Input type="number" step="0.01" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="flex gap-2 pt-2">
                      {colorOptions.map((c) => (
                        <button key={c} type="button" onClick={() => setFormData({...formData, color: c})}
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getColorClass(c, 'gradient')} ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar Conta'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <p className="text-emerald-100 text-sm">Saldo Total</p>
            <p className="text-4xl font-bold mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}</p>
          </CardContent>
        </Card>

        {/* Lista */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full p-8 text-center text-slate-400">Carregando...</div>
          ) : accounts.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-400">Nenhuma conta cadastrada</div>
          ) : accounts.map((acc) => {
            const Icon = typeIcons[acc.type] || Building2;
            return (
              <Card key={acc.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${getColorClass(acc.color, 'bg')}`}>
                      <Icon className={`w-6 h-6 ${getColorClass(acc.color, 'text')}`} />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(acc)} className="text-slate-400 hover:text-blue-600">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(acc.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-semibold text-slate-800">{acc.name}</p>
                    <p className="text-sm text-slate-500">{acc.bank || typeLabels[acc.type]}</p>
                  </div>
                  <p className={`text-2xl font-bold mt-3 ${acc.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}