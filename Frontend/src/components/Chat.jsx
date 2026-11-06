import { useEffect, useRef, useState } from "react";
import { askQuestion } from "../api.js";
import FormattedText from "./FormattedText.jsx";
import Logo from "./Logo.jsx";

const SUGGESTIONS = [
  "My crop was damaged by heavy rain. What should I do?",
  "How do I apply for PM-KISAN?",
  "What is the MSP for soybean this year?",
  "Am I eligible for the Maharashtra loan waiver?",
  "Which documents do I need for crop insurance?",
  "Where is the nearest place to get help?",
];

const ACRONYMS = /^(pm|kcc|msp|smam|pkvy|pmfby|pmksy)$/i;

// "pm_kisan_maandhan.txt" → "Pm Kisan Maandhan"
function prettySource(file) {
  return file
    .replace(/\.[a-z]+$/i, "")
    .split(/[_-]+/)
    .filter(Boolean)
    .map((w) => (ACRONYMS.test(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export default function Chat({ messages, setMessages, pendingQuestion, clearPendingQuestion }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const handledPending = useRef(null);

  const send = async (text) => {
    const question = text.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await askQuestion(question);
      setMessages((m) => [...m, { role: "assistant", text: res.answer, sources: res.sources || [] }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "error", text: err.message, retry: question }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // A question handed over from another page (e.g. "How to apply →" on a scheme card).
  useEffect(() => {
    // The ref stops React StrictMode's double effect run from sending it twice.
    if (!pendingQuestion) {
      handledPending.current = null;
    } else if (handledPending.current !== pendingQuestion) {
      handledPending.current = pendingQuestion;
      clearPendingQuestion();
      send(pendingQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const retry = (question, index) => {
    setMessages((m) => m.filter((_, i) => i !== index && i !== index - 1));
    send(question);
  };

  return (
    <div className="chat-page">
      <div className="chat card">
        <div className="chat-scroll" aria-live="polite">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <Logo size={48} />
              <h1>Namaskar! I'm Sahayak.</h1>
              <p>
                Ask me about government schemes, crop insurance, loans, loan waivers, MSP prices,
                or where to go for help. My answers come from official scheme documents.
              </p>
              <div className="chips">
                {SUGGESTIONS.map((q) => (
                  <button key={q} type="button" className="chip" onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg msg-${m.role}`}>
              {m.role === "assistant" && (
                <span className="msg-avatar">
                  <Logo size={28} />
                </span>
              )}
              <div className="msg-bubble">
                {m.role === "assistant" ? <FormattedText text={m.text} /> : <p>{m.text}</p>}

                {m.sources?.length > 0 && (
                  <div className="sources">
                    <span>Sources:</span>
                    {m.sources.map((s) => (
                      <span key={s} className="source" title={s}>
                        {prettySource(s)}
                      </span>
                    ))}
                  </div>
                )}

                {m.role === "error" && (
                  <button type="button" className="btn btn-link" onClick={() => retry(m.retry, i)}>
                    Try again
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg msg-assistant">
              <span className="msg-avatar">
                <Logo size={28} />
              </span>
              <div className="msg-bubble typing" aria-label="Sahayak is typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            placeholder="Type your question…"
            aria-label="Your question"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={1000}
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || loading} aria-label="Send">
            Send
          </button>
        </form>
      </div>
      {messages.length > 0 && (
        <button type="button" className="btn btn-link clear-chat" onClick={() => setMessages([])} disabled={loading}>
          Start a new conversation
        </button>
      )}
    </div>
  );
}
