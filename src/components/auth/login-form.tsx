'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginCredentials } from '@/types/auth';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(credentials);
  };

  const handleDemoLogin = async () => {
    await onLogin({
      email: 'demo@company.com',
      password: 'demo123',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Ramp Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your expense dashboard
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
                placeholder="you@company.com"
              />
              <Input
                label="Password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                placeholder="Enter your password"
              />
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                >
                  Sign In
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                  loading={loading}
                >
                  Try Demo Account
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                This is a demo application. In production, this would integrate with your SSO provider.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}