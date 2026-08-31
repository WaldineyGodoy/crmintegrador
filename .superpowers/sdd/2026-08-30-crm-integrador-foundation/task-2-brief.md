### Task 2: Supabase Client & Contexto de Autenticação

**Files:**
- Create: `src/lib/supabase.js`, `src/store/useAuthStore.js`, `src/store/useAuthStore.test.js`

**Interfaces:**
- Produces: `supabase` instance client, `useAuthStore` para acessar o usuário logado e hierarquia.

- [ ] **Step 1: Dependências**
```bash
npm install @supabase/supabase-js zustand
```

- [ ] **Step 2: Write the failing test**
Create `src/store/useAuthStore.test.js`:
```jsx
import { describe, it, expect } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
  it('initializes with null user and role', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npm test`

- [ ] **Step 4: Write minimal implementation**
Create `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

// Fallback values for test environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

Create `src/store/useAuthStore.js`:
```javascript
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  logout: () => set({ user: null, role: null })
}));
```

- [ ] **Step 5: Run test to verify it passes**
Run: `npm test`

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "feat: setup supabase client and zustand auth store"
```
