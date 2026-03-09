# AGENTS.md — Custo & Caixa
> Arquivo de contexto para Antigravity (e qualquer AI coding agent).
> Leia este arquivo inteiro antes de gerar qualquer código.
> Última atualização: nicho universal, tamanho opcional, margem definida pelo dono.

---

## 1. O que é este projeto

**Custo & Caixa** — SaaS de gestão financeira para qualquer negócio do setor de alimentação. O produto resolve um problema universal em food: donos não sabem o custo real de cada prato, precificam no cheiro e não têm visibilidade de margem por produto integrada ao fluxo de caixa.

Funciona para pizzaria, hamburgueria, cafeteria, confeitaria, food truck, japonês, ou qualquer outro nicho de food. A lógica de negócio é idêntica para todos — o que muda são nomes, categorias e unidades de medida, que o próprio dono configura.

Existe um protótipo funcional em HTML/JS vanilla (`gestao_custo_caixa_v4.html`) que é a fonte da verdade para comportamento e design.

---

## 2. Stack obrigatória

```
Next.js 14          → App Router (não Pages Router)
TypeScript          → strict: true, sem "any" em nenhuma circunstância
Tailwind CSS        → utilitários core apenas, sem plugins de terceiros
shadcn/ui           → componentes base (Button, Input, Select, Card, Badge, Dialog)
Recharts            → todos os gráficos
Supabase            → banco PostgreSQL + Auth
  └── OBRIGATÓRIO usar @supabase/ssr
  └── PROIBIDO usar @supabase/auth-helpers-nextjs (deprecated)
Vercel              → deploy (zero config adicional necessário)
```

---

## 3. Regras absolutas — nunca viole

### TypeScript
- `any` é proibido. Use `unknown` + type guard se necessário.
- Todos os tipos de domínio ficam em `src/types/index.ts`
- Props de componentes sempre tipadas com interface explícita

### Supabase / Auth
```ts
// ✅ CORRETO
import { createServerClient } from '@supabase/ssr'
cookieStore.getAll()
cookieStore.setAll()

// ❌ PROIBIDO — quebra sessão em produção
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
cookies().get()
cookies().set()
cookies().remove()
```
- RLS ativo em todas as tabelas — sem exceção
- Toda query filtra por `estabelecimento_id`
- Nunca exponha a `service_role` key no cliente

### Next.js
- Preferir Server Components — `use client` apenas quando necessário
- Data fetching em Server Components ou Server Actions
- Sem `useEffect` para buscar dados
- Rotas de API apenas para webhooks externos

### Componentes
- Nomes em kebab-case: `cost-card.tsx`, `margin-badge.tsx`
- Um componente por arquivo
- Sempre incluir estado de loading e erro
- Sem lógica de negócio dentro de componentes

---

## 4. Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── ingredientes/page.tsx
│   │   ├── preparacoes/page.tsx
│   │   ├── produtos/page.tsx
│   │   ├── venda-direta/page.tsx
│   │   ├── despesas/page.tsx
│   │   ├── caixa/page.tsx
│   │   ├── fechamento/page.tsx
│   │   ├── meta-ads/page.tsx
│   │   ├── categorias/page.tsx
│   │   └── integracao/page.tsx
│   └── api/
│       ├── cardapio-web/route.ts
│       └── meta-ads/route.ts
├── components/
│   ├── ui/                         ← shadcn/ui (não editar)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   └── shared/
│       ├── margin-badge.tsx        ← usa thresholds do dono, nunca fixos
│       ├── kpi-card.tsx
│       └── data-table.tsx
├── hooks/
│   ├── use-markup.ts
│   ├── use-margem.ts
│   ├── use-breakeven.ts            ← baseado em ticket médio, não produto
│   └── use-estabelecimento.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── formulas.ts                 ← toda lógica de cálculo pura
│   ├── nicho-presets.ts            ← presets de categorias por nicho
│   └── utils.ts
├── types/
│   └── index.ts
└── middleware.ts
```

---

## 5. Tipos de domínio

```ts
// src/types/index.ts

