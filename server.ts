import express from "express";
import { createServer as createViteServer } from "vite";
import { Server as SocketServer } from "socket.io";
import { createServer as createHttpServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "socialclub-nightlife-secret-2026";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// ─── IN-MEMORY DATABASE ───────────────────────────────────────────────────────
interface User {
  id: string; name: string; email: string; handle: string;
  password: string; avatar: string; bio: string;
  followersCount: number; friendsCount: number; clubsVisited: number;
  favoriteDJs: string[]; soundList: string[]; createdAt: string;
}

interface Story {
  id: string; userId: string; userName: string; userAvatar: string;
  content: string; timestamp: string; isLive?: boolean; expiresAt: number;
}

interface Event {
  id: string; clubId: string; clubName: string; title: string;
  date: string; image: string; price: number; djs: string[];
  guestListOpen: boolean; category: string; totalAttending: number;
  description?: string; city?: string;
}

interface Message {
  id: string; senderId: string; senderName: string; senderAvatar: string;
  text: string; room: string; timestamp: number; expiresAt: number;
}

interface Notification {
  id: string; userId: string; type: string;
  message: string; read: boolean; createdAt: string;
}

const db = {
  users: [] as User[],
  stories: [
    { id: "s1", userId: "u_system", userName: "L'Arc Paris", userAvatar: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=150", content: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=1400&fit=crop", timestamp: new Date().toISOString(), isLive: true, expiresAt: Date.now() + 86400000 },
    { id: "s2", userId: "u_system2", userName: "Phantom Paris", userAvatar: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=150", content: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=1400&fit=crop", timestamp: new Date().toISOString(), isLive: false, expiresAt: Date.now() + 86400000 },
    { id: "s3", userId: "u_system3", userName: "Keinemusik", userAvatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150", content: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=1400&fit=crop", timestamp: new Date().toISOString(), isLive: true, expiresAt: Date.now() + 86400000 },
  ] as Story[],
  events: [
    { id: "e1", clubId: "larc-paris", clubName: "L'Arc Paris", title: "Solomun • LIVE SET", date: "Tonight • 23:00", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=800&fit=crop", price: 30, djs: ["Solomun", "Monolink"], guestListOpen: true, category: "Melodic Techno", totalAttending: 1200, city: "Paris", description: "Une nuit inédite avec Solomun en live set exclusif au cœur de Paris." },
    { id: "e2", clubId: "phantom-paris", clubName: "Phantom", title: "Charlotte de Witte • CLOSING", date: "Saturday • 00:00", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600&h=800&fit=crop", price: 25, djs: ["Charlotte de Witte", "Alignment"], guestListOpen: false, category: "Techno", totalAttending: 4200, city: "Paris", description: "Le closing légendaire sous la Accor Arena." },
    { id: "e3", clubId: "brooklyn-mirage", clubName: "Brooklyn Mirage", title: "Keinemusik • NY Takeover", date: "Tonight • 22:00", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=800&fit=crop", price: 120, djs: ["&ME", "Rampa", "Adam Port"], guestListOpen: false, category: "House", totalAttending: 8000, city: "New York", description: "Le collectif berlinois Keinemusik prend d'assaut Brooklyn." },
    { id: "e4", clubId: "hi-ibiza", clubName: "Hï Ibiza", title: "Fisher • Tuesdays", date: "Tonight • 23:59", image: "https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=600&h=800&fit=crop", price: 80, djs: ["Fisher", "Vintage Culture"], guestListOpen: false, category: "House", totalAttending: 6000, city: "Ibiza", description: "La nuit Fisher qui fait danser toute l'île." },
    { id: "e5", clubId: "berghain-berlin", clubName: "Berghain", title: "Ben Klock • All Night Long", date: "Saturday • 00:00", image: "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600&h=800&fit=crop", price: 20, djs: ["Ben Klock", "Marcel Dettmann"], guestListOpen: false, category: "Techno", totalAttending: 1500, city: "Berlin", description: "La messe techno du dimanche matin à Kreuzberg." },
    { id: "e6", clubId: "white-dubai", clubName: "White Dubai", title: "David Guetta • Residency", date: "Friday • 22:00", image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&h=800&fit=crop", price: 150, djs: ["David Guetta", "Martin Garrix"], guestListOpen: true, category: "Open Format", totalAttending: 3000, city: "Dubai", description: "La résidence légendaire sur le rooftop de Meydan." },
  ] as Event[],
  messages: [] as Message[],
  notifications: [] as Notification[],
  likes: new Map<string, Set<string>>(),
  bookmarks: new Map<string, Set<string>>(),
  guestlists: new Map<string, Set<string>>(),
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const signToken = (userId: string) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Non authentifié" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
};

const optionalAuth = (req: any, res: any, next: any) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
    } catch { /* not authed */ }
  }
  next();
};

// Clean expired stories every hour
setInterval(() => {
  db.stories = db.stories.filter(s => s.expiresAt > Date.now());
}, 3600000);

// ─── CLAUDE AI HELPER ─────────────────────────────────────────────────────────
const callClaude = async (systemPrompt: string, userMessage: string, maxTokens = 800) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json() as any;
  return data.content[0].text as string;
};

// ─── MULTER STORAGE ───────────────────────────────────────────────────────────
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, `${generateId()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ─── SERVER INIT ──────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new SocketServer(httpServer, {
    cors: { origin: "*", credentials: true },
  });

  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static("uploads"));

  // ─── AUTH ROUTES ────────────────────────────────────────────────────────────

  app.post("/api/auth/register", (req: any, res) => {
    const { name, email, password, handle } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Champs requis manquants" });
    if (db.users.find(u => u.email === email)) return res.status(409).json({ error: "Email déjà utilisé" });
    if (handle && db.users.find(u => u.handle === handle)) return res.status(409).json({ error: "Handle déjà pris" });

    const user: User = {
      id: generateId(), name, email, password,
      handle: handle || `@${name.toLowerCase().replace(/\s/g, "_")}`,
      avatar: `https://api.dicebear.com/8.x/notionists/svg?seed=${email}&backgroundColor=1a1a2e`,
      bio: "Nightlife enthusiast 🎧",
      followersCount: 0, friendsCount: 0, clubsVisited: 0,
      favoriteDJs: [], soundList: [],
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    const token = signToken(user.id);
    res.cookie("token", token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  });

  app.post("/api/auth/login", (req: any, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    const token = signToken(user.id);
    res.cookie("token", token, { httpOnly: true, maxAge: 30 * 24 * 3600 * 1000 });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  });

  app.post("/api/auth/logout", (req: any, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", authMiddleware, (req: any, res) => {
    const user = db.users.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // ─── USER ROUTES ────────────────────────────────────────────────────────────

  app.patch("/api/users/me", authMiddleware, upload.single("avatar"), (req: any, res) => {
    const user = db.users.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    const { name, bio, handle, favoriteDJs, soundList } = req.body;
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (handle) user.handle = handle;
    if (favoriteDJs) user.favoriteDJs = Array.isArray(favoriteDJs) ? favoriteDJs : JSON.parse(favoriteDJs);
    if (soundList) user.soundList = Array.isArray(soundList) ? soundList : JSON.parse(soundList);
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/users/:id", optionalAuth, (req: any, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // ─── EVENTS ROUTES ──────────────────────────────────────────────────────────

  app.get("/api/events", optionalAuth, (req: any, res) => {
    const { city, category, search } = req.query as any;
    let events = [...db.events];
    if (city) events = events.filter(e => e.city?.toLowerCase() === city.toLowerCase());
    if (category) events = events.filter(e => e.category?.toLowerCase() === category.toLowerCase());
    if (search) events = events.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.clubName.toLowerCase().includes(search.toLowerCase()) ||
      e.djs?.some(dj => dj.toLowerCase().includes(search.toLowerCase()))
    );
    const userId = req.userId;
    const withLikes = events.map(e => ({
      ...e,
      likesCount: db.likes.get(e.id)?.size || 0,
      isLiked: userId ? (db.likes.get(e.id)?.has(userId) || false) : false,
      isBookmarked: userId ? (db.bookmarks.get(e.id)?.has(userId) || false) : false,
      isOnGuestlist: userId ? (db.guestlists.get(e.id)?.has(userId) || false) : false,
    }));
    res.json(withLikes);
  });

  app.get("/api/events/:id", optionalAuth, (req: any, res) => {
    const event = db.events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: "Event introuvable" });
    res.json({
      ...event,
      likesCount: db.likes.get(event.id)?.size || 0,
      isLiked: req.userId ? (db.likes.get(event.id)?.has(req.userId) || false) : false,
    });
  });

  app.post("/api/events/:id/like", authMiddleware, (req: any, res) => {
    const event = db.events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: "Event introuvable" });
    if (!db.likes.has(event.id)) db.likes.set(event.id, new Set());
    const likes = db.likes.get(event.id)!;
    const wasLiked = likes.has(req.userId);
    wasLiked ? likes.delete(req.userId) : likes.add(req.userId);
    res.json({ liked: !wasLiked, count: likes.size });
  });

  app.post("/api/events/:id/bookmark", authMiddleware, (req: any, res) => {
    const event = db.events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: "Event introuvable" });
    if (!db.bookmarks.has(event.id)) db.bookmarks.set(event.id, new Set());
    const bookmarks = db.bookmarks.get(event.id)!;
    const wasBookmarked = bookmarks.has(req.userId);
    wasBookmarked ? bookmarks.delete(req.userId) : bookmarks.add(req.userId);
    res.json({ bookmarked: !wasBookmarked });
  });

  app.post("/api/events/:id/guestlist", authMiddleware, (req: any, res) => {
    const event = db.events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: "Event introuvable" });
    if (!event.guestListOpen) return res.status(403).json({ error: "Guestlist fermée" });
    if (!db.guestlists.has(event.id)) db.guestlists.set(event.id, new Set());
    const list = db.guestlists.get(event.id)!;
    if (list.has(req.userId)) return res.status(409).json({ error: "Déjà inscrit" });
    list.add(req.userId);
    event.totalAttending = (event.totalAttending || 0) + 1;
    res.json({ success: true, message: "Inscription confirmée!" });
  });

  // ─── STORIES ROUTES ─────────────────────────────────────────────────────────

  app.get("/api/stories", optionalAuth, (req: any, res) => {
    const active = db.stories.filter(s => s.expiresAt > Date.now());
    res.json(active);
  });

  app.post("/api/stories", authMiddleware, upload.single("file"), (req: any, res) => {
    const user = db.users.find(u => u.id === req.userId);
    const story: Story = {
      id: generateId(),
      userId: req.userId,
      userName: user?.name || "Unknown",
      userAvatar: user?.avatar || "",
      content: req.file ? `/uploads/${req.file.filename}` : (req.body.url || ""),
      timestamp: new Date().toISOString(),
      isLive: req.body.isLive === "true",
      expiresAt: Date.now() + 24 * 3600 * 1000,
    };
    db.stories.unshift(story);
    io.emit("new_story", story);
    if (user) user.clubsVisited = (user.clubsVisited || 0) + 1;
    res.json(story);
  });

  app.delete("/api/stories/:id", authMiddleware, (req: any, res) => {
    const idx = db.stories.findIndex(s => s.id === req.params.id && s.userId === req.userId);
    if (idx === -1) return res.status(404).json({ error: "Story introuvable" });
    db.stories.splice(idx, 1);
    res.json({ success: true });
  });

  // ─── CLUBS ROUTES ───────────────────────────────────────────────────────────
  const CLUBS_DATA = [
    { id: "larc-paris", name: "L'Arc Paris", city: "Paris", logo: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=100", coverImage: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800", lat: 48.8738, lng: 2.2950, description: "Le club le plus exclusif face à l'Arc de Triomphe.", rating: 5.0, brandColor: "#fbbf24", vibe: "Chic", activityLevel: 96 },
    { id: "phantom-paris", name: "Phantom", city: "Paris", logo: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=100", coverImage: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800", lat: 48.8385, lng: 2.3785, description: "Expérience immersive sous l'Accor Arena.", rating: 4.8, brandColor: "#ffffff", vibe: "Techno", activityLevel: 99 },
    { id: "raspoutine-paris", name: "Raspoutine", city: "Paris", logo: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=100", coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800", lat: 48.8694, lng: 2.3015, description: "Cabaret russe transformé en sanctuaire deep house.", rating: 4.9, brandColor: "#be123c", vibe: "House", activityLevel: 85 },
    { id: "hi-ibiza", name: "Hï Ibiza", city: "Ibiza", logo: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=100", coverImage: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800", lat: 38.8856, lng: 1.4035, description: "Club #1 mondial. Expérience sensorielle ultime.", rating: 5.0, brandColor: "#8b5cf6", vibe: "Techno", activityLevel: 100 },
    { id: "ushuaia-ibiza", name: "Ushuaïa Ibiza", city: "Ibiza", logo: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=100", coverImage: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800", lat: 38.8876, lng: 1.4036, description: "Club open-air iconique en journée.", rating: 4.9, brandColor: "#ef4444", vibe: "House", activityLevel: 97 },
    { id: "dc10-ibiza", name: "DC-10", city: "Ibiza", logo: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100", coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", lat: 38.8778, lng: 1.3705, description: "Le cœur underground d'Ibiza.", rating: 4.9, brandColor: "#000000", vibe: "Techno", activityLevel: 94 },
    { id: "berghain-berlin", name: "Berghain", city: "Berlin", logo: "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=100", coverImage: "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=800", lat: 52.5112, lng: 13.4431, description: "Le temple techno le plus exclusif au monde.", rating: 5.0, brandColor: "#1a1a1a", vibe: "Techno", activityLevel: 100 },
    { id: "brooklyn-mirage", name: "Brooklyn Mirage", city: "New York", logo: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100", coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", lat: 40.7107, lng: -73.9344, description: "Sanctuaire multi-niveaux en plein air.", rating: 5.0, brandColor: "#000000", vibe: "Techno", activityLevel: 100 },
    { id: "white-dubai", name: "White Dubai", city: "Dubai", logo: "https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=100", coverImage: "https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=800", lat: 25.1585, lng: 55.3121, description: "Premier rooftop hi-tech à Meydan Racecourse.", rating: 4.9, brandColor: "#ffffff", vibe: "House", activityLevel: 92 },
    { id: "marquee-ny", name: "Marquee New York", city: "New York", logo: "https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=100", coverImage: "https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=800", lat: 40.7505, lng: -74.0040, description: "Cathédrale légendaire multi-niveaux.", rating: 4.8, brandColor: "#ef4444", vibe: "House", activityLevel: 88 },
  ];

  app.get("/api/clubs", (req: any, res) => {
    const { city, vibe } = req.query as any;
    let clubs = [...CLUBS_DATA];
    if (city) clubs = clubs.filter(c => c.city.toLowerCase() === city.toLowerCase());
    if (vibe) clubs = clubs.filter(c => c.vibe?.toLowerCase() === vibe.toLowerCase());
    res.json(clubs);
  });

  app.get("/api/clubs/:id", (req: any, res) => {
    const club = CLUBS_DATA.find(c => c.id === req.params.id);
    if (!club) return res.status(404).json({ error: "Club introuvable" });
    const events = db.events.filter(e => e.clubId === req.params.id);
    res.json({ ...club, upcomingEvents: events });
  });

  // ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

  app.get("/api/notifications", authMiddleware, (req: any, res) => {
    const notifs = db.notifications.filter(n => n.userId === req.userId);
    res.json(notifs.reverse());
  });

  app.patch("/api/notifications/read-all", authMiddleware, (req: any, res) => {
    db.notifications.filter(n => n.userId === req.userId).forEach(n => { n.read = true; });
    res.json({ success: true });
  });

  // ─── AI NIGHT SCOUT ─────────────────────────────────────────────────────────

  app.post("/api/ai/night-scout", async (req: any, res) => {
    const { city, query } = req.body;
    if (!city) return res.status(400).json({ error: "City requis" });
    try {
      const systemPrompt = `Tu es Night Scout, un expert IA de la nightlife mondiale.
Tu connais parfaitement les clubs underground, les événements techno/house/hip-hop dans toutes les grandes villes.
Tu donnes des recommandations précises, avec un ton expert, mystérieux et passionné de la nuit.
Réponds toujours en JSON valide uniquement, sans markdown.`;

      const userMessage = `Donne-moi les meilleures soirées à ${city} pour le style: "${query || "techno house underground"}".
Invente des événements réalistes avec: title, venue, address, date, price, url (vers un site fictif), flyer (URL unsplash d'une photo de club sombre), djs.
Génère exactement 3 événements + un summary expert de la scène à ${city}.
Format JSON: { "summary": "...", "events": [{ "title": "...", "venue": "...", "address": "...", "date": "...", "price": "...", "url": "...", "flyer": "https://images.unsplash.com/photo-...", "djs": ["..."] }] }`;

      const text = await callClaude(systemPrompt, userMessage, 1000);
      const cleaned = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleaned);
      res.json(data);
    } catch (err) {
      console.error("AI error:", err);
      res.status(500).json({ error: "AI indisponible", details: String(err) });
    }
  });

  app.post("/api/ai/vibe-tip", async (req: any, res) => {
    const { vibe } = req.body;
    try {
      const text = await callClaude(
        "Tu es un expert de la nightlife mondiale. Tu génères des accroches courtes, mystérieuses et électrisantes pour des soirées.",
        `Crée une phrase d'accroche courte et percutante (max 2 phrases) pour une soirée: "${vibe || "techno underground"}". Ton: mystérieux, électrisant, poétique.`,
        150
      );
      res.json({ tip: text.trim() });
    } catch (err) {
      res.json({ tip: "La nuit ne fait que commencer. Laissez-vous absorber." });
    }
  });

  app.post("/api/ai/map-search", async (req: any, res) => {
    const { query, city } = req.body;
    try {
      const systemPrompt = "Tu es un expert de géolocalisation de clubs et venues nocturnes. Réponds uniquement en JSON valide.";
      const userMessage = `Trouve 4 clubs/venues pour "${query}" à ${city || "Paris"}.
Format JSON: { "places": [{ "name": "...", "lat": 0.0, "lng": 0.0, "description": "...", "address": "..." }] }
Utilise des coordonnées GPS précises et réalistes.`;
      const text = await callClaude(systemPrompt, userMessage, 600);
      const cleaned = text.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (err) {
      res.status(500).json({ error: "Recherche AI indisponible" });
    }
  });

  // ─── UPLOAD MEDIA ───────────────────────────────────────────────────────────

  app.post("/api/upload", authMiddleware, upload.single("file"), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier" });
    res.json({ url: `/uploads/${req.file.filename}` });
  });

  // ─── SOCKET.IO REAL-TIME ────────────────────────────────────────────────────

  io.on("connection", (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);
    let currentUserId: string | null = null;

    socket.on("authenticate", (token: string) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        currentUserId = decoded.userId;
        socket.data.userId = decoded.userId;
        socket.emit("authenticated", { userId: decoded.userId });
      } catch { socket.emit("auth_error"); }
    });

    socket.on("join_chat", (room: string) => {
      socket.join(room);
      socket.emit("joined", { room });
    });

    socket.on("leave_chat", (room: string) => {
      socket.leave(room);
    });

    socket.on("send_message", (data: { text: string; room: string; senderName?: string; senderAvatar?: string }) => {
      const userId = socket.data.userId || "anonymous";
      const user = db.users.find(u => u.id === userId);
      const message: Message = {
        id: generateId(),
        senderId: userId,
        senderName: data.senderName || user?.name || "Anonymous",
        senderAvatar: user?.avatar || `https://api.dicebear.com/8.x/notionists/svg?seed=${userId}`,
        text: data.text,
        room: data.room || "global",
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 3600 * 1000,
      };
      db.messages.push(message);
      // Keep only last 500 messages
      if (db.messages.length > 500) db.messages = db.messages.slice(-500);
      io.to(message.room).emit("new_message", message);
    });

    socket.on("typing", (data: { room: string; userName: string }) => {
      socket.to(data.room).emit("user_typing", { userName: data.userName, room: data.room });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
    });
  });

  // ─── VITE DEV / PROD ────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🌙 Social Club running on http://localhost:${PORT}`);
  });
}

startServer();
