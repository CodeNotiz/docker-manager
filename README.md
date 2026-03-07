# 🐳 Docker Manager Web-Interface

Ein leistungsstarkes, modernes und futuristisches Web-Interface zur Verwaltung deiner lokalen Docker-Umgebung. Gebaut mit Next.js 16, Tailwind CSS (Glassmorphismus-Design) und Shadcn UI.

![Dashboard Preview](docs/placeholder-dashboard.png) *(Platzhalter für einen Screenshot)*

## ✨ Features

- **Futuristisches UI:** Komplett im "Glassmorphismus"-Stil gehalten, unterstützt sowohl Dark- als auch Light-Mode mit fließenden Mesh-Gradients als Hintergrund.
- **🔐 Integrierte Authentifizierung:** Abgesicherter Zugangsbereich. Die Anwendung generiert automatisch eine SQLite-Datenbank und erfordert einen Login via (änderbarem) Benutzernamen und Passwort. Standard-Login: `admin` / `admin`.
- **📦 Container-Management:**
  - Übersicht aller laufenden und gestoppten Container.
  - Container starten, stoppen, neustarten oder löschen.
  - **Echtzeit-Terminal (xterm.js):** Öffne eine interaktive Shell direkt im Browser mit TTY-Farbsupport.
  - **Live-Logs:** Verfolge Container-Ausgaben in Echtzeit.
- **💿 Image-Management:**
  - Auflistung aller lokaler Docker-Images.
  - Löschen einzelner Images.
  - Intelligente Bereinigung: Lösche "Dangling" (verwaiste) Images oder mit einem Klick alle unbenutzten Images auf einmal.
- **🌐 Netzwerk-Management:**
  - Übersicht über alle Docker-Netzwerke.
  - Erstellen neuer Netzwerke (Optionale Unterstützung für IPv4 und IPv6 Subnet/Gateway Config).
  - Löschen ungenutzter Netzwerke.
- **🥞 Stack-Unterstützung (Docker Compose):**
  - Integrierter Code-Editor (Monaco) für `docker-compose.yml` Dateien.
  - Separater Tab zum parallelen Pflegen von `.env`-Variablen.
  - Stacks bequem aus dem Browser heraus deployen (`docker compose up -d`) oder stoppen (`docker compose down`).

---

## 🚀 Installation & Start

### Voraussetzungen
1. Ein Linux/macOS System mit installiertem Docker (Der Daemon-Socket muss unter `/var/run/docker.sock` erreichbar sein).
2. Node.js (v18 oder neuer) und npm.

### Setup

1. **Repository klonen / Source Code herunterladen**
   Gehe in das Projektverzeichnis.

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   # oder falls legacy-peer-deps benötigt wird:
   npm install --legacy-peer-deps
   ```

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```
   *Beim ersten Start wird im Hintergrund automatisch der Ordner `data/` mitsamt der SQLite-Datenbank `docker-manager.db` erstellt.*

4. **App aufrufen**
   Öffne deinen Browser und navigiere zu: **`http://localhost:3000`**

---

## 🛡️ Authentifizierung (Login)

Die Applikation ist durch eine Edge-Middleware geschützt. Ohne gültiges JWT-Cookie ist kein Zugriff auf das Dashboard oder die API möglich.

- **Standard-Benutzername:** `admin`
- **Standard-Passwort:** `admin`

*Hinweis: Du wirst nach dem ersten Login dringend gebeten, diese Daten zu ändern!*

### Zugangsdaten ändern
Klicke in der Seitenleiste (unten links) auf **"Einstellungen"**. Dort kannst du einen neuen Benutzernamen und/oder ein neues Passwort festlegen. Du musst dein derzeitiges Passwort (anfangs `admin`) zur Bestätigung eingeben.

---

## 📁 Ordnerstruktur des Servers

Zusätzlich zum Code erzeugt der Server zur Laufzeit zwei wichtige Verzeichnisse im Root-Ordner:

- `data/docker-manager.db`: Hier liegen deine Zugangsdaten (Passwörter werden via `bcrypt` verschlüsselt gehasht).
- `stacks_data/`: Erstellst du einen Docker-Compose Stack im UI, legt das System hier einen Unterordner an. Darin findest du die zugehörige `docker-compose.yml` und eine eventuelle `.env` Datei. Diese Dateien lassen sich bei Bedarf also auch außerhalb des UIs editieren.

---

## 🛠️ Verwendeter Tech-Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Komponenten:** Shadcn UI, Radix UI, Lucide Icons
- **Terminal & Editor:** xterm.js (inkl. WebSockets für PTY), Monaco Editor (`@monaco-editor/react`)
- **Backend (API Routes):** Node.js `fs`, `child_process`, `dockerode` (Docker API Adapter)
- **Authentifizierung:** `jose` (JWT), `bcrypt`, `sqlite` / `sqlite3`

---

## 🤝 Troubleshooting

* **Terminal-Farben fehlen?**
  Stelle sicher, dass im Backend bei der PTY-Erzeugung das Environment auf `TERM: 'xterm-256color'` gesetzt ist (bereits im Code integriert).
* **Next.js Host-Warnungen (Cross-Origin)?**
  In der `next.config.ts` ist in der Regel `allowedDevOrigins` konfiguriert. Falls du die App auf einem Remote-Server entwickelst und per IP zugreifst, richte in der Konfiguration die entsprechenden IPs ein. 
* **Zugriff auf `/var/run/docker.sock` verweigert?**
  Dein ausführender Node.js Benutzer muss Mitglied in der `docker` Gruppe sein.
  Führe ggf. `sudo usermod -aG docker $USER` aus und logge dich neu ein.

---

*Entwickelt mit ❤️ für eine schönere Docker-Erfahrung.*
