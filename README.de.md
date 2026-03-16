# 🐳 Docker Manager Web-Interface

[Deutsch](README.de.md) | [English](README.md) | [Español](README.es.md) | [Français](README.fr.md) | [Українська](README.uk.md) | [Русский](README.ru.md) | [日本語](README.ja.md) | [中文](README.zh.md)

Ein leistungsstarkes, modernes und futuristisches Web-Interface zur Verwaltung deiner lokalen Docker-Umgebung. Gebaut mit Next.js, Tailwind CSS (Glassmorphismus-Design) und Shadcn UI.

![Dashboard Preview](docs/dashboard.png)

## ✨ Features

- **Futuristisches UI:** Komplett im "Glassmorphismus"-Stil gehalten, unterstützt sowohl Dark- als auch Light-Mode mit fließenden Mesh-Gradients als Hintergrund.
- **🌍 Mehrsprachigkeit (i18n):** Das Interface ist vollständig in **8 Sprachen** verfügbar: Deutsch, Englisch, Spanisch, Französisch, Ukrainisch, Russisch, Japanisch und Chinesisch (Vereinfacht).
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

Die Anwendung ist offiziell **Docker-Ready** und liefert alles mit, was du brauchst (inklusive Alpine Linux, Docker-CLI und Node.js Server). Du brauchst auf deinem Host-System also nicht einmal mehr Node.js zu installieren!

### Variante 1: Fertiges Docker-Image (Einfachste Methode – Empfohlen)

Lade das fertige Image direkt aus der GitHub Container Registry:

```bash
docker pull ghcr.io/codenotiz/docker-manager:latest
```

Oder nutze die mitgelieferte **`docker-compose.yml`**, die das Image automatisch herunterlädt und startet:

```bash
# 1. docker-compose.yml herunterladen (oder Repository klonen)
# 2. Container im Hintergrund starten
docker compose up -d
```
Die App ist nun unter **`http://localhost:3000`** erreichbar.

### Variante 2: Selbst bauen via Docker Compose

Nutze die mitgelieferte `docker-compose.build.yml`, um das Image lokal zu bauen. Das Repository muss zuerst geklont werden.

```bash
# 1. Repository klonen
git clone https://github.com/CodeNotiz/docker-manager.git
cd docker-manager

# 2. Container im Hintergrund bauen und starten
docker compose -f docker-compose.build.yml up -d --build
```
Die App ist nun unter **`http://localhost:3000`** erreichbar.

### Variante 3: Klassisches Setup via Node.js (Für Entwicklung)

Voraussetzung: Node.js (v18+) und Docker sind auf dem Host installiert.

```bash
npm install
npm run dev
```
Der Entwicklungsserver startet auf Port 3000. *Tipp: Beim ersten Start wird im Hintergrund automatisch der Ordner `data/` mitsamt der SQLite-Datenbank `docker-manager.db` erstellt.*

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

## 📬 Kontakt & Autor

Entwickelt von **CodeNotiz** 
- ✉️ E-Mail: info@codenotiz.de
- 🌐 GitHub: [github.com/CodeNotiz/docker-manager](https://github.com/CodeNotiz/docker-manager)

*Entwickelt mit ❤️ für eine schönere Docker-Erfahrung.*
