import { createClient } from '@supabase/supabase-js';

// Cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de autenticação
export const auth = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  }
};

// Funções para compras
export const comprasService = {
  // Criar nova compra
  async criarCompra(compra: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('compras')
      .insert(compra)
      .select()
      .single();
    return { data, error };
  },

  // Listar compras do usuário
  async listarCompras(userId: string) {
    const { data, error } = await supabase
      .from('compras')
      .select('*, itens_compra(*)')
      .eq('user_id', userId)
      .order('data', { ascending: false });
    return { data, error };
  },

  // Obter compras por período
  async comprasPorPeriodo(userId: string, dataInicio: string, dataFim: string) {
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .eq('user_id', userId)
      .gte('data', dataInicio)
      .lte('data', dataFim);
    return { data, error };
  }
};

// Funções para contas
export const contasService = {
  // Criar nova conta
  async criarConta(conta: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('contas')
      .insert(conta)
      .select()
      .single();
    return { data, error };
  },

  // Listar contas do usuário
  async listarContas(userId: string) {
    const { data, error } = await supabase
      .from('contas')
      .select('*')
      .eq('user_id', userId)
      .eq('ativa', true)
      .order('nome');
    return { data, error };
  },

  // Atualizar conta
  async atualizarConta(id: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('contas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// Funções para salário e dízimo
export const salarioService = {
  // Registrar salário
  async registrarSalario(salario: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('salarios')
      .insert(salario)
      .select()
      .single();
    return { data, error };
  },

  // Obter salário do mês
  async salarioDoMes(userId: string, mes: number, ano: number) {
    const { data, error } = await supabase
      .from('salarios')
      .select('*')
      .eq('user_id', userId)
      .eq('mes', mes)
      .eq('ano', ano)
      .single();
    return { data, error };
  }
};

export const dizimoService = {
  // Criar dízimo automaticamente
  async criarDizimo(dizimo: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('dizimos')
      .insert(dizimo)
      .select()
      .single();
    return { data, error };
  },

  // Marcar dízimo como pago
  async marcarComoPago(id: string) {
    const { data, error } = await supabase
      .from('dizimos')
      .update({ 
        pago: true, 
        data_pagamento: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};