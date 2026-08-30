# Design Spec: CRM Integrador

## 1. Visão Geral
O CRM Integrador é uma plataforma de gestão para empresas de Energia Solar. Baseado na experiência visual do Twenty CRM, o sistema utilizará uma arquitetura totalmente moderna com Supabase no backend e um frontend reativo criado do zero com Vite + React. O objetivo é orquestrar múltiplos perfis (vendedores, gestores, projetistas, instaladores, etc.), unificando as funcionalidades desenvolvidas anteriormente no CRM Saas e CRM Solar.

## 2. Arquitetura

### 2.1 Backend e Banco de Dados (Supabase)
- **Supabase Auth**: Gerenciamento de login.
- **PostgreSQL**: Banco de dados relacional gerido pelo Supabase.
- **Row Level Security (RLS)**: Pilar fundamental da segurança. As regras de acesso são definidas direto no banco. Cada usuário visualiza e interage apenas com os registros permitidos pela sua hierarquia (ex: Comercial acessa seus clientes, Gestor acessa seus projetos).
- **Edge Functions**: Integrações externas rodando isoladas do frontend (Evolution API para WhatsApp, Resend para E-mail, Asaas para pagamentos).

### 2.2 Frontend (Vite + React)
- **Framework**: Vite + React + Tailwind CSS (com inspiração visual forte no Twenty CRM).
- **Gerenciamento de Estado**: 
  - **Zustand** para estado global (Sessão, UI state).
  - **TanStack Query (React Query)** para data fetching, cache e paginação junto ao client do Supabase.
- **Single Page Application (SPA)**: Base de código única. O roteamento dinâmico bloqueará acessos indevidos e renderizará painéis específicos com base no `role` do usuário.

## 3. Modelo de Dados e Hierarquia

**Tabela `profiles`**:
- Estende os usuários da `auth.users` do Supabase.
- Armazena a *Role* principal (Super Admin, Integrador, Comercial, Gestor de Projetos, Projetista, Instalador, Vistoriador, Financeiro, Contador).
- Armazena a *Hierarquia* (ex: id do gestor ou coordenador acima).

## 4. O Coração da Interface: "Modal de Clientes"
O fluxo principal de gestão ocorre através de um mega modal dinâmico:
- **Abas**: Clientes, Propostas, Projeto, Equipamentos, Homologação, Instalação.
- **Renderização Dinâmica**: A apresentação das abas e campos de edição é filtrada pela permissão do usuário. (ex: O Instalador não vê valores financeiros; o Vistoriador só vê os dados do cliente e a aba de vistoria).
- **Status Pipeline**: Progressão visual do projeto (Lead -> Em Contato -> Negócio Fechado -> ... -> Instalação -> Concluído). O sistema aplicará travas lógicas (ex: não permitir agendar instalação se o financiamento não estiver aprovado).

## 5. Integrações Externas
O sistema atua em conjunto com agentes que **não possuem login** (Logística, Distribuidor de Equipamentos, Loja, Concessionária).
- Comunicação feita via **Resend** (email automático com ordens de compra/solicitações).
- Integração de status via **Evolution API** (alertas no WhatsApp do cliente e dos fornecedores).

## 6. Testes e TDD
A abordagem de Test-Driven Development será utilizada para garantir a integridade do Row Level Security e dos fluxos lógicos antes da codificação das telas, assegurando máxima segurança contra vazamento de dados entre perfis.
