'use client';

import { useState, useEffect } from 'react';
import { auth, comprasService, contasService, salarioService } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DadosGrafico {
  mes: string;
  compras: number;
  contas: number;
  salario: number;
}

interface DadosCategoria {
  categoria: string;
  valor: number;
  cor: string;
}

export default function ConsumoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);
  const [dadosCategorias, setDadosCategorias] = useState<DadosCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('6'); // últimos 6 meses

  const cores = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  useEffect(() => {
    const initPage = async () => {
      const { user } = await auth.getUser();
      if (user) {
        setUser(user);
        await carregarDados(user.id);
      }
      setLoading(false);
    };
    initPage();
  }, [periodoSelecionado]);

  const carregarDados = async (userId: string) => {
    try {
      const meses = parseInt(periodoSelecionado);
      const dadosMensais: DadosGrafico[] = [];
      const categoriasMap = new Map<string, number>();

      // Carregar dados dos últimos meses
      for (let i = meses - 1; i >= 0; i--) {
        const data = subMonths(new Date(), i);
        const inicioMes = format(startOfMonth(data), 'yyyy-MM-dd');
        const fimMes = format(endOfMonth(data), 'yyyy-MM-dd');
        const mesAno = format(data, 'MMM/yy', { locale: ptBR });

        // Compras do mês
        const { data: compras } = await comprasService.comprasPorPeriodo(
          userId, inicioMes, fimMes
        );
        const totalCompras = compras?.reduce((sum, c) => sum + c.valor_total, 0) || 0;

        // Contas do mês (assumindo que são fixas)
        const { data: contas } = await contasService.listarContas(userId);
        const totalContas = contas?.reduce((sum, c) => sum + c.valor, 0) || 0;

        // Agrupar contas por categoria
        contas?.forEach(conta => {
          const valorAtual = categoriasMap.get(conta.categoria) || 0;
          categoriasMap.set(conta.categoria, valorAtual + conta.valor);
        });

        // Salário do mês
        const { data: salario } = await salarioService.salarioDoMes(
          userId, data.getMonth() + 1, data.getFullYear()
        );
        const valorSalario = salario?.valor || 0;

        dadosMensais.push({
          mes: mesAno,
          compras: totalCompras,
          contas: totalContas,
          salario: valorSalario
        });
      }

      // Converter categorias para array
      const categorias: DadosCategoria[] = Array.from(categoriasMap.entries()).map(
        ([categoria, valor], index) => ({
          categoria: getCategoriaLabel(categoria),
          valor,
          cor: cores[index % cores.length]
        })
      );

      setDadosGrafico(dadosMensais);
      setDadosCategorias(categorias);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      moradia: 'Moradia',
      transporte: 'Transporte',
      alimentacao: 'Alimentação',
      saude: 'Saúde',
      educacao: 'Educação',
      lazer: 'Lazer',
      outros: 'Outros'
    };
    return labels[categoria] || categoria;
  };

  const formatarMoeda = (valor: number) => {
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const calcularTotais = () => {
    const totalCompras = dadosGrafico.reduce((sum, d) => sum + d.compras, 0);
    const totalContas = dadosGrafico.reduce((sum, d) => sum + d.contas, 0);
    const totalSalario = dadosGrafico.reduce((sum, d) => sum + d.salario, 0);
    const saldoTotal = totalSalario - totalCompras - totalContas;

    return { totalCompras, totalContas, totalSalario, saldoTotal };
  };

  const exportarRelatorio = () => {
    const totais = calcularTotais();
    const relatorio = `
RELATÓRIO FINANCEIRO - ${format(new Date(), 'dd/MM/yyyy')}
=================================================

RESUMO DO PERÍODO (${periodoSelecionado} meses):
- Total de Salários: ${formatarMoeda(totais.totalSalario)}
- Total de Compras: ${formatarMoeda(totais.totalCompras)}
- Total de Contas: ${formatarMoeda(totais.totalContas)}
- Saldo Final: ${formatarMoeda(totais.saldoTotal)}

GASTOS POR CATEGORIA:
${dadosCategorias.map(cat => 
  `- ${cat.categoria}: ${formatarMoeda(cat.valor)}`
).join('\n')}

EVOLUÇÃO MENSAL:
${dadosGrafico.map(d => 
  `${d.mes}: Salário ${formatarMoeda(d.salario)} | Compras ${formatarMoeda(d.compras)} | Contas ${formatarMoeda(d.contas)}`
).join('\n')}
    `;

    const blob = new Blob([relatorio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-800">Análise de Consumo</h1>
          <p className="text-gray-600 mt-1">
            Gráficos e relatórios dos seus gastos financeiros
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(e.target.value)}
              className="input-field w-auto"
            >
              <option value="3">Últimos 3 meses</option>
              <option value="6">Últimos 6 meses</option>
              <option value="12">Últimos 12 meses</option>
            </select>
          </div>
          <button
            onClick={exportarRelatorio}
            className="btn-primary flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className="font-semibold text-green-800">Total Salários</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {formatarMoeda(totais.totalSalario)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="text-blue-600" size={24} />
            <h3 className="font-semibold text-blue-800">Total Compras</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {formatarMoeda(totais.totalCompras)}
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <PieChart className="text-orange-600" size={24} />
            <h3 className="font-semibold text-orange-800">Total Contas</h3>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            {formatarMoeda(totais.totalContas)}
          </p>
        </div>

        <div className={`${totais.saldoTotal >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-xl p-6`}>
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className={`${totais.saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`} size={24} />
            <h3 className={`font-semibold ${totais.saldoTotal >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Saldo Total
            </h3>
          </div>
          <p className={`text-2xl font-bold ${totais.saldoTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatarMoeda(totais.saldoTotal)}
          </p>
        </div>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Evolução Mensal</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Tooltip 
                formatter={(value: number) => formatarMoeda(value)}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="salario" fill="#10B981" name="Salário" />
              <Bar dataKey="compras" fill="#3B82F6" name="Compras" />
              <Bar dataKey="contas" fill="#EF4444" name="Contas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Gastos por Categoria */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Gastos por Categoria</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                <RechartsPieChart data={dadosCategorias} cx="50%" cy="50%" outerRadius={80}>
                  {dadosCategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {dadosCategorias.map((categoria, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: categoria.cor }}
                  ></div>
                  <span className="text-sm text-gray-600">{categoria.categoria}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {formatarMoeda(categoria.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparativo Orçado vs Real */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Comparativo Mensal</h2>
          <div className="space-y-4">
            {dadosGrafico.slice(-3).map((dados, index) => {
              const gastoTotal = dados.compras + dados.contas;
              const percentualGasto = dados.salario > 0 ? (gastoTotal / dados.salario) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{dados.mes}</span>
                    <span className="text-sm text-gray-600">
                      {percentualGasto.toFixed(1)}% do salário
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        percentualGasto > 90 ? 'bg-red-500' : 
                        percentualGasto > 70 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentualGasto, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Gasto: {formatarMoeda(gastoTotal)}</span>
                    <span>Salário: {formatarMoeda(dados.salario)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}