# 🐳 Interface Web du Gestionnaire Docker

[Deutsch](README.de.md) | [English](README.md) | [Español](README.es.md) | [Français](README.fr.md) | [Українська](README.uk.md) | [Русский](README.ru.md) | [日本語](README.ja.md) | [中文](README.zh.md)

Une interface web puissante, moderne et futuriste pour gérer votre environnement Docker local. Construite avec Next.js, Tailwind CSS (Design Glassmorphism) et Shadcn UI.

![Dashboard Preview](docs/dashboard.png)

## ✨ Fonctionnalités

- **Interface Futuriste :** Entièrement conçue dans le style "Glassmorphism", elle prend en charge les modes Sombre et Clair avec des dégradés de maille fluides en arrière-plan.
- **🌍 Support Multilingue (i18n) :** L'interface est entièrement disponible en **8 langues** : Français, Anglais, Allemand, Espagnol, Ukrainien, Russe, Japonais et Chinois (Simplifié).
- **🔐 Authentification Intégrée :** Zone d'accès sécurisée. L'application génère automatiquement une base de données SQLite et nécessite une connexion avec un nom d'utilisateur et un mot de passe (modifiables). Identifiants par défaut : `admin` / `admin`.
- **📦 Gestion des Conteneurs :**
  - Vue d'ensemble de tous les conteneurs en cours d'exécution et arrêtés.
  - Démarrer, arrêter, redémarrer ou supprimer des conteneurs.
  - **Terminal en Temps Réel (xterm.js) :** Ouvrez un shell interactif directement dans votre navigateur avec la prise en charge des couleurs TTY.
  - **Journaux en Direct :** Consultez la sortie des conteneurs en temps réel.
- **💿 Gestion des Images :**
  - Liste de toutes les images Docker locales.
  - Supprimer des images individuelles.
  - Nettoyage Intelligent : Supprimez les images orphelines (dangling) ou non utilisées en un seul clic.
- **🌐 Gestion des Réseaux :**
  - Aperçu de tous les réseaux Docker.
  - Créer de nouveaux réseaux (Prise en charge optionnelle des configurations subnet/gateway IPv4 et IPv6).
  - Supprimer les réseaux inutilisés.
- **🥞 Prise en charge des Piles (Docker Compose) :**
  - Éditeur de code intégré (Monaco) pour les fichiers `docker-compose.yml`.
  - Onglet séparé pour la gestion en parallèle des variables `.env`.
  - Déployez facilement (`docker compose up -d`) ou arrêtez (`docker compose down`) les piles depuis le navigateur.

---

## 🚀 Installation & Démarrage

L'application est officiellement **Prête pour Docker** et inclut tout ce dont vous avez besoin (Alpine Linux, Docker CLI et le serveur Node.js). Vous n'avez même pas besoin d'installer Node.js sur votre machine hôte !

### Option 1 : Image Docker précompilée (Méthode la plus simple – Recommandée)

Téléchargez directement la dernière image depuis le GitHub Container Registry :

```bash
docker pull ghcr.io/codenotiz/docker-manager:latest
```

Ou utilisez le **`docker-compose.yml`** inclus, qui télécharge et démarre l'image automatiquement :

```bash
# 1. Télécharger docker-compose.yml (ou cloner le dépôt)
# 2. Démarrer le conteneur en arrière-plan
docker compose up -d
```
L'application est maintenant accessible sur **`http://localhost:3000`**.

### Option 2 : Compilation depuis les sources via Docker Compose

Utilisez le `docker-compose.build.yml` inclus pour compiler l'image localement. Nécessite de cloner le dépôt au préalable.

```bash
# 1. Cloner le répertoire
git clone https://github.com/CodeNotiz/docker-manager.git
cd docker-manager

# 2. Construire et démarrer le conteneur en arrière-plan
docker compose -f docker-compose.build.yml up -d --build
```
L'application est maintenant accessible sur **`http://localhost:3000`**.

### Option 3 : Installation Classique via Node.js (Pour le développement)

Prérequis : Node.js (v18+) et Docker sont installés sur le système hôte.

