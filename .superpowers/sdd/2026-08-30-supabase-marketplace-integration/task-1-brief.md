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
