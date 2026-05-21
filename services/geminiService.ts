
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface LiveScoutEvent {
  title: string;
  venue: string;
  address: string;
  date: string;
  price: string;
  url: string;
  flyer: string;
}

export interface NightScoutResponse {
  summary: string;
  events: LiveScoutEvent[];
}

export const getPartyRecommendation = async (vibe: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Propose moi une description accrocheuse pour une soirée clubbing sur le thème "${vibe}". Utilise un ton dynamique et mystérieux de vie nocturne. Maximum 3 phrases.`,
    });
    return response.text || "Préparez-vous pour une nuit inoubliable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "L'énergie de la nuit vous attend.";
  }
};

export const findRealtimeEvents = async (city: string, query: string = "best underground techno house parties") => {
  try {
    // Utilisation de gemini-3-flash-preview pour une vitesse d'exécution optimale
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for the absolute BEST and most trending nightlife events in ${city} matching the vibe: "${query}". 
      Look specifically at residentadvisor.net, shotgun.live, and eventbrite.com.
      
      Extract exactly: Title, Venue Name, Full Physical Address, Date/Time, Price (or Free/TBA), a Flyer Image URL (use actual flyer or a stunning clubbing high-res photo URL), and the direct Booking/Ticket URL.
      Provide a brief expert analysis of the current vibe in that city.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING, 
              description: "Brief professional analysis of the nightlife scene found." 
            },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  venue: { type: Type.STRING },
                  address: { type: Type.STRING },
                  date: { type: Type.STRING },
                  price: { type: Type.STRING },
                  flyer: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["title", "venue", "address", "date", "url", "flyer", "price"]
              }
            }
          },
          required: ["summary", "events"]
        }
      },
    });

    const data = JSON.parse(response.text || "{}");
    return data as NightScoutResponse;
  } catch (error) {
    console.error("Night Scout Search Error:", error);
    return null;
  }
};

export interface MapResult {
  name: string;
  lat: number;
  lng: number;
  description: string;
  url: string;
}

export const searchClubsOnMap = async (query: string, userLocation?: { lat: number; lng: number }) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find nightclub and party venues matching: "${query}". 
      For each venue, I need the exact latitude and longitude. 
      Respond with the list of places. 
      Format each result as: NAME | LAT | LNG | DESCRIPTION.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: userLocation ? {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            } : undefined
          }
        }
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const results: MapResult[] = [];
    const lines = text.split('\n');
    lines.forEach(line => {
      const parts = line.split('|');
      if (parts.length >= 3) {
        const name = parts[0].trim().replace(/^[*-]\s*/, "");
        const lat = parseFloat(parts[1].trim());
        const lng = parseFloat(parts[2].trim());
        const description = parts[3]?.trim() || "Lieu trouvé via GPS";
        
        if (!isNaN(lat) && !isNaN(lng)) {
          results.push({ name, lat, lng, description, url: "#" });
        }
      }
    });

    if (results.length === 0) {
      groundingChunks.forEach((chunk, index) => {
        if (chunk.maps) {
          results.push({
            name: chunk.maps.title || "Club Node",
            url: chunk.maps.uri || "#",
            lat: (userLocation?.lat || 48.8566) + (index * 0.001), 
            lng: (userLocation?.lng || 2.3522) + (index * 0.001),
            description: "Synchronisation de précision en cours..."
          });
        }
      });
    }

    return {
      text: response.text,
      places: results,
      grounding: groundingChunks
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return null;
  }
};
