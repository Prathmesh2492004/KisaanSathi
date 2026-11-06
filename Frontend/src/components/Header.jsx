import { useEffect, useState } from "react";
import { checkHealth } from "../api.js";
import Logo from "./Logo.jsx";

const NAV = [
  { id: "home", label: "Home" },
  { id: "eligibility", label: "Check schemes" },
  { id: "chat", label: "Ask Sahayak" },
];

export default function Header({ page, onNavigate }) {
  const [online, setOnline] = useState(null);

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then(() => !cancelled && setOnline(true))
      .catch(() => !cancelled && setOnline(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <a href="#/home" className="brand" aria-label="KisaanSathi home">
          <Logo />
          <span>
            Kisaan<strong>Sathi</strong>
          </span>
        </a>

        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${page === item.id ? "active" : ""}`}
              aria-current={page === item.id ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <span
          className={`status ${online === null ? "" : online ? "ok" : "down"}`}
          title={
            online === null
              ? "Checking server…"
              : online
                ? "Server is online"
                : "Server is offline. Start the backend with: uvicorn app:app --reload"
          }
        >
          <span className="status-dot" aria-hidden="true" />
          <span className="status-text">
            {online === null ? "Checking" : online ? "Online" : "Offline"}
          </span>
        </span>
      </div>
    </header>
  );
}
