# 🌙 Social Club — The Ultimate Nightlife Network

Application fullstack React + Node.js/Express + Socket.io prête à l'emploi.

## Stack technique

- **Frontend** : React 18, TypeScript, Tailwind CSS, Leaflet Maps
- **Backend** : Express 5, Socket.io (temps réel), JWT auth, Multer (uploads)
- **IA** : Claude claude-sonnet-4-20250514 (Night Scout, vibe tips, map search)
- **Temps réel** : Socket.io pour l'Ephemeral Chat

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et remplir le .env
cp .env.example .env
# → Remplis ANTHROPIC_API_KEY avec ta clé API Anthropic

# 3. Lancer en développement (backend + frontend séparés)
npm run dev          # Backend sur port 3000
npm run dev:frontend # Frontend sur port 5173 (dans un autre terminal)

# OU les deux en même temps
npm run dev:all
```

## Production

```bash
npm run build   # Build frontend
npm run start   # Sert backend + frontend compilé sur port 3000
```

## Architecture backend

### Routes API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Inscription |
| POST | /api/auth/login | — | Connexion |
| POST | /api/auth/logout | — | Déconnexion |
| GET | /api/auth/me | ✅ | Profil connecté |
| PATCH | /api/users/me | ✅ | Modifier profil |
| GET | /api/events | — | Liste événements |
| POST | /api/events/:id/like | ✅ | Liker un event |
| POST | /api/events/:id/bookmark | ✅ | Sauvegarder |
| POST | /api/events/:id/guestlist | ✅ | S'inscrire guestlist |
| GET | /api/stories | — | Stories actives |
| POST | /api/stories | ✅ | Créer une story |
| DELETE | /api/stories/:id | ✅ | Supprimer story |
| GET | /api/clubs | — | Liste clubs |
| POST | /api/ai/night-scout | — | Scan AI soirées |
| POST | /api/ai/vibe-tip | — | Accroche AI |
| POST | /api/ai/map-search | — | Recherche map AI |

### Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| authenticate | client→server | Auth JWT |
| join_chat | client→server | Rejoindre room |
| send_message | client→server | Envoyer message |
| new_message | server→client | Nouveau message |
| new_story | server→client | Nouvelle story |
| typing | client→server | Indicateur saisie |

## Variables d'environnement

```env
ANTHROPIC_API_KEY=sk-ant-...   # REQUIS - Claude AI
JWT_SECRET=...                   # Secret pour les tokens JWT
PORT=3000                        # Port serveur (défaut: 3000)
NODE_ENV=development             # development | production
```

## Note base de données

En l'état, la BDD est **in-memory** (redémarre à zéro à chaque restart).
Pour la persistance, remplacer par MongoDB ou PostgreSQL dans `server.ts`.
