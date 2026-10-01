// Accessibility & Senior Mode context (accessibility-senior-mode spec).
// Presentation-only: it changes how content is shown, never the facts.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./types";

const SENIOR_KEY = "nsa.seniorMode";

interface AccessibilityState {
  seniorMode: boolean;
  setSeniorMode: (on: boolean) => void;
  toggleSeniorMode: () => void;
  /** Language the UI should default to given the current mode. Senior mode is
   *  Tamil-first (Req 1.2); callers may still override explicitly. */
  defaultLang: Lang;
}

const AccessibilityContext = createContext<AccessibilityState | null>(null);

function loadSenior(): boolean {
  try {
    return sessionStorage.getItem(SENIOR_KEY) === "1";
  } catch {
    return false; // default: normal UI (Req: default preserves current UI)
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [seniorMode, setSeniorModeState] = useState<boolean>(loadSenior);

  function setSeniorMode(on: boolean) {
    setSeniorModeState(on);
    try {
      sessionStorage.setItem(SENIOR_KEY, on ? "1" : "0");
    } catch {
      // Persistence is best-effort; non-fatal.
    }
  }

  // Reflect mode on <body> so global CSS can scale type/controls/density.
  useEffect(() => {
    const cls = "senior-mode";
    if (seniorMode) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
  }, [seniorMode]);

  const value: AccessibilityState = {
    seniorMode,
    setSeniorMode,
    toggleSeniorMode: () => setSeniorMode(!seniorMode),
    defaultLang: seniorMode ? "ta" : "en",
  };

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityState {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
