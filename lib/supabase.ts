import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

// Cliente Supabase para componentes do lado do cliente
export const supabase = createClientComponentClient<Database>();

// Funções utilitárias para autenticação
export const auth = {
  // Login com email
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Registro com email
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obter usuário atual
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Resetar senha
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
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