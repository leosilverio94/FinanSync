import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, CreditCard as CreditCardIcon, Trash2, Pencil } from 'lucide-react';

const colorOptions = [
  { value: 'black', label: 'Preto', gradient: 'from-slate-800 to-slate-900' },
  { value: 'gold', label: 'Dourado', gradient: 'from-amber-400 to-amber-600' },
  { value: 'platinum', label: 'Platinum', gradient: 'from-slate-400 to-slate-600' },
  { value: 'blue', label: 'Azul', gradient: 'from-blue-500 to-blue-700' },
  { value: 'green', label: 'Verde', gradient: 'from-emerald-500 to-emerald-700' },
  { value: 'purple', label: 'Roxo', gradient: 'from-purple-500 to-purple-700' },
  { value: 'rose', label: 'Rosa', gradient: 'from-rose-400 to-rose-600' }
];

export default function Cards() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', bank: '', limit: '', current_bill: '', due_date: '', closing_date: '', color: 'black' });

  const queryClient = useQueryClient();
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['creditCards'],
    queryFn: () => base44.entities.CreditCard.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CreditCard.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['creditCards'] }); resetForm(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CreditCard.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['creditCards'] }); resetForm(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CreditCard.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['creditCards'] }),
  });

  const resetForm = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', bank: '', limit: '', current_bill: '', due_date: '', closing_date: '', color: 'black' });
  };

  const handleEdit = (card) => {
    setEditingId(card.id);
    setFormData({
      name: card.name, bank: card.bank || '', limit: card.limit?.toString() || '',
      current_bill: card.current_bill?.toString() || '', due_date: card.due_date?.toString() || '',
      closing_date: card.closing_date?.toString() || '', color: card.color || 'black'
    });
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      limit: parseFloat(formData.limit),
      current_bill: parseFloat(formData.current_bill) || 0,
      due_date: parseInt(formData.due_date) || null,
      closing_date: parseInt(formData.closing_date) || null
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const totalLimit = cards.reduce((s, c) => s + (c.limit || 0), 0);
  const totalUsed = cards.reduce((s, c) => s + (c.current_bill || 0), 0);

  const getGradient = (color) => colorOptions.find(c => c.value === color)?.gradient || 'from-slate-600 to-slate-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Cartões de Crédito</h1>
            <p className="text-slate-500">Gerencie seus cartões e faturas</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(o) => { if (!o) resetForm(); else setIsOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editingId ? 'Editar' : 'Novo'} Cartão</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Cartão</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input value={formData.bank} onChange={(e) => setFormData({...formData, bank: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Limite</Label>
                    <Input type="number" step="0.01" value={formData.limit} onChange={(e) => setFormData({...formData, limit: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fatura Atual</Label>
                    <Input type="number" step="0.01" value={formData.current_bill} onChange={(e) => setFormData({...formData, current_bill: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dia Vencimento</Label>
                    <Input type="number" min="1" max="31" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dia Fechamento</Label>
                    <Input type="number" min="1" max="31" value={formData.closing_date} onChange={(e) => setFormData({...formData, closing_date: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor do Cartão</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {colorOptions.map((c) => (
                      <button key={c.value} type="button" onClick={() => setFormData({...formData, color: c.value})}
                        className={`w-10 h-6 rounded bg-gradient-to-r ${c.gradient} ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar Cartão'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <p className="text-purple-100 text-sm">Limite Total</p>
              <p className="text-3xl font-bold mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLimit)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white">
            <CardContent className="p-6">
              <p className="text-rose-100 text-sm">Faturas Abertas</p>
              <p className="text-3xl font-bold mt-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalUsed)}</p>
              <p className="text-sm text-rose-200 mt-1">Disponível: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLimit - totalUsed)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full p-8 text-center text-slate-400">Carregando...</div>
          ) : cards.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-400">Nenhum cartão cadastrado</div>
          ) : cards.map((card) => {
            const usage = card.limit > 0 ? ((card.current_bill || 0) / card.limit) * 100 : 0;
            return (
              <div key={card.id} className={`relative p-6 rounded-2xl bg-gradient-to-br ${getGradient(card.color)} text-white shadow-xl overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-8 translate-y-8" />
                
                <div className="relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-80">{card.bank}</p>
                      <p className="text-xl font-bold">{card.name}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(card)} className="text-white/70 hover:text-white hover:bg-white/10">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(card.id)} className="text-white/70 hover:text-white hover:bg-white/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CreditCardIcon className="w-10 h-10 mt-6 opacity-80" />

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-80">Fatura Atual</span>
                      <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.current_bill || 0)}</span>
                    </div>
                    <Progress value={usage} className="h-2 bg-white/20" />
                    <div className="flex justify-between text-xs opacity-70">
                      <span>Disponível: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit - (card.current_bill || 0))}</span>
                      <span>{usage.toFixed(0)}%</span>
                    </div>
                  </div>

                  {(card.due_date || card.closing_date) && (
                    <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs opacity-70">
                      {card.closing_date && <span>Fecha dia {card.closing_date}</span>}
                      {card.due_date && <span>Vence dia {card.due_date}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}