export type NichoFood =
  | 'pizzaria'
  | 'hamburgueria'
  | 'cafeteria'
  | 'confeitaria'
  | 'food_truck'
  | 'japones'
  | 'outro'

export interface Estabelecimento {
  id: string
  user_id: string
  nome: string
  nicho: NichoFood
  nicho_custom: string | null       // preenchido quando nicho = 'outro'
  regime_tributario: 'simples_6' | 'simples_12' | 'lucro_presumido' | 'mei'
  imposto: number                   // decimal: 0.06 = 6%
  projecao_vendas: number
  lucro_desejado: number            // decimal: 0.10 = 10%
  markup: number                    // calculado: 1 - imposto - lucro_desejado

  // Thresholds definidos pelo dono — sem valor normativo imposto pelo sistema
  margem_minima: number             // decimal: 0.08 = 8%
  margem_alvo: number               // decimal: 0.20 = 20%

  created_at: string
}

export interface Ingrediente {
  id: string
  estabelecimento_id: string
  nome: string
  unidade: string                   // livre — kg, g, litro, ml, unidade, porção, fatia, dose, xícara...
  preco_atual: number
  preco_anterior: number | null
  created_at: string
}

export interface IngredienteIndireto {
  id: string
  estabelecimento_id: string
  nome: string
  unidade: string
  preco: number
  qtde_mes: number
}

export interface Preparacao {
  id: string
  estabelecimento_id: string
  nome: string                      // livre: "Massa de Pizza", "Blend de Carne", "Ganache"
  rendimento: string                // livre: "1 unidade", "500g", "10 porções"
  ingredientes: PreparacaoIngrediente[]
}

export interface PreparacaoIngrediente {
  id: string
  preparacao_id: string
  ingrediente_id: string | null
  nome_avulso: string | null
  preco_avulso: number | null
  quantidade: number
}

export interface Produto {
  id: string
  estabelecimento_id: string
  nome: string
  tamanho: string | null            // OPCIONAL — null se não tiver variação de tamanho
  categoria: string                 // livre — definido pelo dono em Categorias
  preco_atual: number
  ingredientes: ProdutoIngrediente[]
}

export interface ProdutoIngrediente {
  id: string
  produto_id: string
  ingrediente_id: string
  quantidade: number
}

export interface Despesa {
  id: string
  estabelecimento_id: string
  descricao: string
  valor: number
  categoria: string
}

export interface Salario {
  id: string
  estabelecimento_id: string
  funcao: string
  salario: number
}

export interface Prolabore {
  id: string
  estabelecimento_id: string
  nome: string
  valor: number
}

export interface Lancamento {
  id: string
  estabelecimento_id: string
  data: string
  tipo: TipoLancamento
  descricao: string
  valor: number                     // positivo = entrada, negativo = saída
  conta: string
  fonte: 'manual' | 'cardapio_web' | null
}

export type TipoLancamento = 'FL' | 'MP' | 'FX' | 'VA' | 'TX' | 'OP'

export interface VendaDireta {
  id: string
  estabelecimento_id: string
  nome: string
  categoria: string
  custo: number
  preco_atual: number
  previsao_mes: number
}

export interface CategoriaCustom {
  id: string
  estabelecimento_id: string
  grupo: 'tipo_lancamento' | 'conta_bancaria' | 'categoria_despesa' | 'categoria_produto' | 'unidade_medida'
  valor: string
}

// Resultado de cálculo — nunca persistir no banco
export interface ResultadoMargem {
  custo_direto: number
  custo_total: number
  margem_pct: number
  preco_sugerido: number
  status: 'acima_alvo' | 'aceitavel' | 'abaixo_minima' | 'negativa'
}

