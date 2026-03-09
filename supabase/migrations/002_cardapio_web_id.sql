-- Adiciona coluna cardapio_web_id na tabela produtos para upsert por ID externo
-- e cria índice único para o upsert funcionar corretamente

ALTER TABLE produtos
    ADD COLUMN IF NOT EXISTS cardapio_web_id varchar(100) DEFAULT NULL;

ALTER TABLE produtos
    ADD CONSTRAINT produtos_estabelecimento_cardapio_web_id_key UNIQUE (estabelecimento_id, cardapio_web_id);
