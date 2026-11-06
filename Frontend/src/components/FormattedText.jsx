// Renders the small subset of Markdown the LLM tends to produce (paragraphs,
// bullet / numbered lists, **bold**) as React elements, without injecting raw HTML.

function inline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

export default function FormattedText({ text }) {
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);

    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else if (line === "") {
      flushList();
    } else {
      flushList();
      const heading = line.match(/^#{1,6}\s+(.*)$/);
      blocks.push({ type: heading ? "h" : "p", text: heading ? heading[1] : line });
    }
  });
  flushList();

  return blocks.map((b, i) => {
    if (b.type === "ul" || b.type === "ol") {
      const List = b.type;
      return (
        <List key={i}>
          {b.items.map((item, j) => (
            <li key={j}>{inline(item, `${i}-${j}`)}</li>
          ))}
        </List>
      );
    }
    if (b.type === "h") return <p key={i} className="msg-heading">{inline(b.text, i)}</p>;
    return <p key={i}>{inline(b.text, i)}</p>;
  });
}