// Meta Ads — baseado em ticket médio real, não produto específico
export interface ResultadoBreakeven {
  vendas_minimas: number
  pedidos_minimos: number
  ticket_medio: number              // do histórico real (Cardápio Web) ou manual
  margem_media: number
}
```

---

## 6. Fórmulas de negócio — fonte da verdade

```ts
// src/lib/formulas.ts

export function calcMarkup(imposto: number, lucroDesejado: number): number {
  return 1 - imposto - lucroDesejado
}

export function calcCustoDirecto(
  ingredientes: Array<{ preco: number; quantidade: number }>
): number {
  return ingredientes.reduce((sum, i) => sum + i.preco * i.quantidade, 0)
}

// Custo total inclui rateio proporcional dos fixos sobre o produto
export function calcCustoTotal(
  custoDirecto: number,
  precoAtual: number,
  totalFixos: number,
  projecaoVendas: number
): number {
  const rateio = projecaoVendas > 0 ? (totalFixos / projecaoVendas) * precoAtual : 0
  return custoDirecto + rateio
}

export function calcMargem(precoAtual: number, custoTotal: number): number {
  if (precoAtual <= 0) return 0
  return ((precoAtual - custoTotal) / precoAtual) * 100
}

export function calcPrecoSugerido(custoDirecto: number, markup: number): number {
  return markup > 0 ? custoDirecto / markup : 0
}

export function calcTotalFixos(
  despesas: number,
  salarios: number,
  prolabore: number
): number {
  return despesas + salarios * 1.18 + prolabore
}

// ─── MARGEM ───────────────────────────────────────────────
// Status baseado nos thresholds do PRÓPRIO DONO.
// NUNCA usar valores fixos. NUNCA retornar labels como "Excelente" ou "Crítico".
// Margem negativa é a única exceção — sempre indica erro operacional.
export function getStatusMargem(
  margem: number,
  minimaAceitavel: number,  // vem de estabelecimento.margem_minima
  alvo: number              // vem de estabelecimento.margem_alvo
): 'acima_alvo' | 'aceitavel' | 'abaixo_minima' | 'negativa' {
  if (margem < 0)                      return 'negativa'
  if (margem >= alvo * 100)            return 'acima_alvo'
  if (margem >= minimaAceitavel * 100) return 'aceitavel'
  return 'abaixo_minima'
}

// ─── META ADS ─────────────────────────────────────────────
// Anúncios de restaurante são genéricos — a pessoa entra e pede o que quiser.
// O breakeven usa ticket médio e margem média do estabelecimento,
// não a margem de um produto específico.
export function calcBreakevenPedidos(
  orcamento: number,
  ticketMedio: number,
  margemMedia: number     // decimal: 0.35 = 35%
): { vendasMinimas: number; pedidosMinimos: number } {
  const vendasMinimas = margemMedia > 0 ? orcamento / margemMedia : 0
  const pedidosMinimos = ticketMedio > 0 ? Math.ceil(vendasMinimas / ticketMedio) : 0
  return { vendasMinimas, pedidosMinimos }
}
```

---

## 7. Onboarding — seleção de nicho

No primeiro acesso o dono escolhe o tipo de estabelecimento. Isso carrega presets de categorias e unidades — nada mais. Não define thresholds de margem, não bloqueia funcionalidades.

```ts
// src/lib/nicho-presets.ts

