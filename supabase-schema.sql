-- Configuração do banco de dados para o App de Controle Financeiro
-- Execute este script no SQL Editor do Supabase

-- Tabela de compras do mercado
CREATE TABLE IF NOT EXISTS compras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
    tempo_duracao INTEGER NOT NULL CHECK (tempo_duracao > 0), -- em minutos
    forma_pagamento VARCHAR(20) NOT NULL CHECK (forma_pagamento IN ('pix', 'vr', 'va', 'dinheiro', 'cartao_credito', 'cartao_debito')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens das compras (opcional para futuras expansões)
CREATE TABLE IF NOT EXISTS itens_compra (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    compra_id UUID REFERENCES compras(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    quantidade DECIMAL(8,3) NOT NULL CHECK (quantidade > 0),
    valor_unitario DECIMAL(8,2) NOT NULL CHECK (valor_unitario >= 0),
    valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas mensais
CREATE TABLE IF NOT EXISTS contas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('moradia', 'transporte', 'alimentacao', 'saude', 'educacao', 'lazer', 'outros')),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('fixo', 'variavel')),
    vencimento INTEGER NOT NULL CHECK (vencimento >= 1 AND vencimento <= 31),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de salários
CREATE TABLE IF NOT EXISTS salarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    ano INTEGER NOT NULL CHECK (ano >= 2020),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mes, ano) -- Um salário por mês por usuário
);

-- Tabela de dízimos (calculado automaticamente como 10% do salário)
CREATE TABLE IF NOT EXISTS dizimos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salario_id UUID REFERENCES salarios(id) ON DELETE CASCADE NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento TIMESTAMP WITH TIME ZONE NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_compras_user_data ON compras(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_compras_forma_pagamento ON compras(forma_pagamento);
CREATE INDEX IF NOT EXISTS idx_itens_compra_compra_id ON itens_compra(compra_id);
CREATE INDEX IF NOT EXISTS idx_contas_user_ativa ON contas(user_id, ativa);
CREATE INDEX IF NOT EXISTS idx_contas_categoria ON contas(categoria);
CREATE INDEX IF NOT EXISTS idx_salarios_user_mes_ano ON salarios(user_id, ano DESC, mes DESC);
CREATE INDEX IF NOT EXISTS idx_dizimos_user_pago ON dizimos(user_id, pago);
CREATE INDEX IF NOT EXISTS idx_dizimos_salario_id ON dizimos(salario_id);

-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE salarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE dizimos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (RLS Policies)

-- Compras: usuários só podem ver/editar suas próprias compras
CREATE POLICY "Usuários podem ver suas próprias compras" ON compras
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias compras" ON compras
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias compras" ON compras
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias compras" ON compras
    FOR DELETE USING (auth.uid() = user_id);

-- Itens de compra: usuários só podem ver/editar itens de suas próprias compras
CREATE POLICY "Usuários podem ver itens de suas próprias compras" ON itens_compra
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM compras 
            WHERE compras.id = itens_compra.compra_id 
            AND compras.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir itens em suas próprias compras" ON itens_compra
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM compras 
            WHERE compras.id = itens_compra.compra_id 
            AND compras.user_id = auth.uid()
        )
    );

-- Contas: usuários só podem ver/editar suas próprias contas
CREATE POLICY "Usuários podem ver suas próprias contas" ON contas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias contas" ON contas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias contas" ON contas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias contas" ON contas
    FOR DELETE USING (auth.uid() = user_id);

-- Salários: usuários só podem ver/editar seus próprios salários
CREATE POLICY "Usuários podem ver seus próprios salários" ON salarios
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios salários" ON salarios
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios salários" ON salarios
    FOR UPDATE USING (auth.uid() = user_id);

-- Dízimos: usuários só podem ver/editar seus próprios dízimos
CREATE POLICY "Usuários podem ver seus próprios dízimos" ON dizimos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dízimos" ON dizimos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dízimos" ON dizimos
    FOR UPDATE USING (auth.uid() = user_id);

-- Função para criar dízimo automaticamente quando um salário é inserido
CREATE OR REPLACE FUNCTION criar_dizimo_automatico()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO dizimos (salario_id, valor, user_id)
    VALUES (NEW.id, NEW.valor * 0.1, NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar dízimo automaticamente
CREATE TRIGGER trigger_criar_dizimo
    AFTER INSERT ON salarios
    FOR EACH ROW
    EXECUTE FUNCTION criar_dizimo_automatico();

-- Função para atualizar data de pagamento do dízimo
CREATE OR REPLACE FUNCTION atualizar_data_pagamento_dizimo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pago = TRUE AND OLD.pago = FALSE THEN
        NEW.data_pagamento = NOW();
    ELSIF NEW.pago = FALSE THEN
        NEW.data_pagamento = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar data de pagamento automaticamente
CREATE TRIGGER trigger_atualizar_data_pagamento
    BEFORE UPDATE ON dizimos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_pagamento_dizimo();

-- Inserir dados de exemplo (opcional - remover em produção)
-- INSERT INTO compras (data, valor_total, tempo_duracao, forma_pagamento, user_id) 
-- VALUES ('2024-01-15', 150.50, 45, 'pix', auth.uid());

-- Comentários nas tabelas para documentação
COMMENT ON TABLE compras IS 'Registros de compras do mercado realizadas pelos usuários';
COMMENT ON TABLE itens_compra IS 'Itens individuais de cada compra (para detalhamento futuro)';
COMMENT ON TABLE contas IS 'Contas mensais fixas e variáveis dos usuários';
COMMENT ON TABLE salarios IS 'Registro mensal de salários dos usuários';
COMMENT ON TABLE dizimos IS 'Dízimos calculados automaticamente (10% do salário)';

COMMENT ON COLUMN compras.tempo_duracao IS 'Tempo gasto na compra em minutos';
COMMENT ON COLUMN compras.forma_pagamento IS 'Forma de pagamento: pix, vr, va, dinheiro, cartao_credito, cartao_debito';
COMMENT ON COLUMN contas.vencimento IS 'Dia do mês em que a conta vence (1-31)';
COMMENT ON COLUMN contas.categoria IS 'Categoria da conta: moradia, transporte, alimentacao, saude, educacao, lazer, outros';
COMMENT ON COLUMN contas.tipo IS 'Tipo da conta: fixo ou variavel';
COMMENT ON COLUMN dizimos.valor IS 'Valor do dízimo (10% do salário)';
COMMENT ON COLUMN dizimos.pago IS 'Indica se o dízimo foi pago';
COMMENT ON COLUMN dizimos.data_pagamento IS 'Data em que o dízimo foi marcado como pago';