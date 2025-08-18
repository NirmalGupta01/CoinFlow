// JWT Authentication utilities for client-side token management
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

export class AuthManager {
  private static instance: AuthManager;
  private state: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
  };
  private listeners: Set<(state: AuthState) => void> = new Set();

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const tokens = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      
      if (tokens && user) {
        this.state.tokens = JSON.parse(tokens);
        this.state.user = JSON.parse(user);
        this.state.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Failed to load auth state from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage() {
    try {
      if (this.state.tokens && this.state.user) {
        localStorage.setItem(TOKEN_KEY, JSON.stringify(this.state.tokens));
        localStorage.setItem(USER_KEY, JSON.stringify(this.state.user));
      }
    } catch (error) {
      console.error('Failed to save auth state to storage:', error);
    }
  }

  private clearStorage() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): AuthState {
    return { ...this.state };
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      this.state.user = data.user;
      this.state.tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      this.state.isAuthenticated = true;

      if (rememberMe) {
        this.saveToStorage();
      }

      this.notifyListeners();
    } catch (error) {
      throw error;
    }
  }

  async signup(name: string, email: string, password: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();
      
      this.state.user = data.user;
      this.state.tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      this.state.isAuthenticated = true;

      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.state.tokens?.refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.state.tokens.accessToken}`,
          },
          body: JSON.stringify({ refreshToken: this.state.tokens.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.state.user = null;
      this.state.tokens = null;
      this.state.isAuthenticated = false;
      this.clearStorage();
      this.notifyListeners();
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      if (!this.state.tokens?.refreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.state.tokens.refreshToken }),
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const data = await response.json();
      
      this.state.tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };

      this.saveToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  getAccessToken(): string | null {
    return this.state.tokens?.accessToken || null;
  }

  async googleLogin(): Promise<void> {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/auth/google';
  }
}

export const authManager = AuthManager.getInstance();

// JWT Token utilities
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}

export function getTokenPayload(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
}

// React hook for auth state
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: authManager.login.bind(authManager),
    signup: authManager.signup.bind(authManager),
    logout: authManager.logout.bind(authManager),
    googleLogin: authManager.googleLogin.bind(authManager),
  };
}

// HTTP interceptor to add auth headers
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authState = authManager.getState();
  
  if (authState.isAuthenticated && authState.tokens?.accessToken) {
    // Check if token is expired
    if (isTokenExpired(authState.tokens.accessToken)) {
      const refreshed = await authManager.refreshToken();
      if (!refreshed) {
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${authManager.getAccessToken()}`);
    
    options.headers = headers;
  }

  return fetch(url, options);
}