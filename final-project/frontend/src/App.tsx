import { useEffect, useState } from "react";
import { ask, getService, listServices } from "./api";
import { UI, pick, loadLang, saveLang, hasSavedLang, categoryLabel } from "./i18n";
import type { GroundedResponse, Lang, ServiceRecord, VerificationStatus } from "./types";
import { ServiceDetail } from "./ServiceDetail";
import { useAccessibility } from "./accessibility";

type View =
  | { screen: "search" }
  | { screen: "detail"; service: ServiceRecord };

// Services featured on the home screen. These reference existing records by
// their existing serviceId; no new records are created here.
const FEATURED_SERVICE_IDS = ["birth-certificate", "income-certificate"] as const;

// Human-readable, non-color trust label. Text always accompanies colour.
function statusText(status: VerificationStatus, lang: Lang): string {
  if (status === "verified") return UI.statusVerified[lang];
  if (status === "conditional") return UI.statusConditional[lang];
  return UI.statusUnverified[lang];
}

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

  // Primary assistant action: Enter in the input submits this. The /ask
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
      setError(UI.backendError[lang]);
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
      setError(UI.backendError[lang]);
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

  const isNoMatch = answer !== null && answer.kind === "no-match";
  const hasService = answer !== null && !!answer.serviceId && !!answer.serviceName;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            நம்
          </span>
          <span className="brand-text">
            <strong>{UI.appName[lang]}</strong>
            <span className="brand-tagline">{UI.tagline[lang]}</span>
          </span>
        </div>
        <div className="controls">
          <div className="lang-switch" role="group" aria-label="Language">
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
          </div>
          <button
            type="button"
            className="senior-toggle"
            onClick={toggleSeniorMode}
            aria-pressed={seniorMode}
          >
            {UI.seniorMode[lang]}
          </button>
        </div>
      </header>

      <main className="page">
        <section className="hero" aria-labelledby="hero-h">
          <h1 id="hero-h">{UI.heroTitle[lang]}</h1>
          <p className="hero-sub">{UI.heroSubtitle[lang]}</p>

          <form className="ask-form" onSubmit={onAsk}>
            <label htmlFor="q" className="visually-hidden">
              {UI.heroTitle[lang]}
            </label>
            <input
              id="q"
              className="ask-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={UI.askPlaceholder[lang]}
              autoComplete="off"
            />
            <button type="submit" className="ask-btn" disabled={loading || !query.trim()}>
              {loading ? UI.loading[lang] : UI.askPrimary[lang]}
            </button>
          </form>
        </section>

        {/* Polite live region for loading, for assistive technology. */}
        <div aria-live="polite" className="visually-hidden">
          {loading ? UI.loading[lang] : ""}
        </div>

        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}

        {isNoMatch && !error && (
          <section className="answer-card" aria-live="polite">
            <h2>{UI.noMatchTitle[lang]}</h2>
            <p className="muted">{UI.noMatchHint[lang]}</p>
          </section>
        )}

        {hasService && !error && answer && (
          <section className="answer-card" aria-live="polite" aria-labelledby="answer-h">
            <p className="answer-kicker" id="answer-h">
              {UI.hereIsWhat[lang]}
            </p>
            <h2 className="answer-title">{pick(answer.serviceName!, lang)}</h2>

            <div className="badge-row">
              {answer.verificationStatus && (
                <span className={`badge status-${answer.verificationStatus}`}>
                  {UI.trustStatus[lang]}: {statusText(answer.verificationStatus, lang)}
                </span>
              )}
              <span className="badge">demo</span>
            </div>

            <p className={answer.grounded ? "answer-body" : "answer-body muted"}>
              {pick(answer.answer, lang)}
            </p>

            {answer.citedSourceRefs.length > 0 && (
              <p className="muted answer-source">
                {UI.citedSources[lang]}: {answer.citedSourceRefs.join(", ")}
              </p>
            )}

            {answer.serviceId && (
              <button
                className="btn-secondary"
                onClick={() => answer.serviceId && openService(answer.serviceId)}
              >
                {UI.viewFullService[lang]} →
              </button>
            )}

            <p className="notice notice-info">{pick(answer.notice, lang)}</p>
          </section>
        )}

        {featured.length > 0 && (
          <section className="featured" aria-labelledby="featured-h">
            <h2 id="featured-h" className="section-title">
              {UI.popularServices[lang]}
            </h2>
            <div className="card-grid">
              {featured.map((s) => (
                <article className="service-card" key={s.serviceId}>
                  <span className="service-category">{categoryLabel(s.category, lang)}</span>
                  <h3 className="service-name">{pick(s.name, lang)}</h3>
                  <p className="service-desc">{pick(s.description, lang)}</p>
                  <div className="badge-row">
                    <span className={`badge status-${s.status}`}>
                      {statusText(s.status, lang)}
                    </span>
                    {s.dataSource === "demo" && <span className="badge">demo</span>}
                  </div>
                  <button
                    className="btn-primary card-action"
                    onClick={() => openService(s.serviceId)}
                    aria-label={`${pick(s.name, lang)} — ${UI.viewService[lang]}`}
                  >
                    {UI.viewService[lang]} →
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="site-note">{UI.demoNotice[lang]}</footer>
      </main>
    </div>
  );
}
