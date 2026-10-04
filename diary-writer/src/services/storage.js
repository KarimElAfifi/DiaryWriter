const USERS_KEY = "diary_users";
const SESSION_KEY = "diary_session";
const STORAGE_KEY = "diary_entries";
const BG_KEY = "diary_bg";
const THEME_KEY = "diary_dark_mode";

const getValue = async (key) => {
  if (window.storage) {
    const res = await window.storage.get(key);
    return res?.value || null;
  }

  return window.localStorage.getItem(key);
};

const setValue = async (key, value) => {
  if (window.storage) {
    await window.storage.set(key, value);
    return;
  }

  window.localStorage.setItem(key, value);
};

const userKey = (baseKey, userId) => `${baseKey}_${userId}`;

const toHex = (buffer) =>
  [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hashPassword = async (password, salt) => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const loadUsers = async () => {
  try {
    const rawUsers = await getValue(USERS_KEY);
    return rawUsers ? JSON.parse(rawUsers) : [];
  } catch {
    return [];
  }
};

const saveUsers = async (users) => {
  await setValue(USERS_KEY, JSON.stringify(users));
};

export const loadSession = async () => {
  try {
    const rawSession = await getValue(SESSION_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
};

export const clearSession = async () => {
  try {
    await setValue(SESSION_KEY, "");
  } catch {
    // Session clearing is best-effort for local storage fallback.
  }
};

export const registerUser = async (username, password) => {
  const cleanUsername = username.trim();

  if (!cleanUsername || !password) {
    return { ok: false, error: "Please enter a username and password." };
  }

  const users = await loadUsers();
  const normalizedUsername = cleanUsername.toLowerCase();
  const exists = users.some(
    (user) => user.username.toLowerCase() === normalizedUsername
  );

  if (exists) {
    return { ok: false, error: "This username already exists." };
  }

  const salt = crypto.randomUUID();
  const user = {
    id: crypto.randomUUID(),
    username: cleanUsername,
    passwordHash: await hashPassword(password, salt),
    salt,
    createdAt: new Date().toISOString(),
  };

  await saveUsers([...users, user]);

  const session = { userId: user.id, username: user.username };
  await setValue(SESSION_KEY, JSON.stringify(session));

  return { ok: true, user: session };
};

export const loginUser = async (username, password) => {
  const cleanUsername = username.trim();

  if (!cleanUsername || !password) {
    return { ok: false, error: "Please enter a username and password." };
  }

  const users = await loadUsers();
  const user = users.find(
    (item) => item.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (!user) {
    return { ok: false, error: "Incorrect username or password." };
  }

  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: "Incorrect username or password." };
  }

  const session = { userId: user.id, username: user.username };
  await setValue(SESSION_KEY, JSON.stringify(session));

  return { ok: true, user: session };
};

export const loadEntries = async (userId) => {
  try {
    const rawEntries = await getValue(userKey(STORAGE_KEY, userId));
    return rawEntries ? JSON.parse(rawEntries) : [];
  } catch {
    return [];
  }
};

export const saveEntries = async (userId, entries) => {
  try {
    await setValue(userKey(STORAGE_KEY, userId), JSON.stringify(entries));
  } catch (e) {
    console.error("Save failed", e);
  }
};

export const loadBg = async (userId) => {
  try {
    return await getValue(userKey(BG_KEY, userId));
  } catch {
    return null;
  }
};

export const saveBg = async (userId, val) => {
  try {
    await setValue(userKey(BG_KEY, userId), val || "");
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
