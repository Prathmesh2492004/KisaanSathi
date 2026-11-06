const FEATURES = [
  {
    icon: "📋",
    title: "Find schemes you qualify for",
    text: "Answer a few simple questions about your land and family. We check you against 12 central and Maharashtra schemes and tell you exactly why you do or don't qualify.",
    action: "eligibility",
    cta: "Check my schemes",
  },
  {
    icon: "💬",
    title: "Ask Sahayak anything",
    text: "Ask about crop insurance, loans, loan waivers, MSP, or which office to visit. Answers come from official scheme documents, with the sources shown.",
    action: "chat",
    cta: "Ask a question",
  },
];

const STARTERS = [
  "How do I claim crop insurance after crop loss?",
  "What documents do I need for a Kisan Credit Card?",
  "What is the Namo Shetkari Mahasanman Nidhi?",
];

export default function Home({ onNavigate, onAsk }) {
  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">For farmers in Maharashtra and across India</p>
        <h1>
          Every scheme you're owed,
          <br />
          in one place.
        </h1>
        <p className="lead">
          KisaanSathi helps you find the government schemes you are eligible for, the documents
          you need, and where to apply, in simple words.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => onNavigate("eligibility")}>
            Check my eligibility
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => onNavigate("chat")}>
            Ask a question
          </button>
        </div>
        <ul className="hero-stats" aria-label="Highlights">
          <li><strong>12</strong> schemes checked</li>
          <li><strong>2 min</strong> to finish</li>
          <li><strong>Free</strong> no sign-up needed</li>
        </ul>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <article key={f.title} className="card feature">
            <span className="feature-icon" aria-hidden="true">{f.icon}</span>
            <h2>{f.title}</h2>
            <p>{f.text}</p>
            <button type="button" className="btn btn-link" onClick={() => onNavigate(f.action)}>
              {f.cta} →
            </button>
          </article>
        ))}
      </section>

      <section className="starters">
        <h2>People often ask</h2>
        <div className="chips">
          {STARTERS.map((q) => (
            <button key={q} type="button" className="chip" onClick={() => onAsk(q)}>
              {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
