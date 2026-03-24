"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type DashboardNotificationModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DashboardNotificationModalContext = createContext<DashboardNotificationModalContextValue | null>(
  null
);

export function DashboardNotificationModalProvider({
  children,
  initialOpen = false
}: {
  children: ReactNode;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    const handleOpenRequest = () => setOpen(true);
    window.addEventListener("dashboard:open-notifications", handleOpenRequest);
    return () => {
      window.removeEventListener("dashboard:open-notifications", handleOpenRequest);
    };
  }, []);

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
