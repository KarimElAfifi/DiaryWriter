import { formatDate } from "../utils/diary.js";
import {
  BookIcon,
  ChevronDown,
  EyeOffIcon,
  ImageIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
} from "./icons.jsx";

export function Sidebar({
  activeId,
  bgFileRef,
  bgUrl,
  darkMode,
  hiddenEntries,
  loading,
  settingsOpen,
  settingsRef,
  visibleEntries,
  onCreateEntry,
  onDeleteEntry,
  onHandleBgFile,
  onResetBg,
  onSelectEntry,
  onSetSettingsOpen,
  onToggleDarkMode,
  onToggleHide,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-top-row">
          <div className="app-brand">
            <BookIcon />
            <span className="app-brand-name">Tagebuch</span>
          </div>

          <div className="settings-wrapper" ref={settingsRef}>
            <button className="settings-btn" onClick={() => onSetSettingsOpen((v) => !v)}>
              <SettingsIcon />
              <ChevronDown />
            </button>

            {settingsOpen && (
              <div className="settings-dropdown">
                <div className="settings-section">
                  <div className="settings-label">Darstellung</div>
                  <label className="theme-switch-row">
                    <span>Dark Mode</span>
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={onToggleDarkMode}
                    />
                    <span className="theme-switch" aria-hidden="true" />
                  </label>
                </div>

                <div className="settings-section">
                  <div className="settings-label">Hintergrundbild</div>
                  <div className="settings-row">
                    <button className="settings-file-btn" onClick={() => bgFileRef.current?.click()}>
                      <ImageIcon /> Bild auswählen
                    </button>
                    {bgUrl && (
                      <button className="bg-reset-btn" onClick={onResetBg}>Zurücksetzen</button>
                    )}
                  </div>
                  <input
                    ref={bgFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={onHandleBgFile}
                  />
                </div>

                <div className="settings-section">
                  <div className="settings-label">
                    Ausgeblendete Einträge ({hiddenEntries.length})
                  </div>
                  {hiddenEntries.length === 0 ? (
                    <p className="no-hidden">Keine ausgeblendeten Einträge</p>
                  ) : (
                    <div className="hidden-entries-list">
                      {hiddenEntries.map((entry) => (
                        <div key={entry.id} className="hidden-entry-row">
                          <span className="hidden-entry-title">{entry.title || "Kein Titel"}</span>
                          <button
                            className="hidden-action-btn"
                            onClick={() => {
                              onToggleHide(entry.id);
                              onSelectEntry(entry.id);
                              onSetSettingsOpen(false);
                            }}
                          >
                            Einblenden
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="new-entry-btn" onClick={onCreateEntry}>
          <PlusIcon /> Neuer Eintrag
        </button>
      </div>

      <div className="entries-list">
        {loading ? (
          <div className="entries-empty">Lade Einträge...</div>
        ) : visibleEntries.length === 0 ? (
          <div className="entries-empty">Noch keine Einträge.<br />Starte mit einem neuen Eintrag.</div>
        ) : (
          visibleEntries.map((entry) => (
            <div
              key={entry.id}
              className={`entry-item${activeId === entry.id ? " active" : ""}`}
              onClick={() => onSelectEntry(entry.id)}
            >
              <div className="entry-item-info">
                <div className="entry-item-title">{entry.title || "Kein Titel"}</div>
                <div className="entry-item-date">{formatDate(entry.updatedAt)}</div>
              </div>
              <div className="entry-actions">
                <button
                  className="entry-action-btn hide-btn"
                  title="Ausblenden"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onToggleHide(entry.id);
                  }}
                >
                  <EyeOffIcon />
                </button>
                <button
                  className="entry-action-btn delete-btn"
                  title="Löschen"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onDeleteEntry(entry.id);
                  }}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
