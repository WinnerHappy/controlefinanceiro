'use client';

import { useState, useEffect } from 'react';
import { auth, comprasService } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  Plus, 
  ShoppingCart, 
  Clock, 
  CreditCard,
  Calendar,
  Trash2,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Compra {
  id: string;
  data: string;
  valor_total: number;
  tempo_duracao: number;
  forma_pagamento: string;
  created_at: string;
}

export default function ComprasPage() {
  const [user, setUser] = useState<User | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    valor_total: '',
    tempo_duracao: '',
    forma_pagamento: 'pix'
  });

  const formasPagamento = [
    { value: 'pix', label: 'PIX' },
    { value: 'vr', label: 'Vale Refeição' },
    { value: 'va', label: 'Vale Alimentação' },
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito', label: 'Cartão de Débito' }
  ];

  useEffect(() => {
    const initPage = async () => {
      const { user } = await auth.getUser();
      if (user) {
        setUser(user);
        await carregarCompras(user.id);
      }
      setLoading(false);
    };
    initPage();
  }, []);

  const carregarCompras = async (userId: string) => {
    try {
      const { data } = await comprasService.listarCompras(userId);
      setCompras(data || []);
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const compraData = {
        ...formData,
        valor_total: parseFloat(formData.valor_total),
        tempo_duracao: parseInt(formData.tempo_duracao),
        user_id: user.id
      };

      await comprasService.criarCompra(compraData);
      await carregarCompras(user.id);
      
      // Reset form
      setFormData({
        data: format(new Date(), 'yyyy-MM-dd'),
        valor_total: '',
        tempo_duracao: '',
        forma_pagamento: 'pix'
      });
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      alert('Erro ao salvar compra');
    }
  };

  const formatarTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const item = formasPagamento.find(f => f.value === forma);
    return item?.label || forma;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Usuário não autenticado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Compras do Mercado</h1>
          <p className="text-gray-600 mt-1">
            Registre e acompanhe suas compras do mercado
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nova Compra</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <ShoppingCart className="text-blue-600" size={24} />
            <h3 className="font-semibold text-blue-800">Total de Compras</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{compras.length}</p>
        </div>

        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CreditCard className="text-green-600" size={24} />
            <h3 className="font-semibold text-green-800">Valor Total</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">
            R$ {compras.reduce((sum, c) => sum + c.valor_total, 0).toLocaleString('pt-BR', {
              minimumFractionDigits: 2
            })}
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="text-orange-600" size={24} />
            <h3 className="font-semibold text-orange-800">Tempo Médio</h3>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            {compras.length > 0 
              ? formatarTempo(Math.round(compras.reduce((sum, c) => sum + c.tempo_duracao, 0) / compras.length))
              : '0min'
            }
          </p>
        </div>
      </div>

      {/* Lista de Compras */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Histórico de Compras</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {compras.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhuma compra registrada ainda</p>
              <p className="text-sm">Clique em "Nova Compra" para começar</p>
            </div>
          ) : (
            compras.map((compra) => (
              <div key={compra.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar size={16} />
                        <span className="font-medium">
                          {format(new Date(compra.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock size={16} />
                        <span>{formatarTempo(compra.tempo_duracao)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          R$ {compra.valor_total.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          Pago via {getFormaPagamentoLabel(compra.forma_pagamento)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Nova Compra */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Nova Compra</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Compra
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({...formData, valor_total: e.target.value})}
                  className="input-field"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Compra (minutos)
                </label>
                <input
                  type="number"
                  value={formData.tempo_duracao}
                  onChange={(e) => setFormData({...formData, tempo_duracao: e.target.value})}
                  className="input-field"
                  placeholder="30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})}
                  className="input-field"
                  required
                >
                  {formasPagamento.map((forma) => (
                    <option key={forma.value} value={forma.value}>
                      {forma.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Salvar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}