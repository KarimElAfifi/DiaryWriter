import { LockIcon } from "./icons.jsx";

export function LockScreen({
  password,
  pwError,
  onPasswordChange,
  onUnlock,
}) {
  return (
    <div className="lock-screen">
      <div className="lock-icon"><LockIcon /></div>
      <h1 className="lock-title">Mein Tagebuch</h1>
      <p className="lock-subtitle">Your Private Area - Let your thoughts rest</p>
      <div className="lock-form">
        <input
          className={`lock-input${pwError ? " error" : ""}`}
          type="password"
          placeholder="Passwort eingeben"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onUnlock()}
          autoFocus
        />
        <button className="lock-btn" onClick={onUnlock}>
          Öffnen
        </button>
        <span className="lock-hint">Hinweis: „tagebuch"</span>
      </div>
    </div>
  );
}
