# CLAUDE.md – Docker Manager

## Projekt-Überblick

Modernes Docker-Management-Dashboard auf Basis von Next.js und Node.js. Nutzer können Container, Images, Netzwerke und Docker-Compose-Stacks über eine Web-UI verwalten. Die App läuft als Docker-Container und kommuniziert über den Host-Docker-Socket.

**Repository:** https://github.com/CodeNotiz/docker-manager  
**Lizenz:** GPL-3.0

---

## Tech-Stack

| Bereich | Technologien |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| UI-Bibliothek | Shadcn UI (Radix UI), Lucide Icons, Monaco Editor, xterm.js |
| Backend | Custom Node.js HTTP-Server (`server.mjs`), Socket.io 4 |
| Docker-Integration | Dockerode 4 |
| Datenbank | SQLite (sqlite3 + sqlite) |
| Auth | JWT (jose), bcrypt |
| CI/CD | GitHub Actions → ghcr.io |

---

## Befehle

```bash
# Entwicklung
npm install
npm run dev              # Development-Server (node server.mjs) auf Port 3000

# Build & Produktion
npm run build            # Next.js Production-Build
npm start                # NODE_ENV=production node server.mjs

# Code-Qualität
npm run lint             # ESLint (Next.js + TypeScript Presets)

# Docker (vorgefertigtes Image)
docker compose up -d

# Docker (lokaler Build)
docker compose -f docker-compose.build.yml up -d --build
```

Playwright-Dependencies sind vorhanden (`@playwright/test`), aber es gibt **keine definierten Test-Scripts** in package.json.

---

## Projektstruktur

```
src/
├── app/
│   ├── api/              # Next.js Route Handler
│   │   ├── auth/         # login, logout, me, status
│   │   ├── containers/   # CRUD + start/stop/restart/delete/logs
│   │   ├── images/       # Image Management
│   │   ├── networks/     # Network Management
│   │   ├── stacks/       # Docker Compose Stack Management
│   │   ├── settings/     # User Credentials Update
│   │   ├── stats/        # Dashboard-Statistiken
│   │   └── templates/    # Vordefinierte Stack-Templates
│   ├── containers/[id]/  # Container-Details, Terminal, Logs
│   ├── images/, networks/, stacks/, templates/
│   ├── login/, settings/
│   └── layout.tsx        # Root Layout mit Theme/Language Provider
├── components/
│   ├── layout/           # Sidebar, Header, Footer
│   └── ui/               # Shadcn UI Komponenten
├── lib/
│   ├── docker.ts         # Dockerode Singleton (OS-aware Socket-Pfad)
│   ├── db.ts             # SQLite Init + User-Management
│   ├── logger.ts         # Zentraler Logger mit LOG_LEVEL-Support
│   └── utils.ts          # clsx + tailwind-merge
├── i18n/
│   ├── config.ts         # Locale-Definitionen
│   ├── LanguageContext.tsx
│   └── dictionaries/     # de, en, es, fr, uk, ru, ja, zh
└── proxy.ts              # Edge Middleware (JWT-Validierung)

server.mjs                # Custom Node HTTP-Server mit Socket.io
entrypoint.sh             # Docker Startup: JWT_SECRET generieren, Templates kopieren
Dockerfile                # 3-Stage Build: deps → builder → runner
docker-compose.yml        # Production (ghcr.io Image)
docker-compose.build.yml  # Lokaler Build
```

---

## Architektur-Entscheidungen

### Custom Server (`server.mjs`)
Next.js läuft nicht mit `next start`, sondern über einen eigenen Node.js-HTTP-Server, damit Socket.io auf `/api/socket` integriert werden kann. Terminal-Sessions laufen über `dockerode.exec()` + Socket.io-Streams.

### Edge Middleware (`proxy.ts`)
Alle Routen außer `/login`, `/_next/**`, `/favicon.ico` und `/api/auth/**` sind durch JWT-Validierung geschützt. Token-Ablaufzeit: 24 Stunden. Ungültige Tokens → Redirect zu `/login` oder `401`.

### Docker Socket
Dockerode erkennt das OS automatisch:
- Windows: `//./pipe/docker_engine`
- Linux/macOS: `/var/run/docker.sock`

### Datenbankpfad
SQLite-DB liegt unter `/app/data/docker-manager.db` (Docker-Volume). Standard-Login: `admin` / `admin` – muss nach dem ersten Login geändert werden.

### JWT Secret
Wird beim Container-Start von `entrypoint.sh` als 64-Zeichen-Hex generiert und in `/app/data/jwt_secret.txt` gespeichert. Überlebt Container-Neustarts durch das Volume.

---

## Environment-Variablen

| Variable | Standard | Beschreibung |
|---|---|---|
| `PORT` | `3000` | HTTP-Listener-Port |
| `HOST` | `0.0.0.0` | Bind-Adresse |
| `NODE_ENV` | – | `production` oder `development` |
| `LOG_LEVEL` | `INFO` | `DEBUG` \| `INFO` \| `WARN` \| `ERROR` \| `SILENT` |
| `COOKIE_SECURE` | `false` | Auf `true` setzen, wenn hinter HTTPS-Proxy |
| `JWT_SECRET` | (auto) | Wird durch `entrypoint.sh` generiert |
| `NEXT_TELEMETRY_DISABLED` | `1` | Next.js Telemetrie deaktiviert |

---

## CI/CD (GitHub Actions)

**Workflow:** `.github/workflows/docker-publish.yml`

**Trigger:**
- Push auf `main` → baut und veröffentlicht `latest`
- Tags `v*.*.*` → extrahiert semver-Tags (`v1`, `v1.2`, `v1.2.3`)
- Pull Requests → nur Build, kein Push

**Registry:** `ghcr.io/CodeNotiz/docker-manager`

**Tagging-Logik:**
- Semver-Tags werden automatisch aus dem Git-Tag extrahiert
- Short SHA als zusätzlicher Tag
- `latest` nur für den Default-Branch

---

## Konventionen

- **TypeScript strict mode** – keine impliziten `any`
- **Dateinamen:** kebab-case für Dateien, camelCase für Funktionen/Variablen
- **Path-Alias:** `@/*` zeigt auf `src/*`
- **API-Routen:** `src/app/api/[resource]/route.ts` (Next.js App Router)
- **Client-Komponenten** mit `"use client"` markieren, wenn React-Hooks oder Browser-APIs benötigt werden
- **Logger:** immer `src/lib/logger.ts` verwenden, nie `console.log` direkt
- **Docker-API:** nur über den Dockerode-Singleton aus `src/lib/docker.ts`

---

## Sicherheitshinweise

- `/var/run/docker.sock` gibt der App vollständigen Docker-Daemon-Zugriff – nur im vertrauenswürdigen Netz betreiben
- `COOKIE_SECURE=true` in Produktionsumgebungen hinter HTTPS setzen
- Standard-Credentials (`admin`/`admin`) sofort nach Erststart ändern
- Terminal-Shell ist auf `sh` und `bash` beschränkt (in `server.mjs`)
