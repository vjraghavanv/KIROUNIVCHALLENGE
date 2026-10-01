import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { App } from "../App";
import { AccessibilityProvider } from "../accessibility";

function renderApp() {
  return render(
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  );
}

describe("App — senior mode + language", () => {
  beforeEach(() => {
    try {
      sessionStorage.clear();
      localStorage.removeItem("nsa.lang");
    } catch {
      /* ignore storage reset issues in jsdom */
    }
    document.body.classList.remove("senior-mode");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.classList.remove("senior-mode");
  });

  it("renders normal mode by default (no senior-mode class)", () => {
    renderApp();
    expect(document.body.classList.contains("senior-mode")).toBe(false);
  });

  it("exposes a senior-friendly toggle with accessible pressed state", () => {
    renderApp();
    const toggle = screen.getByRole("button", { name: /senior-friendly mode/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    act(() => toggle.click());
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.body.classList.contains("senior-mode")).toBe(true);
  });

  it("keeps English and Tamil language controls available", () => {
    renderApp();
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "தமிழ்" })).toBeInTheDocument();
  });

  it("switches tagline to Tamil when தமிழ் is selected", () => {
    renderApp();
    act(() => screen.getByRole("button", { name: "தமிழ்" }).click());
    // Tamil tagline text from i18n.
    expect(screen.getByText(/அரசு சேவைகள்/)).toBeInTheDocument();
  });

  it("senior toggle works in Tamil too (label localized, state toggles)", () => {
    renderApp();
    act(() => screen.getByRole("button", { name: "தமிழ்" }).click());
    const toggle = screen.getByRole("button", { name: /மூத்தோர் பயன்முறை/ });
    act(() => toggle.click());
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});
