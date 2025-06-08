'use client';

import { useState, useCallback } from 'react';

export interface SnackbarState {
  message: string;
  isOpen: boolean;
  severity: 'info' | 'success' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UseSnackbarReturn {
  snackbar: SnackbarState;
  showSnackbar: (
    message: string,
    severity?: 'info' | 'success' | 'warning' | 'error',
    action?: { label: string; onClick: () => void }
  ) => void;
  hideSnackbar: () => void;
}

export const useSnackbar = (): UseSnackbarReturn => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    message: '',
    isOpen: false,
    severity: 'info'
  });

  const showSnackbar = useCallback((
    message: string,
    severity: 'info' | 'success' | 'warning' | 'error' = 'info',
    action?: { label: string; onClick: () => void }
  ) => {
    setSnackbar({
      message,
      severity,
      isOpen: true,
      action
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    snackbar,
    showSnackbar,
    hideSnackbar
  };
};
