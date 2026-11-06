import { useState } from "react";
import { checkEligibility } from "../api.js";
import {
  CASTE_CATEGORIES,
  DEFAULT_PROFILE,
  ENROLMENT_QUESTIONS,
  EXCLUSION_QUESTIONS,
  FARM_QUESTIONS,
  FARMER_TYPES,
  RATION_CARDS,
  STATES,
  toApiProfile,
} from "./profileFields.js";

const STEPS = [
  { title: "Your land", subtitle: "From your 7/12 utara (land record)" },
  { title: "About you", subtitle: "Some schemes depend on age and where you live" },
  { title: "Your farm and schemes", subtitle: "What you have and what you already receive" },
  { title: "Family details", subtitle: "Some schemes exclude certain families. Tick any that apply." },
];

function YesNo({ question, value, onChange }) {
  const name = `q-${question.key}`;
  return (
    <fieldset className="yesno">
      <legend>
        <span className="q-label">{question.label}</span>
        {question.hint && <span className="q-hint">{question.hint}</span>}
      </legend>
      <div className="segmented">
        <label className={value ? "selected" : ""}>
          <input type="radio" name={name} checked={value === true} onChange={() => onChange(true)} />
          Yes
        </label>
        <label className={!value ? "selected" : ""}>
          <input type="radio" name={name} checked={value === false} onChange={() => onChange(false)} />
          No
        </label>
      </div>
    </fieldset>
  );
}

function validateStep(step, p) {
  const errors = {};
  if (step === 0) {
    const land = parseFloat(p.land_holding_hectares);
    if (p.land_holding_hectares === "" || Number.isNaN(land)) errors.land = "Please enter your land size.";
    else if (land < 0) errors.land = "Land size cannot be negative.";
    else if (land > 10000) errors.land = "That looks too large. Please check the number.";
  }
  if (step === 1) {
    const age = parseInt(p.age, 10);
    if (p.age === "" || Number.isNaN(age)) errors.age = "Please enter your age.";
    else if (age < 10 || age > 110) errors.age = "Please enter an age between 10 and 110.";
  }
  return errors;
}

export default function EligibilityForm({ profile, setProfile, onResults }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (key, value) => setProfile((p) => ({ ...p, [key]: value }));
  const isLast = step === STEPS.length - 1;

  const next = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(step, profile);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) return;

    if (!isLast) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await checkEligibility(toApiProfile(profile));
      onResults(data);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setProfile(DEFAULT_PROFILE);
    setErrors({});
    setStep(0);
  };

  return (
    <div className="form-page">
      <div className="page-head">
        <h1>Check your scheme eligibility</h1>
        <p>4 short steps. Nothing you enter is stored.</p>
      </div>

      <ol className="stepper" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s.title} className={i === step ? "current" : i < step ? "done" : ""}>
            <button type="button" onClick={() => i < step && setStep(i)} disabled={i >= step}>
              <span className="step-num">{i < step ? "✓" : i + 1}</span>
              <span className="step-title">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <form className="card form-card" onSubmit={next} noValidate>
        <div className="form-head">
          <h2>{STEPS[step].title}</h2>
          <p>{STEPS[step].subtitle}</p>
        </div>

        {step === 0 && (
          <>
            <div className="field">
              <label htmlFor="land">Total land you farm</label>
              <div className="input-group">
                <input
                  id="land"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 3.5"
                  value={profile.land_holding_hectares}
                  onChange={(e) => set("land_holding_hectares", e.target.value)}
                  aria-invalid={!!errors.land}
                  aria-describedby="land-help"
                />
                <div className="segmented compact" role="radiogroup" aria-label="Unit">
                  {["acres", "hectares"].map((u) => (
                    <label key={u} className={profile.land_unit === u ? "selected" : ""}>
                      <input
                        type="radio"
                        name="land_unit"
                        checked={profile.land_unit === u}
                        onChange={() => set("land_unit", u)}
                      />
                      {u}
                    </label>
                  ))}
                </div>
              </div>
              <p id="land-help" className="help">
                {errors.land ? <span className="error">{errors.land}</span> : "1 hectare = 2.47 acres = 100 guntha (approx.)"}
              </p>
            </div>

            <fieldset className="field">
              <legend>How do you farm this land?</legend>
              <div className="choice-grid">
                {FARMER_TYPES.map((t) => (
                  <label key={t.value} className={`choice ${profile.farmer_type === t.value ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="farmer_type"
                      value={t.value}
                      checked={profile.farmer_type === t.value}
                      onChange={() => set("farmer_type", t.value)}
                    />
                    <span className="choice-label">{t.label}</span>
                    <span className="choice-hint">{t.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 1 && (
          <div className="grid-2">
            <div className="field">
              <label htmlFor="age">Your age</label>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                min="10"
                max="110"
                placeholder="e.g. 38"
                value={profile.age}
                onChange={(e) => set("age", e.target.value)}
                aria-invalid={!!errors.age}
              />
              {errors.age && <p className="help"><span className="error">{errors.age}</span></p>}
            </div>
            <div className="field">
              <label htmlFor="state">State</label>
              <select id="state" value={profile.state} onChange={(e) => set("state", e.target.value)}>
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="district">District <span className="optional">(optional)</span></label>
              <input
                id="district"
                type="text"
                placeholder="e.g. Pune"
                value={profile.district}
                onChange={(e) => set("district", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="caste">Category <span className="optional">(optional)</span></label>
              <select id="caste" value={profile.caste_category} onChange={(e) => set("caste_category", e.target.value)}>
                <option value="">Prefer not to say</option>
                {CASTE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ration">Ration card <span className="optional">(optional)</span></label>
              <select
                id="ration"
                value={profile.ration_card_category}
                onChange={(e) => set("ration_card_category", e.target.value)}
              >
                <option value="">None / not sure</option>
                {RATION_CARDS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="questions">
            <h3 className="group-title">Your farm</h3>
            {FARM_QUESTIONS.map((q) => (
              <YesNo key={q.key} question={q} value={profile[q.key]} onChange={(v) => set(q.key, v)} />
            ))}
            <h3 className="group-title">Schemes you already have</h3>
            {ENROLMENT_QUESTIONS.map((q) => (
              <YesNo key={q.key} question={q} value={profile[q.key]} onChange={(v) => set(q.key, v)} />
            ))}
          </div>
        )}

        {step === 3 && (
          <fieldset className="field">
            <legend>Does any of this apply to you or your family?</legend>
            <div className="check-list">
              {EXCLUSION_QUESTIONS.map((q) => (
                <label key={q.key} className={`check ${profile[q.key] ? "selected" : ""}`}>
                  <input type="checkbox" checked={profile[q.key]} onChange={(e) => set(q.key, e.target.checked)} />
                  <span>
                    <span className="choice-label">{q.label}</span>
                    <span className="choice-hint">{q.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="help">If none apply, leave them all unticked.</p>
          </fieldset>
        )}

        {submitError && (
          <div className="alert alert-error" role="alert">
            {submitError}
          </div>
        )}

        <div className="form-actions">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Clear
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Checking…" : isLast ? "See my schemes" : "Next →"}
          </button>
        </div>
      </form>
    </div>
  );
}
