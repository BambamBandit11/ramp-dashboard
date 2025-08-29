'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ramp/transactions');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setTestData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ramp Dashboard</h1>
              <p className="text-gray-600 mt-1">Simplified version for testing</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Status: {error ? 'Error' : testData ? 'Connected' : 'Ready'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Test Card */}
          <Card>
            <CardHeader>
              <CardTitle>API Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testAPI} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test API Connection'}
              </Button>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}
              
              {testData && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-green-800 font-medium">Success</h3>
                  <p className="text-green-600 text-sm mt-1">
                    API returned {(testData as any).data?.length || 0} transactions
                  </p>
                  <details className="mt-2">
                    <summary className="text-green-700 cursor-pointer text-sm">View Response</summary>
                    <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto max-h-40">
                      {JSON.stringify(testData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Frontend</h3>
                  <p className="text-blue-600 text-sm">✅ Working</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900">API Routes</h3>
                  <p className="text-green-600 text-sm">{testData ? '✅ Connected' : '⏳ Not tested'}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900">Mock Data</h3>
                  <p className="text-purple-600 text-sm">✅ Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}