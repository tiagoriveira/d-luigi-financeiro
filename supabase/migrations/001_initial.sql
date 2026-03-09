-- =====================================================================
-- Custo & Caixa — Migração inicial do banco de dados Supabase
-- Versão: 001
-- =====================================================================

-- 1. Tabela de Estabelecimentos
CREATE TABLE IF NOT EXISTS estabelecimentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome            TEXT NOT NULL,
  regime_tributario TEXT DEFAULT 'simples_6',
  aliquota        NUMERIC(5,4) DEFAULT 0.06,
  projecao_vendas NUMERIC(12,2) DEFAULT 0,
  lucro_desejado  NUMERIC(5,2) DEFAULT 10,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ingredientes diretos
CREATE TABLE IF NOT EXISTS ingredientes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  nome               TEXT NOT NULL,
  unidade            TEXT NOT NULL DEFAULT 'kg',
  preco_atual        NUMERIC(10,4) NOT NULL DEFAULT 0,
  preco_anterior     NUMERIC(10,4),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ingredientes indiretos (embalagens, descartáveis)
CREATE TABLE IF NOT EXISTS ingredientes_indiretos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  nome               TEXT NOT NULL,
  unidade            TEXT NOT NULL DEFAULT 'unidade',
  preco              NUMERIC(10,4) NOT NULL DEFAULT 0,
  qtde_mes           NUMERIC(10,2) DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Preparações (bases e subreceitas)
CREATE TABLE IF NOT EXISTS preparacoes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  nome               TEXT NOT NULL,
  rendimento         TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ingredientes de uma preparação
CREATE TABLE IF NOT EXISTS preparacao_ingredientes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preparacao_id  UUID REFERENCES preparacoes(id) ON DELETE CASCADE NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE NOT NULL,
  quantidade     NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Produtos (fichas de custo)
CREATE TABLE IF NOT EXISTS produtos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  nome               TEXT NOT NULL,
  tamanho            TEXT,
  filtro             TEXT,
  preco_atual        NUMERIC(10,2) DEFAULT 0,
  categoria          TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ingredientes de um produto
CREATE TABLE IF NOT EXISTS produto_ingredientes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id     UUID REFERENCES produtos(id) ON DELETE CASCADE NOT NULL,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE NOT NULL,
  quantidade     NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Despesas fixas do negócio
