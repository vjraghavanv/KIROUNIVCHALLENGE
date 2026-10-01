import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AccessibilityProvider, useAccessibility } from "../accessibility";

function Probe() {
  const { seniorMode, toggleSeniorMode, defaultLang } = useAccessibility();
  return (
    <div>
      <span data-testid="mode">{seniorMode ? "on" : "off"}</span>
      <span data-testid="defaultLang">{defaultLang}</span>
      <button onClick={toggleSeniorMode}>toggle</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <AccessibilityProvider>
      <Probe />
    </AccessibilityProvider>
  );
}

describe("AccessibilityProvider", () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.classList.remove("senior-mode");
  });
  afterEach(() => {
    sessionStorage.clear();
    document.body.classList.remove("senior-mode");
  });

  it("defaults to normal mode (senior off)", () => {
    renderProbe();
    expect(screen.getByTestId("mode").textContent).toBe("off");
    expect(document.body.classList.contains("senior-mode")).toBe(false);
  });

  it("enables senior mode and applies the body class", () => {
    renderProbe();
    act(() => {
      screen.getByText("toggle").click();
    });
    expect(screen.getByTestId("mode").textContent).toBe("on");
    expect(document.body.classList.contains("senior-mode")).toBe(true);
  });

  it("disables senior mode again", () => {
    renderProbe();
    act(() => screen.getByText("toggle").click()); // on
    act(() => screen.getByText("toggle").click()); // off
    expect(screen.getByTestId("mode").textContent).toBe("off");
    expect(document.body.classList.contains("senior-mode")).toBe(false);
  });

  it("persists the preference for the session", () => {
    renderProbe();
    act(() => screen.getByText("toggle").click());
    expect(sessionStorage.getItem("nsa.seniorMode")).toBe("1");
  });

  it("restores senior mode from session storage on mount", () => {
    sessionStorage.setItem("nsa.seniorMode", "1");
    renderProbe();
    expect(screen.getByTestId("mode").textContent).toBe("on");
    expect(screen.getByTestId("defaultLang").textContent).toBe("ta"); // Tamil-first
  });

  it("is English-first in normal mode", () => {
    renderProbe();
    expect(screen.getByTestId("defaultLang").textContent).toBe("en");
  });
});
