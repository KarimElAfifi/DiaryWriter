const API_BASE = "/api";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const csrfToken = () => {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("csrftoken="));
  return cookie ? decodeURIComponent(cookie.slice("csrftoken=".length)) : "";
};

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD", "OPTIONS"].includes(options.method || "GET")) {
    headers.set("X-CSRFToken", csrfToken());
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || `Request failed (${response.status}).`, response.status);
  }

  return data;
};

export const loadSession = async () => {
  await request("/csrf");
  try {
    const data = await request("/auth/session");
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

const authenticate = async (path, username, password) => {
  if (!username.trim() || !password) {
    return { ok: false, error: "Please enter a username and password." };
  }

  try {
    const data = await request(path, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    return { ok: true, user: data.user };
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
};

export const registerUser = (username, password) =>
  authenticate("/auth/register", username, password);

export const loginUser = (username, password) =>
  authenticate("/auth/login", username, password);

export const logoutUser = () => request("/auth/logout", { method: "POST" });

export const loadEntries = async () => {
  const data = await request("/entries");
  return data.entries;
};

export const saveEntries = (entries) =>
  request("/entries", {
    method: "PUT",
    body: JSON.stringify({ entries }),
  });

export const loadPreferences = async () => {
  const data = await request("/preferences");
  return data.preferences;
};

export const savePreferences = (preferences) =>
  request("/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
