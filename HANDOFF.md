# Handoff Doc — Custo & Caixa

Este documento resume o estado atual do projeto de Gestão de Custo e Caixa para o setor de alimentação.

## 🚀 Status do Projeto: Etapa 1 Concluída
A estrutura de frontend e o esquema de banco de dados foram finalizados. A aplicação é totalmente funcional com dados mockados para demonstração imediata.

---

## 🛠 Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Iconografia:** Lucide React
- **Gráficos:** Recharts
- **Banco de Dados:** Supabase (Auth + PostgreSQL)
- **Deploy Sugerido:** Vercel

---

## 📂 Estrutura de Pastas Principal
- `/app`: Rotas e layouts da aplicação.
  - `/(main)`: Grupo de rotas autenticadas que compartilham Sidebar/Topbar.
- `/components`: Componentes React reutilizáveis.
  - `ui-helpers.tsx` e `tooltip.tsx`: Componentes específicos de design.
- `/lib`: Lógica compartilhada e dados mock.
  - `mock-data.ts`: Centraliza as informações exibidas atualmente.
- `/supabase`: Configurações e migrações.
  - `/migrations/001_initial.sql`: Schema completo do banco de dados.

---

## ⚖️ Lógicas de Negócio Implementadas
- **Markup:** `1 - (Taxa + Margem Desejada)`.
- **Custo Direto:** Soma ponderada dos ingredientes por rendimento.
- **Margem de Lucro:** `(Preço - Custo) / Preço * 100`.
- **Salários:** Cálculo automático de provisões (18% de encargos/ férias/ 13º).
- **Meta Ads:** Ponto de equilíbrio baseado no orçamento de anúncios e margem do produto selecionado.

---

## 🏁 Próximos Passos
1. **Supabase Setup:**
   - Criar projeto no Supabase.
   - Executar o script em `supabase/migrations/001_initial.sql` no Editor SQL.
2. **Integração de Dados:**
   - Implementar Authentication (Register/Login).
   - Criar hooks para substituir o `mock-data.ts` por dados reais do banco usando `@supabase/ssr`.
3. **Deploy:**
   - Conectar o repositório à Vercel.
   - Configurar as variáveis de ambiente (`URL` e `ANON_KEY` do Supabase).

---

## 🎨 Identidade Visual
- **Background:** `#F5F3EF` (Bege suave).
- **Acento:** `#2C6E49` (Verde premium).
- **Tipografia:** `Cormorant Garamond` (Títulos/Valores) e `DM Sans` (Interface).
- **Raio de Borda:** `14px` em todos os cards estruturais.

---
*Documento gerado para handoff da etapa de Frontend Scaffolding.*
