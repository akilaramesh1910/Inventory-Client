"use client";

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import Snackbar from '../components/ui/snackbar';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: Severity) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as Severity,
  });

  const showSnackbar = useCallback((message: string, severity: Severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={closeSnackbar} />
    </SnackbarContext.Provider>
  );
};