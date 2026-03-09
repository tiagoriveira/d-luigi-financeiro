-- Adiciona coluna cardapio_web_id na tabela produtos para upsert por ID externo
-- e cria índice único para o upsert funcionar corretamente

ALTER TABLE produtos
    ADD COLUMN IF NOT EXISTS cardapio_web_id varchar(100) DEFAULT NULL;

-- Índice único composto para garantir que o upsert funcione por (estabelecimento + id externo)
CREATE UNIQUE INDEX IF NOT EXISTS uq_produtos_estab_cw_id
    ON produtos (estabelecimento_id, cardapio_web_id)
    WHERE cardapio_web_id IS NOT NULL;
