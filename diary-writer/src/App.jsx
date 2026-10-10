import { useEffect, useRef, useState } from "react";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal.jsx";
import { Editor } from "./components/Editor.jsx";
import { LockScreen } from "./components/LockScreen.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import {
  loadEntries,
  loadSession,
  loginUser,
  loadPreferences,
  logoutUser,
  registerUser,
  savePreferences,
  saveEntries,
} from "./services/storage.js";
import "./styles/diary.css";
import { newEntry } from "./utils/diary.js";

export default function DiaryWriter() {
  const [unlocked, setUnlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [authError, setAuthError] = useState("");
  const [entries, setEntries] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bgUrl, setBgUrl] = useState(null);
  const [saved, setSaved] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [appError, setAppError] = useState("");

  const settingsRef = useRef(null);
  const bgFileRef = useRef(null);
  const titleRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await loadSession();
        if (!session?.userId) return;

        setCurrentUser(session);
        setUnlocked(true);
      } catch (error) {
        setAuthError(error.message);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (!unlocked || !currentUser) return;

    const loadDiary = async () => {
      setLoading(true);
      try {
        const [storedEntries, preferences] = await Promise.all([
          loadEntries(),
          loadPreferences(),
        ]);
        setEntries(storedEntries);
        setBgUrl(preferences.background || null);
        setDarkMode(preferences.darkMode);
        setActiveId(storedEntries[0]?.id || null);
        setAppError("");
      } catch (error) {
        setAppError(`Could not load your diary: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadDiary();
  }, [currentUser, unlocked]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    return () => document.body.classList.remove("dark-mode");
  }, [darkMode]);

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeEntry = entries.find((entry) => entry.id === activeId) || null;
  const visibleEntries = entries.filter((entry) => !entry.hidden);
  const hiddenEntries = entries.filter((entry) => entry.hidden);
  const deleteEntryTarget = entries.find((entry) => entry.id === deleteTarget) || null;

  const handleAuth = async () => {
    setAuthError("");
    setPwError(false);

    let result;
    try {
      result =
        authMode === "register"
          ? await registerUser(username, password)
          : await loginUser(username, password);
    } catch (error) {
      setAuthError(`Could not connect to the server: ${error.message}`);
      return;
    }

    if (result.ok) {
      setCurrentUser(result.user);
      setUnlocked(true);
      setPassword("");
      return;
    }

    setAuthError(result.error);
    setPwError(true);
    setTimeout(() => setPwError(false), 600);
  };

  const updateEntry = (id, patch) => {
    setEntries((prev) => {
      const next = prev.map((entry) =>
        entry.id === id
          ? { ...entry, ...patch, updatedAt: new Date().toISOString() }
          : entry
      );

      setSaved(false);
      setSaveError(false);
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        if (!currentUser) return;
        try {
          await saveEntries(next);
          setSaved(true);
          setSaveError(false);
          setAppError("");
        } catch (error) {
          setSaveError(true);
          setAppError(`Could not save your entry: ${error.message}`);
        }
      }, 800);

      return next;
    });
  };

  const createEntry = () => {
    const entry = newEntry();

    setEntries((prev) => {
      const next = [entry, ...prev];
      if (currentUser) {
        saveEntries(next).catch((error) =>
          setAppError(`Could not save your entry: ${error.message}`)
        );
      }
      return next;
    });

    setActiveId(entry.id);
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const deleteEntry = (id) => {
    setEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      if (currentUser) {
        saveEntries(next).catch((error) =>
          setAppError(`Could not save your entry: ${error.message}`)
        );
      }
      return next;
    });

    if (activeId === id) {
      setActiveId(visibleEntries.find((entry) => entry.id !== id)?.id || null);
    }

    setDeleteTarget(null);
  };

  const toggleHide = (id) => {
    const entry = entries.find((item) => item.id === id);
    if (!entry) return;

    updateEntry(id, { hidden: !entry.hidden });
    if (activeId === id) setActiveId(null);
  };

  const handleBgFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      setBgUrl(url);
      if (currentUser) {
        savePreferences({ background: url }).catch((error) =>
          setAppError(`Could not save your settings: ${error.message}`)
        );
      }
    };
    reader.readAsDataURL(file);
    setSettingsOpen(false);
  };

  const resetBg = () => {
    setBgUrl(null);
    if (currentUser) {
      savePreferences({ background: "" }).catch((error) =>
        setAppError(`Could not save your settings: ${error.message}`)
      );
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    savePreferences({ darkMode: next }).catch((error) =>
      setAppError(`Could not save your settings: ${error.message}`)
    );
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setUnlocked(false);
      setEntries([]);
      setActiveId(null);
      setPassword("");
      setAppError("");
      clearTimeout(saveTimerRef.current);
    } catch (error) {
      setAppError(`Could not sign out: ${error.message}`);
    }
  };

  if (!unlocked) {
    return (
      <LockScreen
        authError={authError}
        authMode={authMode}
        password={password}
        pwError={pwError}
        username={username}
        onAuthModeChange={setAuthMode}
        onPasswordChange={setPassword}
        onSubmit={handleAuth}
        onUsernameChange={setUsername}
      />
    );
  }

  return (
    <>
      {bgUrl && (
        <>
          <div className="app-bg" style={{ backgroundImage: `url(${bgUrl})` }} />
          <div className="app-bg-overlay" />
        </>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          entry={deleteEntryTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteEntry(deleteTarget)}
        />
      )}

      <div className="app">
        {appError && <div className="app-error" role="alert">{appError}</div>}
        <Sidebar
          activeId={activeId}
          bgFileRef={bgFileRef}
          bgUrl={bgUrl}
          darkMode={darkMode}
          entries={entries}
          currentUser={currentUser}
          hiddenEntries={hiddenEntries}
          loading={loading}
          settingsOpen={settingsOpen}
          settingsRef={settingsRef}
          visibleEntries={visibleEntries}
          onCreateEntry={createEntry}
          onDeleteEntry={setDeleteTarget}
          onHandleBgFile={handleBgFile}
          onLogout={handleLogout}
          onResetBg={resetBg}
          onSelectEntry={setActiveId}
          onSetSettingsOpen={setSettingsOpen}
          onToggleDarkMode={toggleDarkMode}
          onToggleHide={toggleHide}
        />

        <Editor
          activeEntry={activeEntry}
          saved={saved}
          saveError={saveError}
          titleRef={titleRef}
          onCreateEntry={createEntry}
          onUpdateEntry={updateEntry}
          username={currentUser?.username}
        />
      </div>
    </>
  );
}
