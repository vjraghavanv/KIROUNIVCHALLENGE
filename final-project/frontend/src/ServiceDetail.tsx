import { UI, pick, categoryLabel } from "./i18n";
import type { DocumentKind, Lang, ServiceRecord, VerificationStatus } from "./types";

interface Props {
  service: ServiceRecord;
  lang: Lang;
  onBack: () => void;
}

const KIND_LABEL: Record<DocumentKind, keyof typeof UI> = {
  required: "required",
  conditional: "conditional",
  optional: "optional",
};

const STATUS_LABEL: Record<VerificationStatus, keyof typeof UI> = {
  verified: "statusVerified",
  conditional: "statusConditional",
  unverified: "statusUnverified",
};

export function ServiceDetail({ service, lang, onBack }: Props) {
  const steps = [...service.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="app">
      <header className="topbar topbar-detail">
        <button className="btn-back" onClick={onBack}>
          ← {UI.back[lang]}
        </button>
        <span className="brand-text brand-text-compact">
          <strong>{UI.appName[lang]}</strong>
        </span>
      </header>

      <main className="page detail">
        <header className="detail-hero">
          <span className="service-category">{categoryLabel(service.category, lang)}</span>
          <h1>{pick(service.name, lang)}</h1>
          <div className="badge-row">
            <span
              className={`badge status-${service.status}`}
              title={UI.verificationStatus[lang]}
            >
              {UI.trustStatus[lang]}: {UI[STATUS_LABEL[service.status]][lang]}
            </span>
            {service.dataSource === "demo" && <span className="badge">demo</span>}
          </div>
        </header>

        <section className="card" aria-labelledby="about-h">
          <h2 id="about-h">{UI.aboutService[lang]}</h2>
          <p>{pick(service.description, lang)}</p>
        </section>

        <section className="card" aria-labelledby="docs-h">
          <h2 id="docs-h">{UI.documents[lang]}</h2>
          {service.documents.length === 0 ? (
            <p className="muted">{UI.notAvailable[lang]}</p>
          ) : (
            <ul className="doc-list">
              {service.documents.map((d) => (
                <li key={d.id} className="doc-item">
                  <div className="doc-head">
                    <span className="doc-name">{pick(d.name, lang)}</span>
                    <span className={`badge kind-${d.kind}`}>
                      {UI[KIND_LABEL[d.kind]][lang]}
                    </span>
                  </div>
                  {d.kind === "conditional" && d.condition && (
                    <p className="doc-condition muted">↳ {pick(d.condition, lang)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="steps-h">
          <h2 id="steps-h">{UI.steps[lang]}</h2>
          {steps.length === 0 ? (
            <p className="muted">{UI.notAvailable[lang]}</p>
          ) : (
            <ol className="step-list">
              {steps.map((s) => (
                <li key={s.order}>{pick(s.instruction, lang)}</li>
              ))}
            </ol>
          )}
        </section>

        <section className="card" aria-labelledby="apply-h">
          <h2 id="apply-h">{UI.whereToApply[lang]}</h2>
          {service.applicationChannels.length === 0 ? (
            <p className="muted">{UI.notAvailable[lang]}</p>
          ) : (
            <ul className="channel-list">
              {service.applicationChannels.map((c, i) => (
                <li key={i}>
                  {pick(c.label, lang)}
                  {c.url && (
                    <>
                      {" "}
                      <a href={c.url} target="_blank" rel="noreferrer">
                        {c.url}
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="src-h">
          <h2 id="src-h">{UI.sources[lang]}</h2>
          <p className="muted">
            {UI.lastVerified[lang]}: {service.lastVerified}
          </p>
          {service.officialSources.length === 0 ? (
            <p className="muted">{UI.notAvailable[lang]}</p>
          ) : (
            <ul className="source-list">
              {service.officialSources.map((s, i) => (
                <li key={i}>
                  {s.name} —{" "}
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.url}
                  </a>{" "}
                  <span className="muted">
                    ({UI.lastVerified[lang]}: {s.lastChecked})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card card-note" aria-labelledby="note-h">
          <h2 id="note-h">{UI.importantNote[lang]}</h2>
          <p>{UI.demoNotice[lang]}</p>
        </section>
      </main>
    </div>
  );
}
