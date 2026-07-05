import { useEffect, useRef, useState } from "react";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal.jsx";
import { Editor } from "./components/Editor.jsx";
import { LockScreen } from "./components/LockScreen.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import {
  loadBg,
  loadDarkMode,
  loadEntries,
  saveBg,
  saveDarkMode,
  saveEntries,
} from "./services/storage.js";
import "./styles/diary.css";
import { CORRECT_PASSWORD, newEntry } from "./utils/diary.js";

export default function DiaryWriter() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [entries, setEntries] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bgUrl, setBgUrl] = useState(null);
  const [saved, setSaved] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const settingsRef = useRef(null);
  const bgFileRef = useRef(null);
  const titleRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!unlocked) return;

    const loadDiary = async () => {
      setLoading(true);
      const storedEntries = await loadEntries();
      const storedBg = await loadBg();
      const storedDarkMode = await loadDarkMode();

      setEntries(storedEntries);
      setBgUrl(storedBg);
      setDarkMode(storedDarkMode);
      setActiveId(storedEntries[0]?.id || null);
      setLoading(false);
    };

    loadDiary();
  }, [unlocked]);

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

  const handleUnlock = () => {
    if (password === CORRECT_PASSWORD) {
      setUnlocked(true);
      return;
    }

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
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await saveEntries(next);
        setSaved(true);
      }, 800);

      return next;
    });
  };

  const createEntry = () => {
    const entry = newEntry();

    setEntries((prev) => {
      const next = [entry, ...prev];
      saveEntries(next);
      return next;
    });

    setActiveId(entry.id);
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const deleteEntry = (id) => {
    setEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      saveEntries(next);
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
      saveBg(url);
    };
    reader.readAsDataURL(file);
    setSettingsOpen(false);
  };

  const resetBg = () => {
    setBgUrl(null);
    saveBg(null);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    saveDarkMode(next);
  };

  if (!unlocked) {
    return (
      <LockScreen
        password={password}
        pwError={pwError}
        onPasswordChange={setPassword}
        onUnlock={handleUnlock}
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
        <Sidebar
          activeId={activeId}
          bgFileRef={bgFileRef}
          bgUrl={bgUrl}
          darkMode={darkMode}
          hiddenEntries={hiddenEntries}
          loading={loading}
          settingsOpen={settingsOpen}
          settingsRef={settingsRef}
          visibleEntries={visibleEntries}
          onCreateEntry={createEntry}
          onDeleteEntry={setDeleteTarget}
          onHandleBgFile={handleBgFile}
          onResetBg={resetBg}
          onSelectEntry={setActiveId}
          onSetSettingsOpen={setSettingsOpen}
          onToggleDarkMode={toggleDarkMode}
          onToggleHide={toggleHide}
        />

        <Editor
          activeEntry={activeEntry}
          saved={saved}
          titleRef={titleRef}
          onCreateEntry={createEntry}
          onUpdateEntry={updateEntry}
        />
      </div>
    </>
  );
}
