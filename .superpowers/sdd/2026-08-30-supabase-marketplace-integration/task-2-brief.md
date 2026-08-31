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
Crie o arquivo `supabase/migrations/*_create_core_tables.sql` (use supabase CLI `migration new create_core_tables`) com:
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
