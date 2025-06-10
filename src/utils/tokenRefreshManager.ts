/**
 * Token Refresh Manager
 * 
 * Provides enhanced token refresh logic with circuit breaker pattern,
 * retry limits, and exponential backoff to prevent infinite re-rendering
 * when refresh tokens fail.
 */

interface RefreshAttempt {
  timestamp: number;
  success: boolean;
  error?: string;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private refreshAttempts: RefreshAttempt[] = [];
  private circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    nextAttemptTime: 0
  };

  // Configuration
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly BASE_RETRY_DELAY = 1000; // 1 second
  private readonly MAX_RETRY_DELAY = 30 * 1000; // 30 seconds
  private readonly ATTEMPT_WINDOW = 10 * 60 * 1000; // 10 minutes

  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  /**
   * Check if we should attempt a token refresh based on recent failure history
   */
  canAttemptRefresh(): boolean {
    const now = Date.now();

    // Check circuit breaker
    if (this.circuitBreaker.isOpen) {
      if (now < this.circuitBreaker.nextAttemptTime) {
        console.log('🚫 Circuit breaker is open, blocking refresh attempt');
        return false;
      } else {
        // Reset circuit breaker after timeout
        console.log('🔄 Circuit breaker timeout elapsed, allowing refresh attempt');
        this.resetCircuitBreaker();
      }
    }

    // Clean old attempts outside the window
    this.cleanOldAttempts();

    // Check if we've exceeded retry attempts in the current window
    const recentFailures = this.refreshAttempts.filter(
      attempt => !attempt.success && (now - attempt.timestamp) < this.ATTEMPT_WINDOW
    );

    if (recentFailures.length >= this.MAX_RETRY_ATTEMPTS) {
      console.log(`🚫 Maximum refresh attempts (${this.MAX_RETRY_ATTEMPTS}) exceeded in the last ${this.ATTEMPT_WINDOW / 60000} minutes`);
      this.openCircuitBreaker();
      return false;
    }

    return true;
  }

  /**
   * Record a refresh attempt result
   */
  recordRefreshAttempt(success: boolean, error?: string): void {
    const now = Date.now();
    
    this.refreshAttempts.push({
      timestamp: now,
      success,
      error
    });

    if (success) {
      console.log('✅ Token refresh successful, resetting failure counters');
      this.resetCircuitBreaker();
    } else {
      this.circuitBreaker.failureCount++;
      this.circuitBreaker.lastFailureTime = now;
      
      console.log(`❌ Token refresh failed (${this.circuitBreaker.failureCount}/${this.CIRCUIT_BREAKER_THRESHOLD})`);
      
      if (this.circuitBreaker.failureCount >= this.CIRCUIT_BREAKER_THRESHOLD) {
        this.openCircuitBreaker();
      }
    }

    // Keep only recent attempts to prevent memory leaks
    this.cleanOldAttempts();
  }

  /**
   * Get the next retry delay using exponential backoff
   */
  getRetryDelay(): number {
    const recentFailures = this.refreshAttempts.filter(
      attempt => !attempt.success && (Date.now() - attempt.timestamp) < this.ATTEMPT_WINDOW
    );

    const delay = Math.min(
      this.BASE_RETRY_DELAY * Math.pow(2, recentFailures.length),
      this.MAX_RETRY_DELAY
    );

    console.log(`⏱️ Next retry delay: ${delay}ms (after ${recentFailures.length} failures)`);
    return delay;
  }

  /**
   * Check if the user should be signed out due to persistent failures
   */
  shouldSignOut(): boolean {
    const now = Date.now();
    const recentFailures = this.refreshAttempts.filter(
      attempt => !attempt.success && (now - attempt.timestamp) < this.ATTEMPT_WINDOW
    );

    // Sign out if circuit breaker is open and we've had multiple failures
    return this.circuitBreaker.isOpen && recentFailures.length >= this.MAX_RETRY_ATTEMPTS;
  }

  /**
   * Get current state for debugging
   */
  getState() {
    return {
      circuitBreaker: this.circuitBreaker,
      recentAttempts: this.refreshAttempts.slice(-10), // Last 10 attempts
      canRefresh: this.canAttemptRefresh(),
      shouldSignOut: this.shouldSignOut(),
      nextRetryDelay: this.getRetryDelay()
    };
  }

  /**
   * Reset all state (useful for testing or manual recovery)
   */
  reset(): void {
    this.refreshAttempts = [];
    this.resetCircuitBreaker();
    console.log('🔄 Token refresh manager state reset');
  }

  private openCircuitBreaker(): void {
    this.circuitBreaker.isOpen = true;
    this.circuitBreaker.nextAttemptTime = Date.now() + this.CIRCUIT_BREAKER_TIMEOUT;
    
    console.log(`🚫 Circuit breaker opened due to ${this.circuitBreaker.failureCount} failures. Next attempt allowed at:`, 
      new Date(this.circuitBreaker.nextAttemptTime).toISOString());
  }

  private resetCircuitBreaker(): void {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.lastFailureTime = 0;
    this.circuitBreaker.nextAttemptTime = 0;
  }

  private cleanOldAttempts(): void {
    const cutoff = Date.now() - this.ATTEMPT_WINDOW;
    this.refreshAttempts = this.refreshAttempts.filter(
      attempt => attempt.timestamp > cutoff
    );
  }
}

export default TokenRefreshManager;
