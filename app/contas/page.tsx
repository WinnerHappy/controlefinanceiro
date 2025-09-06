'use client';

import { useState, useEffect } from 'react';
import { auth, contasService, salarioService, dizimoService } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  Plus, 
  CreditCard, 
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Heart
} from 'lucide-react';

interface Conta {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
  tipo: string;
  vencimento: number;
  ativa: boolean;
}

export default function ContasPage() {
  const [user, setUser] = useState<User | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [showContaForm, setShowContaForm] = useState(false);
  const [showSalarioForm, setShowSalarioForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salarioAtual, setSalarioAtual] = useState<number>(0);
  
  // Form states
  const [contaForm, setContaForm] = useState({
    nome: '',
    valor: '',
    categoria: 'moradia',
    tipo: 'fixo',
    vencimento: '1'
  });

  const [salarioForm, setSalarioForm] = useState({
    valor: ''
  });

  const categorias = [
    { value: 'moradia', label: 'Moradia' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'alimentacao', label: 'Alimentação' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'lazer', label: 'Lazer' },
    { value: 'outros', label: 'Outros' }
  ];

  useEffect(() => {
    const initPage = async () => {
      const { user } = await auth.getUser();
      if (user) {
        setUser(user);
        await carregarContas(user.id);
        await carregarSalario(user.id);
      }
      setLoading(false);
    };
    initPage();
  }, []);

  const carregarContas = async (userId: string) => {
    try {
      const { data } = await contasService.listarContas(userId);
      setContas(data || []);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const carregarSalario = async (userId: string) => {
    try {
      const hoje = new Date();
      const { data } = await salarioService.salarioDoMes(
        userId,
        hoje.getMonth() + 1,
        hoje.getFullYear()
      );
      setSalarioAtual(data?.valor || 0);
    } catch (error) {
      console.error('Erro ao carregar salário:', error);
    }
  };

  const handleContaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const contaData = {
        ...contaForm,
        valor: parseFloat(contaForm.valor),
        vencimento: parseInt(contaForm.vencimento),
        user_id: user.id
      };

      await contasService.criarConta(contaData);
      await carregarContas(user.id);
      
      // Reset form
      setContaForm({
        nome: '',
        valor: '',
        categoria: 'moradia',
        tipo: 'fixo',
        vencimento: '1'
      });
      setShowContaForm(false);
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta');
    }
  };

  const handleSalarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const hoje = new Date();
      const salarioData = {
        valor: parseFloat(salarioForm.valor),
        mes: hoje.getMonth() + 1,
        ano: hoje.getFullYear(),
        user_id: user.id
      };

      const { data: salario } = await salarioService.registrarSalario(salarioData);
      
      // Criar dízimo automaticamente (10% do salário)
      if (salario) {
        const dizimoData = {
          salario_id: salario.id,
          valor: salario.valor * 0.1,
          pago: false,
          user_id: user.id
        };
        await dizimoService.criarDizimo(dizimoData);
      }

      await carregarSalario(user.id);
      setSalarioForm({ valor: '' });
      setShowSalarioForm(false);
      
      alert('Salário registrado! Dízimo de 10% foi automaticamente calculado.');
    } catch (error) {
      console.error('Erro ao salvar salário:', error);
      alert('Erro ao salvar salário');
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const item = categorias.find(c => c.value === categoria);
    return item?.label || categoria;
  };

  const totalContas = contas.reduce((sum, conta) => sum + conta.valor, 0);
  const saldoRestante = salarioAtual - totalContas;

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
          <h1 className="text-3xl font-bold text-gray-800">Contas e Salário</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas contas mensais e registre seu salário
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSalarioForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <DollarSign size={20} />
            <span>Registrar Salário</span>
          </button>
          <button
            onClick={() => setShowContaForm(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <h3 className="font-semibold text-green-800">Salário do Mês</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">
            R$ {salarioAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-red-50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CreditCard className="text-red-600" size={24} />
            <h3 className="font-semibold text-red-800">Total de Contas</h3>
          </div>
          <p className="text-2xl font-bold text-red-700">
            R$ {totalContas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`${saldoRestante >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-xl p-6`}>
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className={`${saldoRestante >= 0 ? 'text-blue-600' : 'text-orange-600'}`} size={24} />
            <h3 className={`font-semibold ${saldoRestante >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              Saldo Restante
            </h3>
          </div>
          <p className={`text-2xl font-bold ${saldoRestante >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            R$ {saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Contas Mensais</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {contas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhuma conta registrada ainda</p>
              <p className="text-sm">Clique em "Nova Conta" para começar</p>
            </div>
          ) : (
            contas.map((conta) => (
              <div key={conta.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="font-semibold text-gray-800">{conta.nome}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        conta.tipo === 'fixo' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {conta.tipo === 'fixo' ? 'Fixo' : 'Variável'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getCategoriaLabel(conta.categoria)} • Vence dia {conta.vencimento}
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

      {/* Modal de Nova Conta */}
      {showContaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Nova Conta</h2>
            
            <form onSubmit={handleContaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  value={contaForm.nome}
                  onChange={(e) => setContaForm({...contaForm, nome: e.target.value})}
                  className="input-field"
                  placeholder="Ex: Conta de Luz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={contaForm.valor}
                  onChange={(e) => setContaForm({...contaForm, valor: e.target.value})}
                  className="input-field"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={contaForm.categoria}
                  onChange={(e) => setContaForm({...contaForm, categoria: e.target.value})}
                  className="input-field"
                  required
                >
                  {categorias.map((categoria) => (
                    <option key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={contaForm.tipo}
                  onChange={(e) => setContaForm({...contaForm, tipo: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="fixo">Fixo</option>
                  <option value="variavel">Variável</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia do Vencimento
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={contaForm.vencimento}
                  onChange={(e) => setContaForm({...contaForm, vencimento: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContaForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Salário */}
      {showSalarioForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Registrar Salário</h2>
            
            <form onSubmit={handleSalarioSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Salário (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salarioForm.valor}
                  onChange={(e) => setSalarioForm({...salarioForm, valor: e.target.value})}
                  className="input-field"
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="text-blue-600" size={20} />
                  <span className="font-medium text-blue-800">Dízimo Automático</span>
                </div>
                <p className="text-sm text-blue-700">
                  O dízimo de 10% (R$ {(parseFloat(salarioForm.valor) * 0.1 || 0).toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2 
                  })}) será automaticamente calculado e registrado.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSalarioForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Registrar Salário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}