'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import api from '@/lib/axios';
import { AxiosTestResponse } from '@/types/AxiosTest';

interface TokenDebugInfo {
  tokenPresent: boolean;
  tokenLength: number;
  tokenStart: string;
  tokenEnd?: string;
  fullToken?: string;
  isValidJWT: boolean;
  source: string;
  timestamp: string;
}

// Add a global token tracker for axios calls
declare global {
  interface Window {
    __axiosTokenTracker?: {
      lastUsedToken?: string;
      lastUsedTimestamp?: string;
      source?: string;
    };
  }
}

// Helper function to capture token used by axios
const captureAxiosToken = () => {
  if (typeof window !== 'undefined' && window.__axiosTokenTracker) {
    const tracker = window.__axiosTokenTracker;
    if (tracker.lastUsedToken) {
      return {
        tokenPresent: true,
        tokenLength: tracker.lastUsedToken.length,
        tokenStart: tracker.lastUsedToken.substring(0, 20),
        tokenEnd: tracker.lastUsedToken.substring(tracker.lastUsedToken.length - 20),
        fullToken: tracker.lastUsedToken,
        isValidJWT: tracker.lastUsedToken.startsWith('eyJ'),
        source: `Axios Interceptor (${tracker.source || 'Unknown method'})`,
        timestamp: tracker.lastUsedTimestamp || new Date().toISOString()
      };
    }
  }
  return null;
};

export default function AxiosTokenTester() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AxiosTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testType, setTestType] = useState<'internal' | 'external'>('internal');
  const [tokenDebugInfo, setTokenDebugInfo] = useState<TokenDebugInfo[]>([]);

  const testAxiosCall = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setTokenDebugInfo([]);

    try {
      console.log(`🚀 Making ${testType} API call with axios...`);
      
      // First, let's check what tokens are available in the session
      const sessionTokens: TokenDebugInfo[] = [];
      
      if (session?.accessToken) {
        sessionTokens.push({
          tokenPresent: true,
          tokenLength: session.accessToken.length,
          tokenStart: session.accessToken.substring(0, 20),
          tokenEnd: session.accessToken.substring(session.accessToken.length - 20),
          fullToken: session.accessToken,
          isValidJWT: session.accessToken.startsWith('eyJ'),
          source: 'Client Session (useSession)',
          timestamp: new Date().toISOString()
        });
      }

      if (session?.idToken) {
        sessionTokens.push({
          tokenPresent: true,
          tokenLength: session.idToken.length,
          tokenStart: session.idToken.substring(0, 20),
          tokenEnd: session.idToken.substring(session.idToken.length - 20),
          fullToken: session.idToken,
          isValidJWT: session.idToken.startsWith('eyJ'),
          source: 'Client ID Token (useSession)',
          timestamp: new Date().toISOString()
        });
      }

      // For external calls, we'll need to check what token axios interceptor retrieves
      if (testType === 'external') {
        // Get the token that axios interceptor would use
        try {
          const sessionResponse = await fetch('/api/auth/session');
          const sessionData = await sessionResponse.json();
          
          if (sessionData?.accessToken) {
            sessionTokens.push({
              tokenPresent: true,
              tokenLength: sessionData.accessToken.length,
              tokenStart: sessionData.accessToken.substring(0, 20),
              tokenEnd: sessionData.accessToken.substring(sessionData.accessToken.length - 20),
              fullToken: sessionData.accessToken,
              isValidJWT: sessionData.accessToken.startsWith('eyJ'),
              source: 'API Session Endpoint (/api/auth/session)',
              timestamp: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Failed to fetch session from API endpoint:', err);
        }
      }

      setTokenDebugInfo(sessionTokens);
      
      let result;
      if (testType === 'internal') {
        // Test internal Next.js API route (should work without backend)
        result = await fetch('/api/debug-issuer');
        const data = await result.json();
        setResponse(data);
      } else {
        // Test external backend API via axios (this should trigger the interceptor)
        result = await api.get<AxiosTestResponse>('/v1/products', {
          params: { page: 0, size: 1 } // Just get 1 product for testing
        });
        setResponse({
          success: true,
          message: 'Successfully connected to backend API',
          data: result.data,
          timestamp: new Date().toISOString()
        });
        
        // Capture the token that was actually used by axios after the call
        const axiosTokenInfo = captureAxiosToken();
        if (axiosTokenInfo && !sessionTokens.find(t => t.source.includes('Axios Interceptor'))) {
          sessionTokens.push(axiosTokenInfo);
          setTokenDebugInfo([...sessionTokens]);
        }
      }
      
      console.log('✅ API call successful:', result);
    } catch (err) {
      console.error('❌ Full error object:', err);
      
      let errorMessage = 'Unknown error';
      
      if (err && typeof err === 'object') {
        if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if ('code' in err && typeof err.code === 'string') {
          errorMessage = `Error code: ${err.code}`;
        } else if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as { status?: number; statusText?: string; data?: unknown };
          errorMessage = `HTTP ${response.status || 'Unknown'}: ${response.statusText || 'Unknown error'}`;
          
          if (response.data) {
            console.log('❌ Error response data:', response.data);
          }
        }
      }
      
      setError(errorMessage);
      console.error('❌ API call failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Axios Token Test</h2>
          <div className="flex gap-2">
            <select 
              value={testType} 
              onChange={(e) => setTestType(e.target.value as 'internal' | 'external')}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="internal">Internal API (/api/debug-issuer)</option>
              <option value="external">External API (/v1/products via axios)</option>
            </select>
            <Button onClick={testAxiosCall} disabled={loading}>
              {loading ? 'Testing...' : 'Test API Call'}
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <strong>Internal API:</strong> Tests Next.js API routes directly (no axios interceptor).<br/>
          <strong>External API:</strong> Tests real backend API (/v1/products) via axios interceptor.
        </div>

        {tokenDebugInfo.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Available Tokens for API Call:</h3>
            {tokenDebugInfo.map((tokenInfo, index) => (
              <div key={index} className="mb-4 border border-gray-200 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm text-gray-700">{tokenInfo.source}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${tokenInfo.isValidJWT ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {tokenInfo.isValidJWT ? '✅ Valid JWT' : '❌ Not JWT'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  Length: {tokenInfo.tokenLength} | 
                  Start: {tokenInfo.tokenStart}... | 
                  End: ...{tokenInfo.tokenEnd} | 
                  Time: {new Date(tokenInfo.timestamp).toLocaleTimeString()}
                </div>
                
                <div className="bg-gray-50 p-2 rounded">
                  <h5 className="text-xs font-medium mb-1">Full Token:</h5>
                  <div className="bg-white p-2 rounded text-xs break-all font-mono border max-h-32 overflow-y-auto">
                    {tokenInfo.fullToken}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 rounded p-3">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {response && (
          <div>
            <h3 className="font-medium mb-2">API Response:</h3>
            <pre className="bg-green-50 p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800 mb-2">What This Tests:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Internal:</strong> Tests Next.js API routes to verify session handling</li>
            <li>• <strong>External:</strong> Uses axios interceptor to call real backend API (/v1/products)</li>
            <li>• Shows full tokens available for the selected API call type</li>
            <li>• Compares tokens from useSession vs /api/auth/session endpoint</li>
            <li>• Logs detailed information in the browser console</li>
            <li>• Helps identify where token corruption occurs</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
