// ─── Claude AI Service (replaces Gemini) ─────────────────────────────────────

export interface LiveScoutEvent {
  title: string;
  venue: string;
  address: string;
  date: string;
  price: string;
  url: string;
  flyer: string;
  djs?: string[];
}

export interface NightScoutResponse {
  summary: string;
  events: LiveScoutEvent[];
}

export interface MapResult {
  name: string;
  lat: number;
  lng: number;
  description: string;
  url: string;
  address?: string;
}

const API_BASE = "";

export const getPartyRecommendation = async (vibe: string): Promise<string> => {
  try {
    const res = await fetch(`${API_BASE}/api/ai/vibe-tip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vibe }),
    });
    const data = await res.json() as { tip: string };
    return data.tip || "La nuit ne fait que commencer.";
  } catch {
    return "L'énergie de la nuit vous attend.";
  }
};

export const findRealtimeEvents = async (city: string, query: string = "best underground techno house"): Promise<NightScoutResponse | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/ai/night-scout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, query }),
    });
    if (!res.ok) return null;
    return await res.json() as NightScoutResponse;
  } catch (err) {
    console.error("Night Scout Error:", err);
    return null;
  }
};

export const searchClubsOnMap = async (query: string, userLocation?: { lat: number; lng: number }) => {
  try {
    const city = userLocation ? undefined : "Paris";
    const res = await fetch(`${API_BASE}/api/ai/map-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, city }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { places: MapResult[] };
    return { text: "", places: data.places || [], grounding: [] };
  } catch (err) {
    console.error("Map Search Error:", err);
    return null;
  }
};
