import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AccessibilityProvider } from "./accessibility";
import "./styles.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("root element not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </React.StrictMode>
);
