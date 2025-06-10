'use client';

import { useSession as useSessionOriginal } from 'next-auth/react';
import { useEffect, useRef } from 'react';

let callCount = 0;
const callers = new Map<string, number>();

export function useSession(options?: Parameters<typeof useSessionOriginal>[0]) {
  const callerStack = new Error().stack;
  const caller = callerStack?.split('\n')[2]?.trim() || 'unknown';
  
  callCount++;
  const currentCalls = callers.get(caller) || 0;
  callers.set(caller, currentCalls + 1);
  
  // Log every 10th call to avoid spam
  if (callCount % 10 === 0) {
    console.log(`🐛 useSession called ${callCount} times`);
    console.log('🐛 Top callers:', Array.from(callers.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5));
  }
  
  return useSessionOriginal(options);
}
