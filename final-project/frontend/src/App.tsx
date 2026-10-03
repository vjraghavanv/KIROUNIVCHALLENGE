import { useEffect, useState } from "react";
import { ask, getService, listServices } from "./api";
import { UI, pick, loadLang, saveLang, hasSavedLang } from "./i18n";
import type { GroundedResponse, Lang, ServiceRecord } from "./types";
import { ServiceDetail } from "./ServiceDetail";
import { useAccessibility } from "./accessibility";

type View =
  | { screen: "search" }
  | { screen: "detail"; service: ServiceRecord };

// Services featured on the home screen. These reference existing records by
// their existing serviceId; no new records are created here.
const FEATURED_SERVICE_IDS = ["income-certificate", "birth-certificate"] as const;

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
  const [answer, setAnswer] = useState<GroundedResponse | null>(null);
  const [view, setView] = useState<View>({ screen: "search" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featured, setFeatured] = useState<ServiceRecord[]>([]);

  // Load the featured demo services for the home screen. Resilient: if the
  // backend is unreachable the rest of the UI still works.
  useEffect(() => {
    let active = true;
    listServices()
      .then((services) => {
        if (!active) return;
        const byId = new Map(services.map((s) => [s.serviceId, s]));
        const picked = FEATURED_SERVICE_IDS.map((id) => byId.get(id)).filter(
          (s): s is ServiceRecord => s !== undefined
        );
        setFeatured(picked);
      })
      .catch(() => {
        if (active) setFeatured([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Primary assistant action: Enter in the search box submits this. The /ask
  // pipeline runs discovery internally, so resolution, clarification, and
  // honest no-match behavior are all preserved through this single action.
  async function onAsk(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
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

      <form className="searchbar" onSubmit={onAsk}>
        <label htmlFor="q" className="visually-hidden">
          {UI.askPlaceholder[lang]}
        </label>
        <input
          id="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={UI.askPlaceholder[lang]}
        />
        <button type="submit" className="ask-btn" disabled={loading || !query.trim()}>
          {loading ? "…" : UI.ask[lang]}
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

      {featured.length > 0 && (
        <section className="featured" aria-labelledby="featured-h">
          <h2 id="featured-h">{UI.popularServices[lang]}</h2>
          <div className="results">
            {featured.map((s) => (
              <button
                key={s.serviceId}
                className="result-card"
                onClick={() => openService(s.serviceId)}
                aria-label={`${pick(s.name, lang)} — ${UI.openService[lang]}`}
              >
                <strong>{pick(s.name, lang)}</strong>
                <span className="muted">{pick(s.description, lang)}</span>
                <span className="badge-row">
                  <span className={`badge status-${s.status}`}>
                    {UI.verificationStatus[lang]}:{" "}
                    {s.status === "verified"
                      ? UI.statusVerified[lang]
                      : s.status === "conditional"
                        ? UI.statusConditional[lang]
                        : UI.statusUnverified[lang]}
                  </span>
                  {s.dataSource === "demo" && <span className="badge">demo</span>}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className="demo-note">{UI.demoNotice[lang]}</footer>
    </main>
  );
}
