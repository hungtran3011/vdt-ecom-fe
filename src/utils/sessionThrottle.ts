/**
 * Session Throttling Utility
 * 
 * Prevents excessive session checks and updates that can cause infinite loops
 */

class SessionThrottle {
  private static instance: SessionThrottle;
  private lastSessionCheck: number = 0;
  private lastSessionUpdate: number = 0;
  private readonly SESSION_CHECK_INTERVAL = 5000; // 5 seconds
  private readonly SESSION_UPDATE_INTERVAL = 10000; // 10 seconds

  static getInstance(): SessionThrottle {
    if (!SessionThrottle.instance) {
      SessionThrottle.instance = new SessionThrottle();
    }
    return SessionThrottle.instance;
  }

  canCheckSession(): boolean {
    const now = Date.now();
    const canCheck = now - this.lastSessionCheck >= this.SESSION_CHECK_INTERVAL;
    
    if (canCheck) {
      this.lastSessionCheck = now;
    }
    
    return canCheck;
  }

  canUpdateSession(): boolean {
    const now = Date.now();
    const canUpdate = now - this.lastSessionUpdate >= this.SESSION_UPDATE_INTERVAL;
    
    if (canUpdate) {
      this.lastSessionUpdate = now;
    }
    
    return canUpdate;
  }

  reset(): void {
    this.lastSessionCheck = 0;
    this.lastSessionUpdate = 0;
  }
}

export default SessionThrottle;