export const NICHO_PRESETS: Record<NichoFood, NichoPreset> = {
  pizzaria: {
    categorias_produto: ['Pizzas', 'Bebidas', 'Porções', 'Sobremesas'],
    categorias_despesa: ['Aluguel', 'Energia', 'Água', 'Sistema', 'Publicidade', 'Contabilidade'],
    unidades: ['kg', 'g', 'litro', 'ml', 'unidade'],
    contas: ['Caixa', 'Pix', 'Crédito', 'Débito'],
  },
  hamburgueria: {
    categorias_produto: ['Hambúrgueres', 'Bebidas', 'Porções', 'Sobremesas', 'Combos'],
    categorias_despesa: ['Aluguel', 'Energia', 'Embalagens', 'Publicidade', 'Contabilidade'],
    unidades: ['kg', 'g', 'unidade', 'fatia', 'porcao'],
    contas: ['Caixa', 'Pix', 'Crédito', 'Débito'],
  },
  cafeteria: {
    categorias_produto: ['Cafés', 'Doces', 'Salgados', 'Bebidas Frias', 'Especiais'],
    categorias_despesa: ['Aluguel', 'Energia', 'Insumos', 'Manutenção', 'Contabilidade'],
    unidades: ['g', 'ml', 'xicara', 'dose', 'unidade'],
    contas: ['Caixa', 'Pix', 'Crédito', 'Débito'],
  },
  confeitaria: {
    categorias_produto: ['Bolos', 'Doces', 'Tortas', 'Encomendas', 'Bebidas'],
    categorias_despesa: ['Aluguel', 'Energia', 'Embalagens', 'Insumos', 'Contabilidade'],
    unidades: ['kg', 'g', 'unidade', 'fatia', 'porcao'],
    contas: ['Caixa', 'Pix', 'Crédito', 'Débito'],
  },
  food_truck: {
    categorias_produto: ['Pratos', 'Bebidas', 'Combos', 'Sobremesas'],
    categorias_despesa: ['Combustível', 'Manutenção', 'Embalagens', 'Taxa de Ponto', 'Contabilidade'],
    unidades: ['kg', 'g', 'unidade', 'porcao'],
    contas: ['Caixa', 'Pix', 'Crédito', 'Débito'],
  },
  japones: {
    categorias_produto: ['Sushis', 'Temakis', 'Hot Rolls', 'Yakisobas', 'Bebidas', 'Combos'],
    categorias_despesa: ['Aluguel', 'Energia', 'Insumos', 'Embalagens', 'Contabilidade'],
    unidades: ['g', 'kg', 'unidade', 'porcao', 'fatia'],
    contas: ['Caixa', 'Pix', 'Crédito', 'Débito'],
  },
  outro: {
    categorias_produto: ['Pratos', 'Bebidas', 'Sobremesas'],
    categorias_despesa: ['Aluguel', 'Energia', 'Insumos', 'Contabilidade'],
    unidades: ['kg', 'g', 'litro', 'ml', 'unidade'],
    contas: ['Caixa', 'Pix', 'Crédito', 'Débito'],
  },
}

interface NichoPreset {
  categorias_produto: string[]
  categorias_despesa: string[]
  unidades: string[]
  contas: string[]
}
```

**Regras:**
- Presets são ponto de partida — tudo editável depois em Categorias
- `margem_minima` e `margem_alvo` são configurados em Despesas → Configurações
- Campos livres, sem sugestão de valor, sem texto dizendo o que é "bom" ou "ruim"

---

## 8. Schema do banco (Supabase)

```sql
-- supabase/migrations/001_initial.sql

create table estabelecimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nome text not null,
  nicho text not null default 'outro',
  nicho_custom text,
  regime_tributario text not null default 'simples_6',
  imposto numeric not null default 0.06,
  projecao_vendas numeric not null default 0,
  lucro_desejado numeric not null default 0.10,
  markup numeric generated always as (1 - imposto - lucro_desejado) stored,
  margem_minima numeric not null default 0.08,
  margem_alvo numeric not null default 0.20,
  created_at timestamptz default now()
);
alter table estabelecimentos enable row level security;
create policy "owner only" on estabelecimentos
  using (auth.uid() = user_id);

create table ingredientes (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  nome text not null,
  unidade text not null,
  preco_atual numeric not null,
  preco_anterior numeric,
  created_at timestamptz default now()
);

