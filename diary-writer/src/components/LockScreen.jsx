import { LockIcon } from "./icons.jsx";

export function LockScreen({
  authError,
  authMode,
  password,
  pwError,
  username,
  onAuthModeChange,
  onPasswordChange,
  onSubmit,
  onUsernameChange,
}) {
  const isRegistering = authMode === "register";

  return (
    <div className="lock-screen">
      <div className="lock-icon"><LockIcon /></div>
      <h1 className="lock-title">Mein Tagebuch</h1>
      <p className="lock-subtitle">Your Private Area - Let your thoughts rest</p>
      <div className="lock-form">
        <div className="lock-tabs" role="tablist" aria-label="Anmeldung">
          <button
            className={`lock-tab${!isRegistering ? " active" : ""}`}
            type="button"
            onClick={() => onAuthModeChange("login")}
          >
            Login
          </button>
          <button
            className={`lock-tab${isRegistering ? " active" : ""}`}
            type="button"
            onClick={() => onAuthModeChange("register")}
          >
            Neu
          </button>
        </div>
        <input
          className={`lock-input${pwError ? " error" : ""}`}
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          autoFocus
        />
        <input
          className={`lock-input${pwError ? " error" : ""}`}
          type="password"
          placeholder="Passwort eingeben"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <button className="lock-btn" onClick={onSubmit}>
          {isRegistering ? "Account erstellen" : "Öffnen"}
        </button>
        {authError && <span className="lock-error">{authError}</span>}
        <span className="lock-hint">
          {isRegistering
            ? "Dein Account wird lokal auf diesem Gerät gespeichert."
            : "Melde dich mit deinem Account an."}
        </span>
      </div>
    </div>
  );
}
