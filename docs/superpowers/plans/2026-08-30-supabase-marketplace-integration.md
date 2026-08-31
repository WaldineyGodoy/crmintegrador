# Supabase Integration & Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inicializar o banco de dados Supabase via migrations, criar a tabela de perfis (profiles) e as tabelas estruturais do projeto com Políticas RLS rígidas e Edge Functions para o Marketplace.

**Architecture:** Modelagem relacional estrita com `projects` como entidade central. RLS no nível do banco bloqueando acessos indevidos às abas (project_proposals, project_installations). Webhooks disparados via Database Triggers para notificar o prestador autônomo via WhatsApp (Evolution API).

**Tech Stack:** Supabase CLI, PostgreSQL (Migrations & RLS), Deno (Edge Functions).

**Spec:** `docs/superpowers/specs/2026-08-30-supabase-marketplace-design.md`

## Global Constraints

- Utilizar `npx supabase ...` localmente para gerenciar migrations.
- Todo código SQL deve ser idempotente ou fazer parte de um arquivo de migration gerado via CLI.
- As Edge Functions devem usar Deno e ter um teste local.

---

### Task 1: Setup Supabase CLI & Tabela Profiles

**Files:**
- Create: `supabase/migrations/20260830000000_create_profiles.sql`
- Create: `tests/supabase_profiles.test.js`

**Interfaces:**
- Produces: Banco de dados rodando (ou scripts SQL corretos prontos para o ambiente) e a tabela `profiles` que estende `auth.users`.

- [ ] **Step 1: Inicializar o projeto Supabase**
```bash
npx supabase init
```
*(Caso não seja possível rodar o `supabase start` localmente via Docker, usaremos testes unitários apenas checando a validade da sintaxe SQL e a estrutura gerada).*

- [ ] **Step 2: Write the failing test**
Create `tests/supabase_profiles.test.js` para simular que a tabela existe (testando o script de migration gerado):
```javascript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Supabase Profiles Migration', () => {
  it('should have a migration file that creates the profiles table and trigger', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('create_profiles.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('CREATE TABLE public.profiles');
    expect(content).toContain('CREATE TRIGGER on_auth_user_created');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npm run test tests/supabase_profiles.test.js`

