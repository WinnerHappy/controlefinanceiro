// Tipos para o sistema de compras
export interface Compra {
  id: string;
  data: string;
  valor_total: number;
  tempo_duracao: number; // em minutos
  forma_pagamento: FormaPagamento;
  itens: ItemCompra[];
  user_id: string;
  created_at: string;
}

export interface ItemCompra {
  id: string;
  compra_id: string;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

// Tipos para formas de pagamento
export type FormaPagamento = 'pix' | 'vr' | 'va' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';

// Tipos para contas mensais
export interface Conta {
  id: string;
  nome: string;
  valor: number;
  categoria: CategoriaConta;
  tipo: 'fixo' | 'variavel';
  vencimento: number; // dia do mês
  user_id: string;
  ativa: boolean;
  created_at: string;
}

export type CategoriaConta = 'moradia' | 'transporte' | 'alimentacao' | 'saude' | 'educacao' | 'lazer' | 'outros';

// Tipos para salário e dízimo
export interface Salario {
  id: string;
  valor: number;
  mes: number;
  ano: number;
  user_id: string;
  created_at: string;
}

export interface Dizimo {
  id: string;
  salario_id: string;
  valor: number;
  pago: boolean;
  data_pagamento?: string;
  user_id: string;
  created_at: string;
}

// Tipos para relatórios
export interface ResumoMensal {
  mes: number;
  ano: number;
  total_compras: number;
  total_contas: number;
  salario: number;
  dizimo: number;
  saldo: number;
}

// Tipo para usuário
export interface Usuario {
  id: string;
  email: string;
  created_at: string;
}