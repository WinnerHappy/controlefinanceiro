// Tipos gerados automaticamente pelo Supabase CLI
export interface Database {
  public: {
    Tables: {
      compras: {
        Row: {
          id: string;
          data: string;
          valor_total: number;
          tempo_duracao: number;
          forma_pagamento: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          data: string;
          valor_total: number;
          tempo_duracao: number;
          forma_pagamento: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          data?: string;
          valor_total?: number;
          tempo_duracao?: number;
          forma_pagamento?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      itens_compra: {
        Row: {
          id: string;
          compra_id: string;
          nome: string;
          quantidade: number;
          valor_unitario: number;
          valor_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          compra_id: string;
          nome: string;
          quantidade: number;
          valor_unitario: number;
          valor_total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          compra_id?: string;
          nome?: string;
          quantidade?: number;
          valor_unitario?: number;
          valor_total?: number;
          created_at?: string;
        };
      };
      contas: {
        Row: {
          id: string;
          nome: string;
          valor: number;
          categoria: string;
          tipo: string;
          vencimento: number;
          user_id: string;
          ativa: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          valor: number;
          categoria: string;
          tipo: string;
          vencimento: number;
          user_id: string;
          ativa?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          valor?: number;
          categoria?: string;
          tipo?: string;
          vencimento?: number;
          user_id?: string;
          ativa?: boolean;
          created_at?: string;
        };
      };
      salarios: {
        Row: {
          id: string;
          valor: number;
          mes: number;
          ano: number;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          valor: number;
          mes: number;
          ano: number;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          valor?: number;
          mes?: number;
          ano?: number;
          user_id?: string;
          created_at?: string;
        };
      };
      dizimos: {
        Row: {
          id: string;
          salario_id: string;
          valor: number;
          pago: boolean;
          data_pagamento: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          salario_id: string;
          valor: number;
          pago?: boolean;
          data_pagamento?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          salario_id?: string;
          valor?: number;
          pago?: boolean;
          data_pagamento?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}