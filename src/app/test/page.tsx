export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600 mb-8">If you can see this, the Next.js app is working correctly.</p>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">API Test</h2>
            <p className="text-sm text-gray-600">Check the browser console for API responses.</p>
          </div>
        </div>
      </div>
    </div>
  );
}