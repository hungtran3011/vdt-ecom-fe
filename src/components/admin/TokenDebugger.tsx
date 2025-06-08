'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface DebugInfo {
  environment: Record<string, string>;
  tokenInfo: Record<string, string | string[]>;
  validation: Record<string, string | boolean>;
  recommendations: string[];
}

export default function TokenDebugger() {
  const { data: session } = useSession();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug-issuer');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch debug info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDebugInfo();
    }
  }, [session]);

  if (!session) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface) mb-4">
          Token Debugger
        </h3>
        <p className="text-(--md-sys-color-on-surface-variant)">
          Please sign in to debug token information.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-(--md-sys-color-on-surface)">
          Token Debugger
        </h3>
        <Button
          variant="outlined"
          label="Refresh"
          hasIcon
          icon="refresh"
          onClick={fetchDebugInfo}
          disabled={loading}
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-(--md-sys-color-on-surface-variant)">
          <span className="mdi animate-spin">refresh</span>
          <span>Loading debug information...</span>
        </div>
      )}

      {error && (
        <div className="bg-(--md-sys-color-error-container) text-(--md-sys-color-on-error-container) p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Error fetching debug info:</h4>
          <p>{error}</p>
        </div>
      )}

      {debugInfo && (
        <div className="space-y-6">
          {/* Environment Info */}
          <div>
            <h4 className="font-semibold text-(--md-sys-color-on-surface) mb-2">
              Environment Configuration
            </h4>
            <div className="bg-(--md-sys-color-surface-variant) p-4 rounded-lg">
              <pre className="text-sm text-(--md-sys-color-on-surface-variant) overflow-x-auto">
                {JSON.stringify(debugInfo.environment, null, 2)}
              </pre>
            </div>
          </div>

          {/* Token Info */}
          <div>
            <h4 className="font-semibold text-(--md-sys-color-on-surface) mb-2">
              Token Information
            </h4>
            <div className="bg-(--md-sys-color-surface-variant) p-4 rounded-lg">
              <pre className="text-sm text-(--md-sys-color-on-surface-variant) overflow-x-auto">
                {JSON.stringify(debugInfo.tokenInfo, null, 2)}
              </pre>
            </div>
          </div>

          {/* Validation Results */}
          <div>
            <h4 className="font-semibold text-(--md-sys-color-on-surface) mb-2">
              Validation Results
            </h4>
            <div className="space-y-2">
              {Object.entries(debugInfo.validation).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`mdi ${
                    typeof value === 'boolean' 
                      ? value 
                        ? 'text-(--md-sys-color-primary)' 
                        : 'text-(--md-sys-color-error)'
                      : 'text-(--md-sys-color-on-surface-variant)'
                  }`}>
                    {typeof value === 'boolean' 
                      ? value ? 'check_circle' : 'error' 
                      : 'info'}
                  </span>
                  <span className="font-medium text-(--md-sys-color-on-surface)">
                    {key}:
                  </span>
                  <span className="text-(--md-sys-color-on-surface-variant)">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {debugInfo.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-(--md-sys-color-on-surface) mb-2">
                Recommendations
              </h4>
              <div className="space-y-2">
                {debugInfo.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-(--md-sys-color-secondary-container) text-(--md-sys-color-on-secondary-container) p-3 rounded-lg">
                    <div className="flex gap-2">
                      <span className="mdi text-(--md-sys-color-secondary) mt-0.5">
                        lightbulb
                      </span>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
