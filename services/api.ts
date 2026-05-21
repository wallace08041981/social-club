// ─── API Service Layer ────────────────────────────────────────────────────────

const BASE = "";

const headers = (extra: Record<string, string> = {}) => ({
  "Content-Type": "application/json",
  ...extra,
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const register = async (name: string, email: string, password: string, handle?: string) => {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: headers(),
    credentials: "include",
    body: JSON.stringify({ name, email, password, handle }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const login = async (email: string, password: string) => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: headers(),
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

export const logout = async () => {
  await fetch(`${BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
};

export const getMe = async () => {
  const res = await fetch(`${BASE}/api/auth/me`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
};

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export const getEvents = async (filters?: { city?: string; category?: string; search?: string }) => {
  const params = new URLSearchParams(filters as any).toString();
  const res = await fetch(`${BASE}/api/events${params ? "?" + params : ""}`, { credentials: "include" });
  return res.json();
};

export const likeEvent = async (eventId: string) => {
  const res = await fetch(`${BASE}/api/events/${eventId}/like`, {
    method: "POST", credentials: "include",
  });
  return res.json();
};

export const bookmarkEvent = async (eventId: string) => {
  const res = await fetch(`${BASE}/api/events/${eventId}/bookmark`, {
    method: "POST", credentials: "include",
  });
  return res.json();
};

export const joinGuestlist = async (eventId: string) => {
  const res = await fetch(`${BASE}/api/events/${eventId}/guestlist`, {
    method: "POST", credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
};

// ─── STORIES ─────────────────────────────────────────────────────────────────

export const getStories = async () => {
  const res = await fetch(`${BASE}/api/stories`, { credentials: "include" });
  return res.json();
};

export const createStory = async (formData: FormData) => {
  const res = await fetch(`${BASE}/api/stories`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return res.json();
};

export const deleteStory = async (storyId: string) => {
  await fetch(`${BASE}/api/stories/${storyId}`, { method: "DELETE", credentials: "include" });
};

// ─── CLUBS ───────────────────────────────────────────────────────────────────

export const getClubs = async (filters?: { city?: string; vibe?: string }) => {
  const params = new URLSearchParams(filters as any).toString();
  const res = await fetch(`${BASE}/api/clubs${params ? "?" + params : ""}`, { credentials: "include" });
  return res.json();
};

export const getClub = async (id: string) => {
  const res = await fetch(`${BASE}/api/clubs/${id}`, { credentials: "include" });
  return res.json();
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const getNotifications = async () => {
  const res = await fetch(`${BASE}/api/notifications`, { credentials: "include" });
  return res.json();
};

export const markAllRead = async () => {
  await fetch(`${BASE}/api/notifications/read-all`, { method: "PATCH", credentials: "include" });
};
