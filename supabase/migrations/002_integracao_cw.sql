-- Migration 002: Integração Cardápio Web
-- Adiciona tabelas e colunas para gerenciar a integração com o Cardápio Web

-- Tabela para armazenar as credenciais e configurações de integração
CREATE TABLE IF NOT EXISTS public.integracoes_cw (
    estabelecimento_id UUID PRIMARY KEY REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    token_api TEXT NOT NULL, -- TODO: migrar para bytea + pgsodium antes de ir para produção
    sincroniza_pedidos_ativo BOOLEAN DEFAULT false,
    ultimo_sync_catalogo TIMESTAMP WITH TIME ZONE,
    ultimo_sync_pedidos TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de logs da integração (auditoria)
CREATE TABLE IF NOT EXISTS public.integracao_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    estabelecimento_id UUID REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    acao TEXT NOT NULL, -- Ex: 'sync_catalogo', 'import_pedidos', 'webhook_recebido'
    status TEXT NOT NULL, -- Ex: 'sucesso', 'erro'
    mensagem TEXT,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar flag de sincronização no Catálogo (para não deletar itens que não vieram na API)
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS sincronizado BOOLEAN DEFAULT true;

ALTER TABLE public.categorias_custom 
ADD COLUMN IF NOT EXISTS sincronizado BOOLEAN DEFAULT true;

-- Adicionar campo "fonte" nos lançamentos para identificar importações do Cardápio Web
ALTER TABLE public.lancamentos 
ADD COLUMN IF NOT EXISTS fonte VARCHAR(50) DEFAULT 'manual';

-- Habilitar RLS
ALTER TABLE public.integracoes_cw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracao_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para integracoes_cw
CREATE POLICY "Usuários gerenciam integração do próprio estabelecimento"
    ON public.integracoes_cw FOR ALL
    USING (estabelecimento_id = public.get_meu_estabelecimento_id());

-- Políticas para integracao_logs
CREATE POLICY "Usuários veem logs do próprio estabelecimento"
    ON public.integracao_logs FOR SELECT
    USING (estabelecimento_id = public.get_meu_estabelecimento_id());

CREATE POLICY "Sistema insere logs para o estabelecimento"
    ON public.integracao_logs FOR INSERT
    WITH CHECK (estabelecimento_id = public.get_meu_estabelecimento_id());
