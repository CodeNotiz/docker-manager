# 🐳 Docker Manager Web Interface

[Deutsch](README.de.md) | [English](README.md) | [Español](README.es.md) | [Français](README.fr.md)

A powerful, modern, and futuristic web interface for managing your local Docker environment. Built with Next.js, Tailwind CSS (Glassmorphism design), and Shadcn UI.

![Dashboard Preview](docs/dashboard.png)

## ✨ Features

- **Futuristic UI:** Designed completely in a "Glassmorphism" style, supporting both Dark and Light modes with fluid mesh gradients as backgrounds.
- **🌍 Multi-Language Support (i18n):** The interface is fully available in English, German, Spanish, and French.
- **🔐 Integrated Authentication:** Secured access area. The application automatically generates an SQLite database and requires login via a (changeable) username and password. Default login: `admin` / `admin`.
- **📦 Container Management:**
  - Overview of all running and stopped containers.
  - Start, stop, restart, or delete containers.
  - **Real-time Terminal (xterm.js):** Open an interactive shell directly in your browser with TTY color support.
  - **Live Logs:** Stream container output in real-time.
- **💿 Image Management:**
  - List of all local Docker images.
  - Delete individual images.
  - Smart Cleanup: Remove dangling or unused images with a single click.
- **🌐 Network Management:**
  - Overview of all Docker networks.
  - Create new networks (Optional support for IPv4/IPv6 Subnet/Gateway config).
  - Delete unused networks.
- **🥞 Stack Support (Docker Compose):**
  - Integrated code editor (Monaco) for `docker-compose.yml` files.
  - Separate tab for parallel maintenance of `.env` variables.
  - Easily deploy (`docker compose up -d`) or stop (`docker compose down`) stacks right from the browser.

---

## 🚀 Installation & Start

The application is officially **Docker-Ready** and includes everything you need (Alpine Linux, Docker CLI, and Node.js server). You do not even need Node.js installed on your host system!

### Option 1: Start via Docker Compose (Recommended)

A ready-to-use `docker-compose.yml` template is included. It mounts your local Docker socket (`/var/run/docker.sock`) into the container and securely mounts the SQLite database and user stacks into your file system.

```bash
# 1. Clone repository
git clone https://github.com/CodeNotiz/docker-manager.git
cd docker-manager

# 2. Build and start the container in the background
docker compose up -d --build
```
The app is now accessible at **`http://localhost:3000`**.

### Option 2: Classic Setup via Node.js (For Development)

Prerequisites: Node.js (v18+) and Docker are installed on the host.

```bash
npm install
npm run dev
```
The development server starts on port 3000. *Tip: Upon first start, the `/data` folder alongside the SQLite database `docker-manager.db` will be created automatically in the background.*

---

## 🛡️ Authentication (Login)

The application is protected by an Edge Middleware. Without a valid JWT cookie, access to the dashboard or API is blocked.

- **Default Username:** `admin`
- **Default Password:** `admin`

*Note: You will be strongly advised to change these credentials after your first login!*

### Change Credentials
Click on **"Settings"** in the sidebar (bottom left). There you can set a new username and/or password. You must enter your current password (initially `admin`) for confirmation.

---

## 📁 Server Folder Structure

In addition to the code, the server creates two important directories in the root folder at runtime:

- `data/docker-manager.db`: Stores your credentials (passwords are encrypted and hashed via `bcrypt`).
- `stacks_data/`: If you create a Docker Compose Stack in the UI, the system creates a subfolder here. It will contain the corresponding `docker-compose.yml` and a possible `.env` file. These files can also be edited outside the UI if needed.

---

## 🛠️ Tech Stack Used

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Components:** Shadcn UI, Radix UI, Lucide Icons
- **Terminal & Editor:** xterm.js (incl. WebSockets for PTY), Monaco Editor (`@monaco-editor/react`)
- **Backend (API Routes):** Node.js `fs`, `child_process`, `dockerode` (Docker API Adapter)
- **Authentication:** `jose` (JWT), `bcrypt`, `sqlite` / `sqlite3`

---

## 🤝 Troubleshooting

* **Terminal colors missing?**
  Ensure that the backend PTY creation sets the environment to `TERM: 'xterm-256color'` (already integrated into the code).
* **Next.js Host Warnings (Cross-Origin)?**
  `allowedDevOrigins` parameter is configured inside `next.config.ts`. If you are developing the app on a remote server and accessing it via IP, set up the corresponding IPs in the configuration.
* **Access to `/var/run/docker.sock` denied?**
  Your executing Node.js user must be a member of the `docker` group.
  If necessary, run `sudo usermod -aG docker $USER` and log in again.

---

## 📬 Contact & Author

Developed by **CodeNotiz**
- ✉️ Email: info@codenotiz.de
- 🌐 GitHub: [github.com/CodeNotiz/docker-manager](https://github.com/CodeNotiz/docker-manager)

*Developed with ❤️ for a more beautiful Docker experience.*