create table ingredientes_indiretos (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  nome text not null,
  unidade text not null,
  preco numeric not null,
  qtde_mes integer not null default 0
);

create table preparacoes (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  nome text not null,
  rendimento text
);

create table preparacao_ingredientes (
  id uuid primary key default gen_random_uuid(),
  preparacao_id uuid references preparacoes not null,
  ingrediente_id uuid references ingredientes,
  nome_avulso text,
  preco_avulso numeric,
  quantidade numeric not null
);

create table produtos (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  nome text not null,
  tamanho text,                        -- NULLABLE: campo opcional
  categoria text not null,
  preco_atual numeric not null default 0
);

create table produto_ingredientes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid references produtos not null,
  ingrediente_id uuid references ingredientes not null,
  quantidade numeric not null
);

create table despesas (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  descricao text not null,
  valor numeric not null,
  categoria text not null default 'Operacional'
);

create table salarios (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  funcao text not null,
  salario numeric not null
);

create table prolabore (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  nome text not null,
  valor numeric not null
);

create table lancamentos (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  data date not null,
  tipo text not null,
  descricao text not null,
  valor numeric not null,
  conta text not null,
  fonte text default 'manual'
);

create table venda_direta (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  nome text not null,
  categoria text not null,
  custo numeric not null,
  preco_atual numeric not null,
  previsao_mes integer not null default 0
);

create table categorias_custom (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos not null,
  grupo text not null,
  valor text not null
);

-- RLS em todas as tabelas via estabelecimento_id
do $$ declare t text;
begin
  foreach t in array array[
    'ingredientes','ingredientes_indiretos','preparacoes','preparacao_ingredientes',
    'produtos','produto_ingredientes','despesas','salarios','prolabore',
    'lancamentos','venda_direta','categorias_custom'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "owner only" on %I using (
        estabelecimento_id in (
          select id from estabelecimentos where user_id = auth.uid()
        )
      )', t, t
    );
  end loop;
end $$;
```

---

## 9. Design system

### Tipografia
```css
/* Títulos, KPIs, valores grandes */
font-family: 'Cormorant Garamond', serif;
font-weight: 300 | 400 | 500;

