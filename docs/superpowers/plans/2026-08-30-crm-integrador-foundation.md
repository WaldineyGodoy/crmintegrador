# CRM Integrador Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurar a base do projeto Vite + React, Tailwind, estado com Zustand, roteamento dinâmico e integração com Supabase, estabelecendo um ambiente seguro testado via TDD.

**Architecture:** SPA (Single Page Application) com roteamento protegido baseado em permissões, integrado aos serviços nativos do Supabase (Auth, DB).

**Tech Stack:** React, Vite, Tailwind CSS, Zustand, React Router DOM, Supabase JS, Vitest, Testing Library.

**Spec:** docs/superpowers/specs/2026-08-30-crm-integrador-design.md

## Global Constraints
- Node v18+
- Utilizar gerenciador de pacotes `npm`.
- Estilização estrita usando utilitários do Tailwind CSS.

---

### Task 1: Scaffolding, Tailwind e Setup de Testes (Vitest)

**Files:**
- Modify: `package.json`
- Create: `vitest.setup.js`, `src/App.test.jsx`, `src/App.jsx`

**Interfaces:**
- Produces: O ambiente de desenvolvimento base rodando com Tailwind e testes.

- [ ] **Step 1: Setup do Projeto**
```bash
npm create vite@latest . -- --template react --yes
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Configure o `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 2: Write the failing test**
Create `src/App.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the application correctly', () => {
    render(<App />);
    expect(screen.getByText('CRM Integrador - Login')).toBeDefined();
  });
});
```

Modifique `package.json` adicionando `"test": "vitest run"` nos scripts.

- [ ] **Step 3: Run test to verify it fails**
Run: `npm test`
Expected: FAIL (texto não encontrado).

- [ ] **Step 4: Write minimal implementation**
Modifique `src/App.jsx`:
```jsx
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800">CRM Integrador - Login</h1>
    </div>
  );
}

export default App;
```

Modifique `src/index.css` (adicionando as diretivas do tailwind):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "chore: setup vite, tailwind and vitest foundation"
```

---

### Task 2: Supabase Client & Contexto de Autenticação

**Files:**
- Create: `src/lib/supabase.js`, `src/store/useAuthStore.js`, `src/lib/supabase.test.js`

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
Expected: FAIL (useAuthStore not found).

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
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "feat: setup supabase client and zustand auth store"
```

---

### Task 3: Setup do Roteamento e Proteção (React Router)

**Files:**
- Modify: `src/App.jsx`
- Create: `src/pages/Login.jsx`, `src/pages/Dashboard.jsx`, `src/components/ProtectedRoute.jsx`

**Interfaces:**
- Consumes: `useAuthStore`
- Produces: Estrutura de rotas `/` (Dashboard - protegida) e `/login` (Pública).

- [ ] **Step 1: Instalação**
```bash
npm install react-router-dom
```

- [ ] **Step 2: Write the failing test**
Create `src/App.test.jsx` (substitua o anterior):
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Routing', () => {
  it('redirects to login when unauthenticated', () => {
    render(<App />);
    expect(screen.getByText('Login Page')).toBeDefined();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npm test`
Expected: FAIL

- [ ] **Step 4: Write minimal implementation**
Create `src/pages/Login.jsx`:
```jsx
import React from 'react';
export function Login() {
  return <div>Login Page</div>;
}
```

Create `src/pages/Dashboard.jsx`:
```jsx
import React from 'react';
export function Dashboard() {
  return <div>Dashboard Protegido</div>;
}
```

Create `src/components/ProtectedRoute.jsx`:
```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
```

Update `src/App.jsx`:
```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 5: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "feat: add react-router and protected route guard"
```
