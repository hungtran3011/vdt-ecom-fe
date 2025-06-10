/**
 * Authentication Error Boundary
 * 
 * Provides graceful error handling for authentication failures,
 * token refresh issues, and session errors with user-friendly feedback.
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import TokenRefreshManager from '@/utils/tokenRefreshManager';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
  isAuthError: boolean;
}

class AuthErrorBoundary extends Component<Props, State> {
  private refreshManager: TokenRefreshManager;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false
    };
    this.refreshManager = TokenRefreshManager.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is an authentication-related error
    const isAuthError = error.message.includes('token') || 
                       error.message.includes('auth') ||
                       error.message.includes('session') ||
                       error.message.includes('401') ||
                       error.message.includes('403');

    return {
      hasError: true,
      error,
      isAuthError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo: errorInfo.componentStack
    });

    // If it's an auth error, record it in the refresh manager
    if (this.state.isAuthError) {
      this.refreshManager.recordRefreshAttempt(false, error.message);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false
    });
  };

  handleSignOut = async () => {
    try {
      // Reset the refresh manager state
      this.refreshManager.reset();
      
      // Sign out the user
      await signOut({
        callbackUrl: '/login',
        redirect: true
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force redirect to login if sign out fails
      window.location.href = '/login';
    }
  };

  handleResetRefreshState = () => {
    this.refreshManager.reset();
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Get refresh manager state for debugging
      const refreshState = this.refreshManager.getState();

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md w-full space-y-6 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <span className="mdi mdi-alert-circle text-2xl text-red-600"></span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {this.state.isAuthError ? 'Authentication Error' : 'Something went wrong'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {this.state.isAuthError 
                  ? 'There was a problem with your authentication session.'
                  : 'An unexpected error occurred while loading the page.'
                }
              </p>
            </div>

            {this.state.isAuthError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="mdi mdi-information text-yellow-400"></span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Authentication Issue Detected
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        {refreshState.circuitBreaker.isOpen 
                          ? 'Multiple authentication failures detected. The system is temporarily blocking refresh attempts to prevent further issues.'
                          : 'Your session may have expired or encountered an error.'
                        }
                      </p>
                      {refreshState.circuitBreaker.isOpen && refreshState.circuitBreaker.nextAttemptTime > 0 && (
                        <p className="mt-1">
                          Next retry available at: {new Date(refreshState.circuitBreaker.nextAttemptTime).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {!this.state.isAuthError && (
                <Button
                  label="Try Again"
                  variant="filled"
                  onClick={this.handleRetry}
                  className="w-full"
                  hasIcon
                  icon="refresh"
                />
              )}

              {this.state.isAuthError && !refreshState.circuitBreaker.isOpen && (
                <Button
                  label="Retry Authentication"
                  variant="filled"
                  onClick={this.handleRetry}
                  className="w-full"
                  hasIcon
                  icon="refresh"
                />
              )}

              {this.state.isAuthError && refreshState.circuitBreaker.isOpen && (
                <Button
                  label="Reset Authentication State"
                  variant="outlined"
                  onClick={this.handleResetRefreshState}
                  className="w-full"
                  hasIcon
                  icon="restore"
                />
              )}

              {this.state.isAuthError && (
                <Button
                  label="Sign Out and Start Fresh"
                  variant="outlined"
                  onClick={this.handleSignOut}
                  className="w-full"
                  hasIcon
                  icon="logout"
                />
              )}
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Debug Information (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs">
                  <p><strong>Error:</strong> {this.state.error?.message}</p>
                  {this.state.isAuthError && (
                    <div className="mt-2">
                      <p><strong>Refresh Manager State:</strong></p>
                      <pre className="mt-1 overflow-x-auto">
                        {JSON.stringify(refreshState, null, 2)}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      <p><strong>Component Stack:</strong></p>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {this.state.errorInfo}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