CREATE TABLE IF NOT EXISTS despesas (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  descricao          TEXT NOT NULL,
  valor              NUMERIC(12,2) NOT NULL DEFAULT 0,
  categoria          TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Salários da equipe
CREATE TABLE IF NOT EXISTS salarios (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  funcao             TEXT NOT NULL,
  salario            NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Pró-labore dos sócios
CREATE TABLE IF NOT EXISTS prolabore (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  nome               TEXT NOT NULL,
  valor              NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Lançamentos do fluxo de caixa
CREATE TABLE IF NOT EXISTS lancamentos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  data               DATE NOT NULL,
  tipo               TEXT NOT NULL CHECK (tipo IN ('FL','MP','FX','VA','TX','OP')),
  descricao          TEXT,
  valor              NUMERIC(12,2) NOT NULL DEFAULT 0,  -- positivo = entrada, negativo = saída
  conta              TEXT,
  fonte              TEXT DEFAULT 'manual',  -- 'manual' | 'cardapio_web' | 'importacao'
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Venda direta (produtos de revenda)
CREATE TABLE IF NOT EXISTS venda_direta (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  nome               TEXT NOT NULL,
  categoria          TEXT,
  custo              NUMERIC(10,4) DEFAULT 0,
  preco_atual        NUMERIC(10,2) DEFAULT 0,
  previsao_mes       INTEGER DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Categorias personalizadas (tags de custos, contas, etc.)
CREATE TABLE IF NOT EXISTS categorias_custom (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE NOT NULL,
  grupo              TEXT NOT NULL,  -- 'tipos', 'contas', 'despesa_cat', 'produto_cat'
  valor              TEXT NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(estabelecimento_id, grupo, valor)
);

-- =====================================================================
-- Row Level Security (RLS)
-- =====================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE estabelecimentos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes_indiretos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparacoes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparacao_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_ingredientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas                ENABLE ROW LEVEL SECURITY;
ALTER TABLE salarios                ENABLE ROW LEVEL SECURITY;
ALTER TABLE prolabore               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_direta            ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_custom       ENABLE ROW LEVEL SECURITY;

-- ─── Políticas: Estabelecimentos ─────────────────────────────────────
CREATE POLICY "usuarios_veem_seu_estabelecimento"
  ON estabelecimentos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "usuarios_inserem_seu_estabelecimento"
  ON estabelecimentos FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "usuarios_atualizam_seu_estabelecimento"
  ON estabelecimentos FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "usuarios_deletam_seu_estabelecimento"
  ON estabelecimentos FOR DELETE
  USING (user_id = auth.uid());

-- ─── Função auxiliar para buscar o estabelecimento_id do usuário ─────
CREATE OR REPLACE FUNCTION get_meu_estabelecimento_id()
RETURNS UUID AS $$
  SELECT id FROM estabelecimentos WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── Macro para criar políticas padrão em tabelas com estabelecimento_id ─
-- (Aplicamos manualmente para cada tabela abaixo)

-- Ingredientes
CREATE POLICY "ingredientes_select" ON ingredientes FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "ingredientes_insert" ON ingredientes FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "ingredientes_update" ON ingredientes FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "ingredientes_delete" ON ingredientes FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Ingredientes Indiretos
CREATE POLICY "ingr_indir_select" ON ingredientes_indiretos FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "ingr_indir_insert" ON ingredientes_indiretos FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "ingr_indir_update" ON ingredientes_indiretos FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "ingr_indir_delete" ON ingredientes_indiretos FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Preparações
CREATE POLICY "preparacoes_select" ON preparacoes FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "preparacoes_insert" ON preparacoes FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "preparacoes_update" ON preparacoes FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "preparacoes_delete" ON preparacoes FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Preparação Ingredientes
CREATE POLICY "prep_ingr_select" ON preparacao_ingredientes FOR SELECT
  USING (preparacao_id IN (
    SELECT id FROM preparacoes WHERE estabelecimento_id = get_meu_estabelecimento_id()
  ));
CREATE POLICY "prep_ingr_insert" ON preparacao_ingredientes FOR INSERT
  WITH CHECK (preparacao_id IN (
    SELECT id FROM preparacoes WHERE estabelecimento_id = get_meu_estabelecimento_id()
  ));
CREATE POLICY "prep_ingr_update" ON preparacao_ingredientes FOR UPDATE
  USING (preparacao_id IN (
    SELECT id FROM preparacoes WHERE estabelecimento_id = get_meu_estabelecimento_id()
  ));
CREATE POLICY "prep_ingr_delete" ON preparacao_ingredientes FOR DELETE
  USING (preparacao_id IN (
    SELECT id FROM preparacoes WHERE estabelecimento_id = get_meu_estabelecimento_id()
  ));

-- Produtos
CREATE POLICY "produtos_select" ON produtos FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "produtos_insert" ON produtos FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "produtos_update" ON produtos FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "produtos_delete" ON produtos FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Produto Ingredientes
CREATE POLICY "prod_ingr_select" ON produto_ingredientes FOR SELECT
  USING (produto_id IN (
    SELECT id FROM produtos WHERE estabelecimento_id = get_meu_estabelecimento_id()
  ));
CREATE POLICY "prod_ingr_insert" ON produto_ingredientes FOR INSERT
  WITH CHECK (produto_id IN (
    SELECT id FROM produtos WHERE estabelecimento_id = get_meu_estabelecimento_id()
  ));
CREATE POLICY "prod_ingr_update" ON produto_ingredientes FOR UPDATE
  USING (produto_id IN (
    SELECT id FROM produtos WHERE estabelecimento_id = get_meu_estabelecimento_id()
  ));
CREATE POLICY "prod_ingr_delete" ON produto_ingredientes FOR DELETE
  USING (produto_id IN (
    SELECT id FROM produtos WHERE estabelecimento_id = get_meu_estabelecimento_id()
  ));

-- Despesas
CREATE POLICY "despesas_select" ON despesas FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "despesas_insert" ON despesas FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "despesas_update" ON despesas FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "despesas_delete" ON despesas FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Salários
CREATE POLICY "salarios_select" ON salarios FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "salarios_insert" ON salarios FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "salarios_update" ON salarios FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "salarios_delete" ON salarios FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Pró-labore
CREATE POLICY "prolabore_select" ON prolabore FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "prolabore_insert" ON prolabore FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "prolabore_update" ON prolabore FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "prolabore_delete" ON prolabore FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Lançamentos
CREATE POLICY "lancamentos_select" ON lancamentos FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "lancamentos_insert" ON lancamentos FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "lancamentos_update" ON lancamentos FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "lancamentos_delete" ON lancamentos FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Venda Direta
CREATE POLICY "venda_direta_select" ON venda_direta FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "venda_direta_insert" ON venda_direta FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "venda_direta_update" ON venda_direta FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "venda_direta_delete" ON venda_direta FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- Categorias Custom
CREATE POLICY "categorias_select" ON categorias_custom FOR SELECT
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "categorias_insert" ON categorias_custom FOR INSERT
  WITH CHECK (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "categorias_update" ON categorias_custom FOR UPDATE
  USING (estabelecimento_id = get_meu_estabelecimento_id());
CREATE POLICY "categorias_delete" ON categorias_custom FOR DELETE
  USING (estabelecimento_id = get_meu_estabelecimento_id());

-- =====================================================================
-- Índices para melhor performance
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_ingredientes_estab ON ingredientes(estabelecimento_id);
CREATE INDEX IF NOT EXISTS idx_produtos_estab ON produtos(estabelecimento_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_estab ON lancamentos(estabelecimento_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_despesas_estab ON despesas(estabelecimento_id);
