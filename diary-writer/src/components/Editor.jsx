import { countWords, formatDate } from "../utils/diary.js";
import { BookIcon } from "./icons.jsx";

export function Editor({
  activeEntry,
  saved,
  titleRef,
  onCreateEntry,
  onUpdateEntry,
}) {
  if (!activeEntry) {
    return (
      <main className="editor-area">
        <div className="editor-empty">
          <div className="editor-empty-icon"><BookIcon /></div>
          <p className="editor-empty-text">
            Wähle einen Eintrag aus, oder beginne mit einem neuen Gedanken.
          </p>
          <span className="editor-empty-sub" onClick={onCreateEntry}>
            + Neuen Eintrag erstellen
          </span>
        </div>
      </main>
    );
  }

  const wordCount = countWords(activeEntry.content);

  return (
    <main className="editor-area">
      <div className="editor-inner">
        <div className="editor-page">
          <div className="editor-dateline">{formatDate(activeEntry.createdAt)}</div>
          <textarea
            ref={titleRef}
            className="editor-title-input"
            placeholder="Titel des Eintrags ..."
            value={activeEntry.title}
            rows={1}
            onChange={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
              onUpdateEntry(activeEntry.id, { title: e.target.value });
            }}
          />
          <div className="editor-divider" />
          <textarea
            className="editor-content-input"
            placeholder="Schreibe hier deine Gedanken nieder ..."
            value={activeEntry.content}
            onChange={(e) => onUpdateEntry(activeEntry.id, { content: e.target.value })}
          />
        </div>
      </div>

      <div className="status-bar">
        <div className="status-left">
          <span>{wordCount} Wörter</span>
          <span>{activeEntry.content.length} Zeichen</span>
        </div>
        <span className={saved ? "status-saved" : ""}>
          {saved ? "Gespeichert" : "Speichern ..."}
        </span>
      </div>
    </main>
  );
}
