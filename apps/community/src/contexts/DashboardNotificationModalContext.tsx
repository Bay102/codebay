"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type DashboardNotificationModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DashboardNotificationModalContext = createContext<DashboardNotificationModalContextValue | null>(
  null
);

export function DashboardNotificationModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value: DashboardNotificationModalContextValue = {
    open,
    setOpen: useCallback((next: boolean) => setOpen(next), [])
  };
  return (
    <DashboardNotificationModalContext.Provider value={value}>
      {children}
    </DashboardNotificationModalContext.Provider>
  );
}

export function useDashboardNotificationModal(): DashboardNotificationModalContextValue | null {
  return useContext(DashboardNotificationModalContext);
}