- [ ] **Step 4: Write minimal implementation**
Create the migration file manually ou via `npx supabase migration new create_profiles`. 
No arquivo criado `supabase/migrations/*_create_profiles.sql`, adicione:
```sql
CREATE TYPE public.user_role AS ENUM ('Integrador', 'Gestor', 'Comercial', 'Instalador', 'Engenheiro');

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role public.user_role NOT NULL DEFAULT 'Instalador',
    company_id UUID,
    is_full_installer BOOLEAN DEFAULT false,
    marketplace_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger para criar o profile ao cadastrar no auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'Instalador');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

- [ ] **Step 5: Run test to verify it passes**
Run: `npm run test tests/supabase_profiles.test.js`

- [ ] **Step 6: Commit**
```bash
git add supabase/ tests/
git commit -m "feat: supabase init and profiles migration"
```

---

### Task 2: Entidades Relacionais do CRM e Marketplace

**Files:**
- Create: `supabase/migrations/20260830000001_create_core_tables.sql`
- Create: `tests/supabase_core_tables.test.js`

**Interfaces:**
- Produces: Tabelas `clients`, `projects`, `project_proposals`, `project_installations`, e `installer_availability`.

- [ ] **Step 1: Write the failing test**
Create `tests/supabase_core_tables.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Core Tables Migration', () => {
  it('should define the mega modal tables and marketplace availability', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('create_core_tables.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('CREATE TABLE public.projects');
    expect(content).toContain('CREATE TABLE public.project_installations');
    expect(content).toContain('CREATE TABLE public.installer_availability');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test tests/supabase_core_tables.test.js`

- [ ] **Step 3: Write minimal implementation**
Crie o arquivo `supabase/migrations/*_create_core_tables.sql` com:
```sql
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id),
    integrator_company_id UUID,
    assigned_installer_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'lead',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.project_proposals (
    project_id UUID REFERENCES public.projects(id) PRIMARY KEY,
    total_value DECIMAL(12, 2),
    financing_approved BOOLEAN DEFAULT false
);

CREATE TABLE public.project_installations (
    project_id UUID REFERENCES public.projects(id) PRIMARY KEY,
    scheduled_date DATE,
    checklist JSONB DEFAULT '{}'::jsonb,
    installer_accepted BOOLEAN DEFAULT false
);

CREATE TABLE public.installer_availability (
    installer_id UUID REFERENCES public.profiles(id),
    blocked_date DATE NOT NULL,
    PRIMARY KEY (installer_id, blocked_date)
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installer_availability ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test tests/supabase_core_tables.test.js`

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: add relational core tables for CRM and marketplace"
```

---

### Task 3: RLS (Row Level Security) Policies

**Files:**
- Create: `supabase/migrations/20260830000002_rls_policies.sql`
- Create: `tests/supabase_rls.test.js`

**Interfaces:**
- Produces: Regras de RLS barrando o acesso indevido às propostas (project_proposals) por instaladores e liberando a edição apenas aos responsáveis.

- [ ] **Step 1: Write the failing test**
Create `tests/supabase_rls.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('RLS Policies Migration', () => {
  it('should contain RLS policies protecting project_installations by assigned_installer_id', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('rls_policies.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('CREATE POLICY "Installer can edit assigned installation"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test tests/supabase_rls.test.js`

- [ ] **Step 3: Write minimal implementation**
Crie o arquivo `supabase/migrations/*_rls_policies.sql`:
```sql
-- Instaladores podem ler os projetos onde estão designados
CREATE POLICY "Installer can read assigned project"
  ON public.projects FOR SELECT
  USING (auth.uid() = assigned_installer_id);

-- Instaladores podem editar a aba de instalação de seus projetos
CREATE POLICY "Installer can edit assigned installation"
  ON public.project_installations FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE assigned_installer_id = auth.uid()
    )
  );

-- Gestores/Integradores podem ver todos os prestadores do marketplace
CREATE POLICY "Everyone can see installers in marketplace"
  ON public.profiles FOR SELECT
  USING (role = 'Instalador');
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test tests/supabase_rls.test.js`

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: add RLS policies for strict marketplace isolation"
```

---

### Task 4: Setup Database Webhooks (Edge Functions)

**Files:**
- Create: `supabase/migrations/20260830000003_marketplace_triggers.sql`
- Create: `tests/supabase_edge_triggers.test.js`

**Interfaces:**
- Produces: Triggers no Postgres que disparam webhooks para a Evolution API quando um instalador é atribuído.

- [ ] **Step 1: Write the failing test**
Create `tests/supabase_edge_triggers.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Marketplace Webhook Triggers', () => {
  it('should create a trigger for notify_installer_on_assignment', () => {
    const dir = path.resolve('./supabase/migrations');
    const files = fs.readdirSync(dir);
    const migrationFile = files.find(f => f.includes('marketplace_triggers.sql'));
    expect(migrationFile).toBeDefined();

    const content = fs.readFileSync(path.join(dir, migrationFile), 'utf-8');
    expect(content).toContain('CREATE TRIGGER notify_installer_on_assignment');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test tests/supabase_edge_triggers.test.js`

- [ ] **Step 3: Write minimal implementation**
Crie o arquivo `supabase/migrations/*_marketplace_triggers.sql`:
```sql
-- Cria a função de chamada para a Edge Function via pg_net (assumindo que a extensão net já existe)
CREATE OR REPLACE FUNCTION public.trigger_installer_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_installer_id IS NOT NULL AND (OLD.assigned_installer_id IS NULL OR OLD.assigned_installer_id != NEW.assigned_installer_id) THEN
    PERFORM net.http_post(
      url:='https://[PROJECT_REF].supabase.co/functions/v1/notify-installer',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
      body:=json_build_object('project_id', NEW.id, 'installer_id', NEW.assigned_installer_id)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_installer_on_assignment
  AFTER UPDATE OF assigned_installer_id ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_installer_notification();
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test tests/supabase_edge_triggers.test.js`

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: add webhook trigger for evolution API notifications"
```
