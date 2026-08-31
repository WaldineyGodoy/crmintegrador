# Design Spec: Supabase Integration & B2B Marketplace

## 1. Visão Geral
Esta especificação detalha a arquitetura de banco de dados e integração backend para o CRM Integrador. O sistema transcende um CRM tradicional, operando como um **Marketplace B2B** que conecta empresas Integradoras a Prestadores de Serviço independentes (Instaladores, Vistoriadores, Engenheiros) de forma segura, utilizando Supabase Auth, RLS (Row Level Security) e Edge Functions.

## 2. Autenticação e Perfis (Roles)

### 2.1. Cadastro Descentralizado
- **Integradores (Equipe Interna):** Criam contas vinculadas a um `company_id` da sua respectiva integradora.
- **Prestadores de Serviço (Stakeholders Independentes):** Cadastram-se livremente no sistema para compor a base do Marketplace. 

### 2.2. A Tabela `profiles`
Estende o `auth.users` nativo do Supabase com os campos:
- `id`: UUID referenciando o usuário.
- `role`: Enum (Gestor, Vendedor, Instalador, Engenheiro, etc).
- `company_id`: ID da empresa (Integrador). Nulo se for prestador independente.
- `is_full_installer`: Booleano (Status equivalente a "Superhost").
- `marketplace_data`: JSONB contendo raio de atendimento, tabela de preços e pontuação (rating) acumulada.

## 3. Modelo Relacional e RLS (Segurança)

O "Mega Modal" do frontend é mapeado em tabelas isoladas para garantir segurança impenetrável por nível de linha (Row Level Security).

- **`clients`**: Dados do cliente final.
- **`projects`**: Tabela central contendo chaves como `assigned_installer_id`.
- **Tabelas de Contexto (Abas):**
  - `project_proposals`: Visibilidade estrita para a Integradora (RLS bloqueia Prestadores).
  - `project_equipments`: Equipamentos a serem instalados. Visível para Integradores e o Instalador atribuído.
  - `project_homologations`: Processo na concessionária. Visível para o Engenheiro atribuído.
  - `project_installations`: Agendamento, checklist e fotos. Editável pelo Instalador.

*Mecanismo RLS:* Um Prestador de Serviço só possui acesso de leitura a um `project` e leitura/escrita na sua respectiva aba (`project_installations`) se o seu UUID for igual ao `assigned_installer_id` daquele projeto.

## 4. Dinâmica do Marketplace: Contratação e Agendamento

O fluxo de terceirização de uma instalação (Aba Projeto -> Instalação) segue as seguintes mecânicas:

1. **Agenda Inteligente (Estilo Airbnb):** O CRM verificará uma tabela auxiliar `installer_availability`. O Gestor de Projetos pesquisa prestadores inserindo a data pretendida. O sistema filtra os instaladores exibindo apenas aqueles que não possuem conflito de datas com outros serviços (de qualquer integradora).
2. **Proposta de Contratação:** O Gestor visualiza preço, distância e pontuação, e envia a "Ordem de Serviço". O projeto entra em um status de `pending_installer_acceptance`.
3. **Aceite, Recusa e FullInstaller:**
   - **Fluxo Normal:** O Instalador recebe o convite e pode Aceitar ou Recusar a obra dentro do seu painel do CRM.
   - **Fluxo FullInstaller (Superhost):** Prestadores que atingem o nível máximo de excelência recebem essa flag. Se a agenda deles estiver livre na data solicitada, a aceitação é automática, pulando a etapa de revisão manual do instalador e confirmando o agendamento imediatamente para o Gestor.

## 5. Integrações Legadas (Event-Driven Edge Functions)

Para orquestrar a comunicação externa sem onerar o frontend, importaremos lógicas do WorkSpace 1 legado convertendo-as para reações automáticas (Triggers) no banco:

- **PostgreSQL Triggers:** Monitoram atualizações críticas, como quando um Gestor clica em "Contratar" ou quando um projeto atinge uma nova etapa do pipeline.
- **Edge Functions (Webhooks):** 
  - **Evolution API:** Uma Edge Function capta o evento de contratação no banco e dispara um WhatsApp automático para o Instalador: *"Você tem uma nova oferta de instalação da Integradora X para o dia Y. Acesse o CRM para aceitar."* (Ou aviso de aceite automático se for FullInstaller).
  - **Asaas:** Outras funções reagirão a mudanças de status financeiro na tabela de propostas para orquestrar boletos e PIX, migrando o código legado do arquivo `asaas_webhook.ts`.
