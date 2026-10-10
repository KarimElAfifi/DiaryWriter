import { countWords, formatDate } from "../utils/diary.js";
import { BookIcon } from "./icons.jsx";

export function Editor({
  activeEntry,
  saved,
  saveError,
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
            Select an entry or start with a new thought.
          </p>
          <span className="editor-empty-sub" onClick={onCreateEntry}>
            + Create a new entry
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
            placeholder="Entry title..."
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
            placeholder="Write your thoughts here..."
            value={activeEntry.content}
            onChange={(e) => onUpdateEntry(activeEntry.id, { content: e.target.value })}
          />
        </div>
      </div>

      <div className="status-bar">
        <div className="status-left">
          <span>{wordCount} words</span>
          <span>{activeEntry.content.length} characters</span>
        </div>
        <span className={saveError ? "status-error" : saved ? "status-saved" : ""}>
          {saveError ? "Save failed" : saved ? "Saved" : "Saving..."}
        </span>
      </div>
    </main>
  );
}
