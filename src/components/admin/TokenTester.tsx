'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { Session } from 'next-auth';

interface TokenDebugInfo {
  tokenPresent: boolean;
  tokenLength: number;
  tokenStart: string;
  tokenEnd?: string;
  fullToken?: string;
  isValidJWT: boolean;
  payload?: {
    issuer: string;
    subject: string;
    email: string;
    clientId: string;
    expiry: string;
    isExpired: boolean;
    roles: string[];
  };
  sessionInfo: {
    hasIdToken: boolean;
    expiresAt: string | null;
  };
}

export default function TokenTester() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<TokenDebugInfo | null>(null);
  const [serverDebugInfo, setServerDebugInfo] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTokenFlow = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    setServerDebugInfo(null);

    try {
      // Get server-side debug info
      const serverResponse = await fetch('/api/debug-token');
      const serverData = await serverResponse.json();
      
      if (serverResponse.ok) {
        setServerDebugInfo(serverData);
      }

      // Analyze client-side token if available
      if (session?.accessToken) {
        const token = session.accessToken;
        const debugData: TokenDebugInfo = {
          tokenPresent: !!token,
          tokenLength: token.length,
          tokenStart: token.substring(0, 20),
          tokenEnd: token.substring(token.length - 20),
          fullToken: token,
          isValidJWT: token.startsWith('eyJ'),
          sessionInfo: {
            hasIdToken: !!session.idToken,
            expiresAt: session.expires || null,
          }
        };

        // Try to parse JWT payload if it's valid
        if (debugData.isValidJWT) {
          try {
            const payloadBase64 = token.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64));
            debugData.payload = {
              issuer: payload.iss || 'Not found',
              subject: payload.sub || 'Not found',
              email: payload.email || payload.preferred_username || 'Not found',
              clientId: payload.aud || 'Not found',
              expiry: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'Not found',
              isExpired: payload.exp ? Date.now() > payload.exp * 1000 : false,
              roles: payload.realm_access?.roles || payload.roles || []
            };
          } catch (error) {
            console.error('Failed to parse JWT payload:', error);
          }
        }

        setDebugInfo(debugData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Token test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  if (!session) {
    return <div>Please sign in to test tokens</div>;
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Token Flow Tester</h2>
          <Button onClick={testTokenFlow} disabled={loading}>
            {loading ? 'Testing...' : 'Test Token Flow'}
          </Button>
        </div>

        <div>
          <h3 className="font-medium mb-2">Client Session Summary:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify({
              hasAccessToken: !!session.accessToken,
              tokenLength: session.accessToken?.length,
              userEmail: session.user?.email,
              userRoles: session.user?.roles,
              hasIdToken: !!session.idToken
            }, null, 2)}
          </pre>
          
          {session.accessToken && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-blue-600">Full Access Token (Client):</h4>
              <div className="bg-blue-50 p-2 rounded text-xs break-all font-mono">
                {session.accessToken}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Starts with: {session.accessToken.substring(0, 20)}...
                {session.accessToken.startsWith('eyJ') ? ' ✅ Valid JWT format' : ' ❌ Not JWT format'}
              </div>
            </div>
          )}
          
          {session.idToken && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-purple-600">Full ID Token (Client):</h4>
              <div className="bg-purple-50 p-2 rounded text-xs break-all font-mono">
                {session.idToken}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Starts with: {session.idToken.substring(0, 20)}...
                {session.idToken.startsWith('eyJ') ? ' ✅ Valid JWT format' : ' ❌ Not JWT format'}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 rounded p-3">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {debugInfo && (
          <div>
            <h3 className="font-medium mb-2">Client Token Analysis:</h3>
            <pre className="bg-green-50 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            
            {debugInfo.isValidJWT ? (
              <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                ✅ Token is valid JWT! Ready for backend API calls.
              </div>
            ) : (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                ❌ Token is NOT a valid JWT format. This will cause backend API failures.
              </div>
            )}
          </div>
        )}

        {serverDebugInfo && (
          <div>
            <h3 className="font-medium mb-2">Server Token Analysis:</h3>
            <pre className="bg-blue-50 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(serverDebugInfo, null, 2)}
            </pre>
            
            {serverDebugInfo.accessToken && (
              <div className="mt-4">
                <h4 className="font-medium mb-2 text-green-600">Full Access Token (Server):</h4>
                <div className="bg-green-50 p-2 rounded text-xs break-all font-mono">
                  {serverDebugInfo.accessToken}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Starts with: {serverDebugInfo.accessToken.substring(0, 20)}...
                  {serverDebugInfo.accessToken.startsWith('eyJ') ? ' ✅ Valid JWT format' : ' ❌ Not JWT format'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-medium text-yellow-800 mb-2">What to Check:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Access tokens should start with &quot;eyJ&quot; (JWT format)</li>
            <li>• Client and server tokens should match</li>
            <li>• Tokens should contain valid Keycloak issuer claims</li>
            <li>• Axios interceptor uses the access token shown above</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
