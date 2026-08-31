### Task 3: Setup do Roteamento e Proteção (React Router)

**Files:**
- Modify: `src/App.jsx`, `src/App.test.jsx`
- Create: `src/pages/Login.jsx`, `src/pages/Dashboard.jsx`, `src/components/ProtectedRoute.jsx`

**Interfaces:**
- Consumes: `useAuthStore` from `src/store/useAuthStore.js`
- Produces: Estrutura de rotas `/` (Dashboard - protegida) e `/login` (Pública).

- [ ] **Step 1: Instalação**
```bash
npm install react-router-dom
```

- [ ] **Step 2: Write the failing test**
Update `src/App.test.jsx` to test routing (substitua o conteúdo anterior):
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

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "feat: add react-router and protected route guard"
```
