import { useState } from "react";
import { ask, discover, getService } from "./api";
import { UI, pick, loadLang, saveLang, hasSavedLang } from "./i18n";
import type { DiscoveryResult, GroundedResponse, Lang, ServiceRecord } from "./types";
import { ServiceDetail } from "./ServiceDetail";
import { useAccessibility } from "./accessibility";

type View =
  | { screen: "search" }
  | { screen: "detail"; service: ServiceRecord };

export function App() {
  const { seniorMode, toggleSeniorMode } = useAccessibility();
  // Senior mode is Tamil-first (spec Req 1.2) when the user hasn't chosen a
  // language explicitly; an explicit choice always wins.
  const [lang, setLangState] = useState<Lang>(() =>
    hasSavedLang() ? loadLang() : loadLang(seniorMode ? "ta" : "en")
  );

  function setLang(next: Lang) {
    setLangState(next);
    saveLang(next);
  }
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [answer, setAnswer] = useState<GroundedResponse | null>(null);
  const [view, setView] = useState<View>({ screen: "search" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    setAnswer(null);
    try {
      const r = await discover(query, lang);
      setResult(r);
    } catch {
      setError("Could not reach the service. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function onAsk() {
    setError(null);
    setLoading(true);
    setResult(null);
    setAnswer(null);
    try {
      const a = await ask(query, lang);
      setAnswer(a);
    } catch {
      setError("Could not reach the service. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function openService(serviceId: string) {
    setError(null);
    setLoading(true);
    try {
      const service = await getService(serviceId);
      setView({ screen: "detail", service });
    } catch {
      setError("Could not load the service.");
    } finally {
      setLoading(false);
    }
  }

  if (view.screen === "detail") {
    return (
      <ServiceDetail
        service={view.service}
        lang={lang}
        onBack={() => setView({ screen: "search" })}
      />
    );
  }

  return (
    <main className="page">
      <header className="hero">
        <div className="langbar">
          <button
            className={lang === "en" ? "chip active" : "chip"}
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
          >
            English
          </button>
          <button
            className={lang === "ta" ? "chip active" : "chip"}
            onClick={() => setLang("ta")}
            aria-pressed={lang === "ta"}
          >
            தமிழ்
          </button>
          <button
            type="button"
            className="senior-toggle"
            onClick={toggleSeniorMode}
            aria-pressed={seniorMode}
          >
            {UI.seniorMode[lang]}
          </button>
        </div>
        <h1>{UI.appName[lang]}</h1>
        <p className="tagline">{UI.tagline[lang]}</p>
      </header>

      <form className="searchbar" onSubmit={onSearch}>
        <label htmlFor="q" className="visually-hidden">
          {UI.askPlaceholder[lang]}
        </label>
        <input
          id="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={UI.askPlaceholder[lang]}
        />
        <button type="submit" disabled={loading}>
          {loading ? "…" : UI.search[lang]}
        </button>
        <button type="button" className="ask-btn" onClick={onAsk} disabled={loading || !query.trim()}>
          {UI.ask[lang]}
        </button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      <div aria-live="polite" className="visually-hidden">
        {loading ? UI.loading[lang] : ""}
      </div>

      {answer && (
        <section className="answer-card" aria-live="polite">
          <h2>{UI.answer[lang]}</h2>
          {answer.grounded ? (
            <p>{pick(answer.answer, lang)}</p>
          ) : (
            <p className="muted">{pick(answer.answer, lang)}</p>
          )}

          {answer.serviceId && answer.serviceName && (
            <p>
              <strong>{pick(answer.serviceName, lang)}</strong>{" "}
              {answer.verificationStatus && (
                <span className={`badge status-${answer.verificationStatus}`}>
                  {UI.verificationStatus[lang]}:{" "}
                  {answer.verificationStatus === "verified"
                    ? UI.statusVerified[lang]
                    : answer.verificationStatus === "conditional"
                      ? UI.statusConditional[lang]
                      : UI.statusUnverified[lang]}
                </span>
              )}
            </p>
          )}

          {answer.citedSourceRefs.length > 0 && (
            <p className="muted">
              {UI.citedSources[lang]}: {answer.citedSourceRefs.join(", ")}
            </p>
          )}

          {answer.serviceId && (
            <button
              className="link"
              onClick={() => answer.serviceId && openService(answer.serviceId)}
            >
              {UI.viewFullService[lang]} →
            </button>
          )}

          <p className="demo-note">{pick(answer.notice, lang)}</p>
        </section>
      )}

      {result && (
        <section className="results" aria-live="polite">
          {result.kind === "resolved" && (
            <button className="result-card" onClick={() => openService(result.service.serviceId)}>
              <strong>{pick(result.service.name, lang)}</strong>
              <span className="muted">
                {pick(result.service.description, lang)}
              </span>
            </button>
          )}

          {result.kind === "clarification" && (
            <div>
              <p>{pick(result.question, lang)}</p>
              <ul className="option-list">
                {result.options.map((o) => (
                  <li key={o.serviceId}>
                    <button className="result-card" onClick={() => openService(o.serviceId)}>
                      {pick(o.label, lang)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.kind === "no-match" && (
            <p className="muted">{pick(result.message, lang)}</p>
          )}
        </section>
      )}

      <footer className="demo-note">{UI.demoNotice[lang]}</footer>
    </main>
  );
}
