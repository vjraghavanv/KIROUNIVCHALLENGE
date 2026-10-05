/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the Namma Seva AI backend API.
   * Unset in local development (defaults to "/api" via the Vite dev proxy).
   * Set in production (e.g. AWS Amplify) to the deployed FastAPI origin.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
