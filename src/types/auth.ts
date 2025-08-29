export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  department?: string;
  avatar?: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SSOConfig {
  provider: 'okta' | 'azure' | 'google' | 'saml';
  clientId: string;
  domain?: string;
  redirectUri: string;
}