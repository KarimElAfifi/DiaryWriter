const STORAGE_KEY = "diary_entries";
const BG_KEY = "diary_bg";
const THEME_KEY = "diary_dark_mode";

export const loadEntries = async () => {
  try {
    const res = await window.storage.get(STORAGE_KEY);
    return res ? JSON.parse(res.value) : [];
  } catch {
    return [];
  }
};

export const saveEntries = async (entries) => {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Save failed", e);
  }
};

export const loadBg = async () => {
  try {
    const res = await window.storage.get(BG_KEY);
    return res ? res.value : null;
  } catch {
    return null;
  }
};

export const saveBg = async (val) => {
  try {
    await window.storage.set(BG_KEY, val);
  } catch {
    // Background images are optional; storage failures should not block writing.
  }
};

export const loadDarkMode = async () => {
  try {
    if (window.storage) {
      const res = await window.storage.get(THEME_KEY);
      return res ? res.value === "true" : false;
    }
    return window.localStorage.getItem(THEME_KEY) === "true";
  } catch {
    return false;
  }
};

export const saveDarkMode = async (val) => {
  try {
    if (window.storage) {
      await window.storage.set(THEME_KEY, String(val));
      return;
    }
    window.localStorage.setItem(THEME_KEY, String(val));
  } catch {
    // Theme persistence is a convenience; keep the in-memory toggle working.
  }
};