```bash
npm install
npm run dev
```
Le serveur de développement démarrera sur le port 3000. *Astuce : lors du premier démarrage, le dossier `/data` et la base de données SQLite `docker-manager.db` seront automatiquement créés en arrière-plan.*

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `JWT_SECRET` | *(fallback non sécurisé)* | Clé secrète pour signer les tokens JWT. **À définir impérativement en production !** |
| `LOG_LEVEL` | `INFO` | Contrôle le niveau de verbosité des journaux côté serveur. |
| `PORT` | `3000` | Port sur lequel le serveur Node.js écoute. |
| `HOST` | `0.0.0.0` | Interface réseau sur laquelle le serveur est lié. |

### Niveaux de journalisation (`LOG_LEVEL`)

| Valeur | Description |
|---|---|
| `DEBUG` | Tous les messages, y compris les connexions socket et les redirections |
| `INFO` | Standard – démarrage serveur, init DB, erreurs *(défaut)* |
| `WARN` | Avertissements et erreurs uniquement (ex. tokens expirés) |
| `ERROR` | Erreurs uniquement |
| `SILENT` | Aucune sortie |

**Exemple** dans `docker-compose.yml` :
```yaml
environment:
  - LOG_LEVEL=DEBUG
```

**Exemple** pour le développement local :
```bash
LOG_LEVEL=DEBUG npm run dev
```

---

## 🛡️ Authentification (Connexion)

L'application est protégée par un Edge Middleware. Sans un cookie JWT valide, l'accès au tableau de bord ou à l'API est bloqué.

- **Nom d'utilisateur par défaut :** `admin`
- **Mot de passe par défaut :** `admin`

*Remarque : Il vous sera fortement conseillé de modifier ces identifiants après votre première connexion !*

### Modifier les Identifiants
Cliquez sur **"Paramètres"** dans la barre latérale (en bas à gauche). Vous pourrez y définir un nouveau nom d'utilisateur et/ou mot de passe. Vous devrez saisir votre mot de passe actuel (initialement `admin`) pour confirmer.

---

## 📁 Structure des Dossiers du Serveur

En plus du code, le serveur crée deux répertoires importants à la racine lors de l'exécution :

- `data/docker-manager.db` : Stocke vos identifiants (les mots de passe sont chiffrés et hachés via `bcrypt`).
- `stacks_data/` : Si vous créez une pile Docker Compose dans l'interface, le système crée ici un sous-dossier, qui contiendra le fichier `docker-compose.yml` correspondant et un éventuel fichier `.env`. Ces fichiers peuvent également être édités en dehors de l'interface si besoin.

---

## 🛠️ Technologies Utilisées

- **Frontend :** Next.js (App Router), React, Tailwind CSS
- **Composants :** Shadcn UI, Radix UI, Lucide Icons
- **Terminal & Éditeur :** xterm.js (incl. WebSockets pour PTY), Monaco Editor (`@monaco-editor/react`)
- **Backend (Routes API) :** Node.js `fs`, `child_process`, `dockerode` (Adaptateur pour l'API Docker)
- **Authentification :** `jose` (JWT), `bcrypt`, `sqlite` / `sqlite3`

---

## 🤝 Résolution des problèmes

* **Couleurs du terminal manquantes ?**
  Assurez-vous que la création du PTY dans le backend définit l'environnement sur `TERM: 'xterm-256color'` (déjà intégré dans le code).
* **Avertissements Host Next.js (Cross-Origin) ?**
  Le paramètre `allowedDevOrigins` est configuré dans le fichier `next.config.ts`. Si vous développez l'application sur un serveur distant et que vous y accédez via IP, configurez ces adresses IP en conséquence.
* **Accès au `/var/run/docker.sock` refusé ?**
  L'utilisateur Node.js qui exécute l'application doit faire partie du groupe `docker`.
  Si nécessaire, exécutez `sudo usermod -aG docker $USER` et reconnectez-vous.

---

## 📬 Contact & Auteur

Développé par **CodeNotiz**
- ✉️ Email : info@codenotiz.de
- 🌐 GitHub : [github.com/CodeNotiz/docker-manager](https://github.com/CodeNotiz/docker-manager)

*Développé avec ❤️ pour une expérience Docker plus attrayante.*
