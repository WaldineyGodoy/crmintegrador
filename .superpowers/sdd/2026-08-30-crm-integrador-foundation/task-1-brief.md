### Task 1: Scaffolding, Tailwind e Setup de Testes (Vitest)

**Files:**
- Modify: package.json
- Create: itest.setup.js, src/App.test.jsx, src/App.jsx

**Interfaces:**
- Produces: O ambiente de desenvolvimento base rodando com Tailwind e testes.

- [ ] **Step 1: Setup do Projeto**
npm create vite@latest . -- --template react --yes
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom

Configure o 	ailwind.config.js:
``javascript
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
``

- [ ] **Step 2: Write the failing test**
Create src/App.test.jsx:
``jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the application correctly', () => {
    render(<App />);
    expect(screen.getByText('CRM Integrador - Login')).toBeDefined();
  });
});
``

Modifique package.json adicionando "test": "vitest run" nos scripts.

- [ ] **Step 3: Run test to verify it fails**
Run: 
pm test

- [ ] **Step 4: Write minimal implementation**
Modifique src/App.jsx:
``jsx
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800">CRM Integrador - Login</h1>
    </div>
  );
}

export default App;
``

Modifique src/index.css (adicionando as diretivas do tailwind):
``css
@tailwind base;
@tailwind components;
@tailwind utilities;
``

- [ ] **Step 5: Run test to verify it passes**
Run: 
pm test

- [ ] **Step 6: Commit**
git add .
git commit -m "chore: setup vite, tailwind and vitest foundation"
