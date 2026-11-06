// Thin client for the KisaanSathi FastAPI backend (see Backend/app.py).
// Override the URL with VITE_API_URL in Frontend/.env when deploying.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Could not reach the KisaanSathi server. Please check that the backend is running.");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : "";
    } catch {
      /* response had no JSON body */
    }
    throw new Error(detail || `The server returned an error (${res.status}). Please try again.`);
  }
  return res.json();
}

export function checkHealth() {
  return request("/");
}

/** POST /chat → { answer: string, sources: string[] } */
export function askQuestion(question) {
  return request("/chat", { method: "POST", body: JSON.stringify({ question }) });
}

/** POST /check-eligibility → { eligible_count, total_schemes_checked, results[] } */
export function checkEligibility(profile) {
  return request("/check-eligibility", { method: "POST", body: JSON.stringify(profile) });
}