/* Interface: labels, botões, tabelas, nav */
font-family: 'DM Sans', sans-serif;
font-weight: 300 | 400 | 500 | 600;
```

### Paleta
```
Background:   #F5F3EF
Surface:      #FFFFFF
Surface-2:    #F9F8F5
Accent:       #2C6E49
Accent-light: #E8F2ED
Red:          #C0392B
Red-light:    #FBEAE8
Yellow:       #D97706
Yellow-light: #FEF3C7
Text:         #1C1C1E
Text-2:       #6E6E73
Text-3:       #AEAEB2
Border:       rgba(0,0,0,0.07)
```

### Tailwind config
```ts
colors: {
  bg: '#F5F3EF',
  surface: '#FFFFFF',
  'surface-2': '#F9F8F5',
  accent: '#2C6E49',
  'accent-light': '#E8F2ED',
  danger: '#C0392B',
  'danger-light': '#FBEAE8',
  warning: '#D97706',
  'warning-light': '#FEF3C7',
}
```

### Layout
- Sidebar fixa: `w-[228px]`
- Topbar sticky: `backdrop-blur-md bg-[#F5F3EF]/90`
- Cards: `rounded-[14px]`
- Elementos internos: `rounded-[8px]`
- Sombra: `shadow-sm`

### Margin badge
```
acima_alvo    → bg-accent-light  text-accent   (margem ≥ alvo do dono)
aceitavel     → bg-accent-light  text-accent   (entre mínima e alvo)
abaixo_minima → bg-warning-light text-warning  (abaixo do mínimo do dono)
negativa      → bg-danger-light  text-danger   (único caso sempre vermelho)

NUNCA usar labels: "Excelente", "Saudável", "Atenção", "Crítico".
Exibir apenas o número da margem + cor correspondente.
```

---

## 10. Módulos e comportamento esperado

### Dashboard
- 4 KPIs: Faturamento Bruto, Custo dos Insumos, Custos Fixos + Equipe, Lucro Estimado
- Gráfico de linha: fluxo diário do mês
- Gráfico de barras: distribuição por tipo de lançamento
- Tabela de margem por produto com badge usando thresholds do dono
- Alerta apenas para margem negativa — sem alertas normativos

### Ingredientes
- CRUD com unidade livre (select alimentado por categorias_custom + preset do nicho)
- Variação de preço vs mês anterior
- Ingredientes indiretos com qtde/mês

### Preparações
- Nome e rendimento livres
- Custo calculado automaticamente

### Produtos (Fichas de Custo)
- Tamanho é opcional — se null, filtro de tamanho não aparece
- Filtros por categoria (categorias do dono, não fixas)
- Exibe: custo direto, custo total, markup, preço sugerido, preço praticado, margem
- Preço editável inline

### Venda Direta
- Itens sem ficha de custo
- Markup configurável por item

### Despesas & Salários
- Pró-labore separado dos salários
- Configurações: `margem_minima` e `margem_alvo` — campos livres, sem sugestão de valor
- Markup calculado ao vivo

### Fluxo de Caixa
- Tipos: FL / MP / FX / VA / TX / OP
- Saldo acumulado por dia
- Resumo por conta bancária
- Exportação CSV

### Fechamento do Mês
- 4 passos: checklist → notas fiscais → revisão de custos → DRE

### Meta Ads
- Lógica baseada em ticket médio do estabelecimento, não produto específico
- Campos: orçamento do anúncio + ticket médio (automático se Cardápio Web conectado)
- Resultado: quantos pedidos novos o anúncio precisa gerar para se pagar
- Sem seletor de produto

### Integração Cardápio Web
- Importação de pedidos alimenta Fluxo de Caixa + ticket médio do Meta Ads

### Categorias
- 5 grupos: tipo de lançamento, contas bancárias, categorias de despesa, categorias de produto, unidades de medida
- Categorias do sistema bloqueadas para exclusão
- Alterações refletem em todos os selects do sistema

---

## 11. Integrações externas

### Cardápio Web API
- Bearer token do usuário
- `GET /loja`, `GET /catalogo/produtos`, `GET /pedidos?inicio=&fim=`
- Webhook: `POST /api/cardapio-web/webhook`

### Meta Marketing API
- Processar em `/api/meta-ads/route.ts` — nunca no cliente
- `GET /act_{id}/campaigns?fields=name,status,spend,actions&date_preset=last_7d`

---

## 12. Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
META_API_BASE_URL=https://graph.facebook.com/v19.0
```

---

## 13. O que NUNCA fazer

```
❌ localStorage para dados de negócio
❌ any no TypeScript
❌ @supabase/auth-helpers-nextjs
❌ cookies().get() / .set() / .remove() individuais
❌ useEffect para data fetching
❌ Lógica de cálculo dentro de componentes
❌ Duplicar fórmulas de formulas.ts
❌ Queries sem filtro por estabelecimento_id
❌ service_role key no cliente
❌ Thresholds de margem fixos no código
❌ Labels normativos: "Excelente", "Saudável", "Atenção", "Crítico"
❌ Tamanho obrigatório em produto
❌ Categorias de nicho fixas e não editáveis
❌ Seletor de produto no módulo Meta Ads
❌ Tipografia Inter / layout de SaaS genérico
❌ Interface em inglês
```

---

## 14. Idioma

**Interface 100% em português brasileiro.**

- "Custo dos Insumos" (não CMV)
- "Pró-labore" (não "salário do sócio")
- "Fichas de Custo" (não "product costs")
- "Ponto de Equilíbrio" (não "breakeven")
- "Lançamento" (não "transaction")
- "Estabelecimento" (não "store" ou "tenant")
