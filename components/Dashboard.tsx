'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { comprasService, contasService, salarioService } from '@/lib/supabase';
import { 
  ShoppingCart, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  user: User;
}

interface ResumoMensal {
  totalCompras: number;
  totalContas: number;
  salario: number;
  saldo: number;
  comprasCount: number;
}

export default function Dashboard({ user }: DashboardProps) {
  const [resumo, setResumo] = useState<ResumoMensal>({
    totalCompras: 0,
    totalContas: 0,
    salario: 0,
    saldo: 0,
    comprasCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarResumo();
  }, [user]);

  const carregarResumo = async () => {
    try {
      const hoje = new Date();
      const inicioMes = format(startOfMonth(hoje), 'yyyy-MM-dd');
      const fimMes = format(endOfMonth(hoje), 'yyyy-MM-dd');

      // Carregar compras do mês
      const { data: compras } = await comprasService.comprasPorPeriodo(
        user.id, 
        inicioMes, 
        fimMes
      );

      // Carregar contas ativas
      const { data: contas } = await contasService.listarContas(user.id);

      // Carregar salário do mês
      const { data: salario } = await salarioService.salarioDoMes(
        user.id,
        hoje.getMonth() + 1,
        hoje.getFullYear()
      );

      const totalCompras = compras?.reduce((sum, compra) => sum + compra.valor_total, 0) || 0;
      const totalContas = contas?.reduce((sum, conta) => sum + conta.valor, 0) || 0;
      const valorSalario = salario?.valor || 0;
      const saldo = valorSalario - totalCompras - totalContas;

      setResumo({
        totalCompras,
        totalContas,
        salario: valorSalario,
        saldo,
        comprasCount: compras?.length || 0
      });
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Compras do Mês',
      value: resumo.totalCompras,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      subtitle: `${resumo.comprasCount} compras realizadas`
    },
    {
      title: 'Contas Mensais',
      value: resumo.totalContas,
      icon: CreditCard,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      subtitle: 'Gastos fixos mensais'
    },
    {
      title: 'Salário',
      value: resumo.salario,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      subtitle: 'Renda do mês atual'
    },
    {
      title: 'Saldo',
      value: resumo.saldo,
      icon: TrendingUp,
      color: resumo.saldo >= 0 ? 'bg-green-500' : 'bg-red-500',
      bgColor: resumo.saldo >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: resumo.saldo >= 0 ? 'text-green-700' : 'text-red-700',
      subtitle: resumo.saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo de volta! Aqui está o resumo das suas finanças.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <Calendar size={20} />
          <span className="font-medium">
            {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </span>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <div key={index} className={`${card.bgColor} rounded-xl p-6 border border-gray-100`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </h3>
                <p className={`text-2xl font-bold ${card.textColor} mb-1`}>
                  R$ {card.value.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/compras"
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="bg-blue-500 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
              <ShoppingCart className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Nova Compra</h3>
              <p className="text-sm text-gray-600">Registrar compra do mercado</p>
            </div>
          </a>

          <a
            href="/contas"
            className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <div className="bg-orange-500 p-2 rounded-lg group-hover:bg-orange-600 transition-colors">
              <CreditCard className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Gerenciar Contas</h3>
              <p className="text-sm text-gray-600">Adicionar ou editar contas</p>
            </div>
          </a>

          <a
            href="/consumo"
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="bg-green-500 p-2 rounded-lg group-hover:bg-green-600 transition-colors">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Ver Relatórios</h3>
              <p className="text-sm text-gray-600">Análise de consumo</p>
            </div>
          </a>
        </div>
      </div>

      {/* Dica do Dia */}
      <div className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Clock className="text-white" size={20} />
          </div>
          <h2 className="text-lg font-semibold">Dica Financeira</h2>
        </div>
        <p className="text-white/90">
          Registre suas compras imediatamente após sair do mercado para não esquecer 
          nenhum detalhe e manter seu controle financeiro sempre atualizado!
        </p>
      </div>
    </div>
  );
}