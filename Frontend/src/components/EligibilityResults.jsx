import { useState } from "react";

function SchemeCard({ scheme, onAsk }) {
  const [open, setOpen] = useState(scheme.eligible);

  return (
    <article className={`card scheme ${scheme.eligible ? "eligible" : "not-eligible"}`}>
      <header className="scheme-head">
        <div>
          <div className="badges">
            <span className={`badge ${scheme.eligible ? "badge-yes" : "badge-no"}`}>
              {scheme.eligible ? "✓ Likely eligible" : "✕ Not eligible"}
            </span>
            {scheme.level && (
              <span className="badge badge-level">
                {scheme.level === "state" ? "Maharashtra govt." : "Central govt."}
              </span>
            )}
          </div>
          <h3>{scheme.name}</h3>
        </div>
      </header>

      {scheme.benefit_summary && (
        <p className="benefit">
          <span className="benefit-label">Benefit</span>
          {scheme.benefit_summary}
        </p>
      )}

      {!scheme.eligible && (
        <div className="reasons">
          <p className="reasons-title">Why not:</p>
          <ul>
            {scheme.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {scheme.required_documents?.length > 0 && (
        <div className="docs">
          <button
            type="button"
            className="docs-toggle"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            Documents needed ({scheme.required_documents.length}) <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </button>
          {open && (
            <ul className="doc-list">
              {scheme.required_documents.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="scheme-actions">
        <button
          type="button"
          className="btn btn-link"
          onClick={() =>
            onAsk(
              scheme.eligible
                ? `How and where do I apply for ${scheme.name}?`
                : `Tell me about ${scheme.name}. Who is eligible?`,
            )
          }
        >
          {scheme.eligible ? "How to apply →" : "Learn more →"}
        </button>
      </div>
    </article>
  );
}

export default function EligibilityResults({ data, onEdit, onAsk }) {
  const eligible = data.results.filter((r) => r.eligible);
  const notEligible = data.results.filter((r) => !r.eligible);
  const [tab, setTab] = useState(eligible.length ? "eligible" : "all");

  const shown = tab === "eligible" ? eligible : tab === "not" ? notEligible : data.results;

  return (
    <div className="results-page">
      <section className="results-summary card">
        <div className="score" aria-hidden="true">
          <span className="score-num">{data.eligible_count}</span>
          <span className="score-of">of {data.total_schemes_checked}</span>
        </div>
        <div>
          <h1>
            {data.eligible_count > 0
              ? `You may be eligible for ${data.eligible_count} scheme${data.eligible_count === 1 ? "" : "s"}`
              : "No matching schemes found"}
          </h1>
          <p>
            {data.eligible_count > 0
              ? "Collect the documents listed below and visit your Taluka Agriculture Office or nearest CSC (Aaple Sarkar Seva Kendra) to apply."
              : "Check the reasons below. If something you entered was wrong, edit your answers and try again."}
          </p>
          <button type="button" className="btn btn-ghost" onClick={onEdit}>
            ← Edit my answers
          </button>
        </div>
      </section>

      <div className="tabs" role="tablist" aria-label="Filter schemes">
        {[
          ["eligible", `Eligible (${eligible.length})`],
          ["not", `Not eligible (${notEligible.length})`],
          ["all", `All (${data.results.length})`],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="empty">Nothing to show here.</p>
      ) : (
        <div className="scheme-list">
          {shown.map((s) => (
            <SchemeCard key={s.scheme_id} scheme={s} onAsk={onAsk} />
          ))}
        </div>
      )}

      <p className="note">
        This check uses the rules we have on file and may miss local conditions, such as whether
        your crop is notified in your district for PMFBY. Final eligibility is decided by the
        scheme office.
      </p>
    </div>
  );
}
