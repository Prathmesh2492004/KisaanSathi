import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import EligibilityForm from "./components/EligibilityForm.jsx";
import EligibilityResults from "./components/EligibilityResults.jsx";
import Chat from "./components/Chat.jsx";
import { DEFAULT_PROFILE } from "./components/profileFields.js";

const PAGES = ["home", "eligibility", "chat"];

function pageFromHash() {
  const page = window.location.hash.replace("#/", "").replace("#", "");
  return PAGES.includes(page) ? page : "home";
}

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [results, setResults] = useState(null);
  // Lives here so the conversation survives switching pages.
  const [messages, setMessages] = useState([]);
  // A question handed to the chat from elsewhere (e.g. "Ask about this scheme").
  const [pendingQuestion, setPendingQuestion] = useState(null);

  // Hash-based routing keeps the browser back button working without a router dependency.
  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page, results]);

  const navigate = (next) => {
    window.location.hash = `#/${next}`;
  };

  const askAbout = (question) => {
    setPendingQuestion(question);
    navigate("chat");
  };

  return (
    <div className="app">
      <Header page={page} onNavigate={navigate} />
      <main className="main">
        {page === "home" && <Home onNavigate={navigate} onAsk={askAbout} />}

        {page === "eligibility" &&
          (results ? (
            <EligibilityResults
              data={results}
              onEdit={() => setResults(null)}
              onAsk={askAbout}
            />
          ) : (
            <EligibilityForm profile={profile} setProfile={setProfile} onResults={setResults} />
          ))}

        {page === "chat" && (
          <Chat
            messages={messages}
            setMessages={setMessages}
            pendingQuestion={pendingQuestion}
            clearPendingQuestion={() => setPendingQuestion(null)}
          />
        )}
      </main>
      <footer className="footer">
        <p>
          KisaanSathi gives guidance, not an official decision. Always confirm with your Taluka
          Agriculture Office, Krishi Vigyan Kendra, or the Kisan Call Centre (1800-180-1551).
        </p>
      </footer>
    </div>
  );
}
