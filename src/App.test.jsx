import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { useAuthStore } from './store/useAuthStore';

describe('Routing', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    window.history.pushState({}, '', '/');
  });

  it('redirects to login when unauthenticated', () => {
    render(<App />);
    expect(screen.getByText('Login Page')).toBeDefined();
  });

  it('renders dashboard when authenticated', () => {
    useAuthStore.getState().setUser({ id: '123', email: 'test@example.com' });
    render(<App />);
    expect(screen.getByText('Dashboard Protegido')).toBeDefined();
  });
});
