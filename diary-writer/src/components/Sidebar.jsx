import { useState } from "react";
import { formatDate } from "../utils/diary.js";
import Statistics from "./statistics.jsx";
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
  entries,
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
  const [showStats, setShowStats] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-top-row">
          <div className="app-brand">
            <BookIcon />
            <span className="app-brand-name">Diary</span>
          </div>

          <div className="settings-wrapper" ref={settingsRef}>
            <button className="settings-btn" onClick={() => onSetSettingsOpen((v) => !v)}>
              <SettingsIcon />
              <ChevronDown />
            </button>

            {settingsOpen && (
              <div className="settings-dropdown">
                <div className="settings-section">
                  <div className="settings-label">Appearance</div>
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
                  <div className="settings-label">Background image</div>
                  <div className="settings-row">
                    <button className="settings-file-btn" onClick={() => bgFileRef.current?.click()}>
                      <ImageIcon /> Choose image
                    </button>
                    {bgUrl && (
                      <button className="bg-reset-btn" onClick={onResetBg}>Reset</button>
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
                  <div className="settings-label">Statistics</div>
                  <button
                    className="settings-file-btn"
                    style={{ width: "100%" }}
                    onClick={() => {
                      setShowStats((v) => !v);
                      onSetSettingsOpen(false);
                    }}
                  >
                    {showStats ? "Hide statistics" : "Show statistics"}
                  </button>
                </div>

                <div className="settings-section">
                  <div className="settings-label">
                    Hidden entries ({hiddenEntries.length})
                  </div>
                  {hiddenEntries.length === 0 ? (
                    <p className="no-hidden">No hidden entries</p>
                  ) : (
                    <div className="hidden-entries-list">
                      {hiddenEntries.map((entry) => (
                        <div key={entry.id} className="hidden-entry-row">
                          <span className="hidden-entry-title">{entry.title || "Untitled"}</span>
                          <button
                            className="hidden-action-btn"
                            onClick={() => {
                              onToggleHide(entry.id);
                              onSelectEntry(entry.id);
                              onSetSettingsOpen(false);
                            }}
                          >
                            Show
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
          <PlusIcon /> New entry
        </button>
      </div>

      <div className="entries-list">
        {loading ? (
          <div className="entries-empty">Loading entries...</div>
        ) : visibleEntries.length === 0 ? (
          <div className="entries-empty">No entries yet.<br />Start with a new entry.</div>
        ) : (
          visibleEntries.map((entry) => (
            <div
              key={entry.id}
              className={`entry-item${activeId === entry.id ? " active" : ""}`}
              onClick={() => onSelectEntry(entry.id)}
            >
              <div className="entry-item-info">
                <div className="entry-item-title">{entry.title || "Untitled"}</div>
                <div className="entry-item-date">{formatDate(entry.updatedAt)}</div>
              </div>
              <div className="entry-actions">
                <button
                  className="entry-action-btn hide-btn"
                  title="Hide"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onToggleHide(entry.id);
                  }}
                >
                  <EyeOffIcon />
                </button>
                <button
                  className="entry-action-btn delete-btn"
                  title="Delete"
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

      {showStats && <Statistics entries={entries} />}
    </aside>
  );
}
