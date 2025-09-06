'use client';

import { useState, useEffect } from 'react';
import { auth, dizimoService, salarioService, supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  Heart, 
  Calendar, 
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Dizimo {
  id: string;
  salario_id: string;
  valor: number;
  pago: boolean;
  data_pagamento: string | null;
  created_at: string;
}

interface SalarioComDizimo {
  id: string;
  valor: number;
  mes: number;
  ano: number;
  dizimo?: Dizimo;
}

export default function DizimoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [salarios, setSalarios] = useState<SalarioComDizimo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      const { user } = await auth.getUser();
      if (user) {
        setUser(user);
        await carregarDizimos(user.id);
      }
      setLoading(false);
    };
    initPage();
  }, []);

  const carregarDizimos = async (userId: string) => {
    try {
      // Buscar todos os salários do usuário
      const { data: salariosData, error } = await supabase
        .from('salarios')
        .select(`
          *,
          dizimos (*)
        `)
        .eq('user_id', userId)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error) throw error;

      const salariosComDizimo = salariosData?.map(salario => ({
        ...salario,
        dizimo: salario.dizimos?.[0] || null
      })) || [];

      setSalarios(salariosComDizimo);
    } catch (error) {
      console.error('Erro ao carregar dízimos:', error);
    }
  };

  const marcarComoPago = async (dizimoId: string) => {
    try {
      await dizimoService.marcarComoPago(dizimoId);
      if (user) {
        await carregarDizimos(user.id);
      }
    } catch (error) {
      console.error('Erro ao marcar dízimo como pago:', error);
      alert('Erro ao marcar dízimo como pago');
    }
  };

  const formatarMes = (mes: number, ano: number) => {
    const data = new Date(ano, mes - 1, 1);
    return format(data, 'MMMM yyyy', { locale: ptBR });
  };

  const calcularTotais = () => {
    const totalDizimo = salarios.reduce((sum, s) => sum + (s.dizimo?.valor || 0), 0);
    const totalPago = salarios.reduce((sum, s) => 
      sum + (s.dizimo?.pago ? s.dizimo.valor : 0), 0
    );
    const totalPendente = totalDizimo - totalPago;
    const percentualPago = totalDizimo > 0 ? (totalPago / totalDizimo) * 100 : 0;

    return { totalDizimo, totalPago, totalPendente, percentualPago };
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

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Controle do Dízimo</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe seus dízimos calculados automaticamente (10% do salário)
          </p>
        </div>
        <div className="flex items-center space-x-2 text-pink-600">
          <Heart size={24} />
          <span className="font-semibold">Fidelidade</span>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-pink-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="text-pink-600" size={24} />
            <h3 className="font-semibold text-pink-800">Total Dízimo</h3>
          </div>
          <p className="text-2xl font-bold text-pink-700">
            R$ {totais.totalDizimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <h3 className="font-semibold text-green-800">Pago</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">
            R$ {totais.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="text-orange-600" size={24} />
            <h3 className="font-semibold text-orange-800">Pendente</h3>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            R$ {totais.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="text-blue-600" size={24} />
            <h3 className="font-semibold text-blue-800">% Fidelidade</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {totais.percentualPago.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Progresso de Fidelidade</h2>
          <span className="text-sm text-gray-600">
            {totais.percentualPago.toFixed(1)}% dos dízimos pagos
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-pink-500 to-pink-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(totais.percentualPago, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>R$ 0</span>
          <span>R$ {totais.totalDizimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Lista de Dízimos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Histórico de Dízimos</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {salarios.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Heart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhum dízimo registrado ainda</p>
              <p className="text-sm">Registre um salário para calcular o dízimo automaticamente</p>
            </div>
          ) : (
            salarios.map((salario) => {
              const dizimo = salario.dizimo;
              const valorDizimo = salario.valor * 0.1;
              
              return (
                <div key={salario.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="font-semibold text-gray-800">
                            {formatarMes(salario.mes, salario.ano)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dizimo?.pago 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {dizimo?.pago ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-800">
                            R$ {valorDizimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-gray-600">
                            10% de R$ {salario.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {dizimo?.pago && dizimo.data_pagamento && (
                            <p className="text-xs text-green-600 mt-1">
                              Pago em {format(new Date(dizimo.data_pagamento), 'dd/MM/yyyy')}
                            </p>
                          )}
                        </div>
                        
                        {dizimo && !dizimo.pago && (
                          <button
                            onClick={() => marcarComoPago(dizimo.id)}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <CheckCircle size={18} />
                            <span>Marcar como Pago</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Versículo Bíblico */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <Heart className="text-white" size={24} />
          <h2 className="text-lg font-semibold">Palavra de Encorajamento</h2>
        </div>
        <blockquote className="text-white/90 italic text-lg mb-2">
          "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, 
          e depois fazei prova de mim, diz o Senhor dos Exércitos, se eu não vos abrir as 
          janelas do céu e não derramar sobre vós uma bênção tal, que dela vos resulte a maior abastança."
        </blockquote>
        <cite className="text-white/80 text-sm">Malaquias 3:10</cite>
      </div>
    </div>
  );
}

