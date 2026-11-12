"use client";

import { createContext, useContext, type ReactNode } from "react";

const PrintScope = createContext("");

export function PrintScopeProvider({ companyId, children }: { companyId: string; children: ReactNode }) {
  return <PrintScope.Provider value={companyId}>{children}</PrintScope.Provider>;
}

export function usePrintScope() {
  return useContext(PrintScope);
}
