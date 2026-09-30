import { UI, pick } from "./i18n";
import type { DocumentKind, Lang, ServiceRecord } from "./types";

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

export function ServiceDetail({ service, lang, onBack }: Props) {
  const steps = [...service.steps].sort((a, b) => a.order - b.order);

  return (
    <main className="page">
      <button className="link" onClick={onBack}>
        ← {UI.back[lang]}
      </button>

      <header className="detail-header">
        <h1>{pick(service.name, lang)}</h1>
        {service.status === "unverified" && (
          <span className="badge warn">unverified</span>
        )}
        {service.dataSource === "demo" && <span className="badge">demo</span>}
        <p className="muted">{pick(service.description, lang)}</p>
      </header>

      <section aria-labelledby="docs-h">
        <h2 id="docs-h">{UI.documents[lang]}</h2>
        {service.documents.length === 0 ? (
          <p className="muted">{UI.notAvailable[lang]}</p>
        ) : (
          <ul className="doc-list">
            {service.documents.map((d) => (
              <li key={d.id}>
                <span>{pick(d.name, lang)}</span>
                <span className={`badge kind-${d.kind}`}>{UI[KIND_LABEL[d.kind]][lang]}</span>
                {d.kind === "conditional" && d.condition && (
                  <span className="muted"> — {pick(d.condition, lang)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="steps-h">
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

      <section aria-labelledby="apply-h">
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

      <section aria-labelledby="src-h">
        <h2 id="src-h">{UI.sources[lang]}</h2>
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

      <footer className="demo-note">{UI.demoNotice[lang]}</footer>
    </main>
  );
}
