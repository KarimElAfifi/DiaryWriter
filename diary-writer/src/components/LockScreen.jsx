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
      <h1 className="lock-title">My Diary</h1>
      <p className="lock-subtitle">Your Private Area - Let your thoughts rest</p>
      <div className="lock-form">
        <div className="lock-tabs" role="tablist" aria-label="Sign in">
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
            Sign up
          </button>
        </div>
        <input
          className={`lock-input${pwError ? " error" : ""}`}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          autoFocus
        />
        <input
          className={`lock-input${pwError ? " error" : ""}`}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <button className="lock-btn" onClick={onSubmit}>
          {isRegistering ? "Create account" : "Sign in"}
        </button>
        {authError && <span className="lock-error">{authError}</span>}
        <span className="lock-hint">
          {isRegistering
            ? "Your account and diary entries are being saved."
            : "Sign in to your account."}
        </span>
      </div>
    </div>
  );
}
