# 🐳 Interfaz Web del Gestor UI para Docker

[Deutsch](README.de.md) | [English](README.md) | [Español](README.es.md) | [Français](README.fr.md)

Una interfaz web potente, moderna y futurista para gestionar tu entorno local de Docker. Construida con Next.js, Tailwind CSS (diseño Glassmorphism) y Shadcn UI.

![Dashboard Preview](docs/dashboard.png)

## ✨ Características

- **Interfaz Futurista:** Diseñada completamente con un estilo "Glassmorphism", compatible con los modos oscuro y claro, y con degradados de malla fluidos como fondos.
- **🌍 Soporte Multilingüe (i18n):** La interfaz está completamente disponible en Español, Inglés, Alemán y Francés.
- **🔐 Autenticación Integrada:** Área de acceso seguro. La aplicación genera automáticamente una base de datos SQLite y requiere un inicio de sesión mediante un nombre de usuario y contraseña (modificables). Credenciales por defecto: `admin` / `admin`.
- **📦 Gestión de Contenedores:**
  - Visión general de todos los contenedores en ejecución y detenidos.
  - Iniciar, detener, reiniciar o eliminar contenedores.
  - **Terminal en Tiempo Real (xterm.js):** Abre una shell interactiva directamente en tu navegador con soporte de color TTY.
  - **Registros en Vivo:** Visualiza las salidas de los contenedores en tiempo real.
- **💿 Gestión de Imágenes:**
  - Lista de todas las imágenes locales de Docker.
  - Eliminar imágenes individuales.
  - Limpieza Inteligente: Elimina imágenes huérfanas o no utilizadas con un solo clic.
- **🌐 Gestión de Redes:**
  - Resumen de todas las redes de Docker.
  - Crear nuevas redes (soporte opcional para configuración de subred/puerta de enlace IPv4 e IPv6).
  - Eliminar redes no utilizadas.
- **🥞 Soporte para Pilas (Docker Compose):**
  - Editor de código integrado (Monaco) para archivos `docker-compose.yml`.
  - Pestaña separada para el mantenimiento paralelo de las variables `.env`.
  - Despliega fácilmente (`docker compose up -d`) o detén (`docker compose down`) pilas directamente desde el navegador.

---

## 🚀 Instalación y Puesta en Marcha

La aplicación es oficialmente **Compatible con Docker** e incluye todo lo que necesitas (Alpine Linux, Docker CLI y el servidor de Node.js). ¡Ni siquiera necesitas tener Node.js instalado en tu sistema host!

### Opción 1: Iniciar vía Docker Compose (Recomendado)

Se incluye una plantilla `docker-compose.yml` lista para usar. Esta monta el socket de Docker local (`/var/run/docker.sock`) dentro del contenedor y almacena de forma segura la base de datos SQLite y las pilas (stacks) de usuario en tu sistema de archivos.

```bash
# 1. Clonar el repositorio
git clone https://github.com/CodeNotiz/docker-manager.git
cd docker-manager

# 2. Construir e iniciar el contenedor en segundo plano
docker compose up -d --build
```
La aplicación ya está accesible en **`http://localhost:3000`**.

### Opción 2: Configuración Clásica vía Node.js (Para Desarrollo)

Requisitos: Node.js (v18+) y Docker deben estar instalados en el host.

```bash
npm install
npm run dev
```
El servidor de desarrollo iniciará en el puerto 3000. *Sugerencia: Al iniciar por primera vez, se creará automáticamente la carpeta `/data` junto con la base de datos SQLite `docker-manager.db` en segundo plano.*

---

## 🛡️ Autenticación (Inicio de sesión)

La aplicación está protegida por un Edge Middleware. Sin una cookie JWT válida, se bloqueará el acceso al panel y a la API.

- **Usuario por defecto:** `admin`
- **Contraseña por defecto:** `admin`

*Nota: ¡Se te aconsejará encarecidamente que cambies estas credenciales después de tu primer inicio de sesión!*

### Cambiar Credenciales
Haz clic en **"Ajustes"** en la barra lateral (abajo a la izquierda). Allí podrás establecer un nuevo usuario o contraseña. Deberás introducir tu contraseña actual (inicialmente `admin`) a modo de confirmación.

---

## 📁 Estructura de Carpetas del Servidor

Además del código, el servidor crea dos directorios importantes en la carpeta raíz durante el tiempo de ejecución:

- `data/docker-manager.db`: Almacena tus credenciales (las contraseñas se cifran mediante `bcrypt`).
- `stacks_data/`: Si creas una pila (stack) de Docker Compose en la interfaz, el sistema crea aquí una subcarpeta. Esta contendrá el archivo `docker-compose.yml` correspondiente y un posible archivo `.env`. Estos archivos también se pueden editar fuera de la interfaz si es necesario.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Componentes:** Shadcn UI, Radix UI, Lucide Icons
- **Terminal y Editor:** xterm.js (incl. WebSockets para PTY), Monaco Editor (`@monaco-editor/react`)
- **Backend (Rutas API):** Node.js `fs`, `child_process`, `dockerode` (Adaptador para la API de Docker)
- **Autenticación:** `jose` (JWT), `bcrypt`, `sqlite` / `sqlite3`

---

## 🤝 Resolución de problemas

* **¿Faltan los colores de la terminal?**
  Asegúrate de que la creación de la PTY en el backend establezca el entorno en `TERM: 'xterm-256color'` (ya integrado en el código).
* **¿Advertencias de Host (Origen Cruzado) en Next.js?**
  El parámetro `allowedDevOrigins` está configurado en `next.config.ts`. Si estás desarrollando la app en un servidor remoto y accedes a ella mediante IP, configura las IPs correspondientes ahí.
* **¿Permiso denegado para acceder a `/var/run/docker.sock`?**
  Tu usuario ejecutor de Node.js debe ser miembro del grupo `docker`.
  De ser necesario, ejecuta `sudo usermod -aG docker $USER` y vuelve a iniciar sesión.

---

## 📬 Contacto y Autor

Desarrollado por **CodeNotiz**
- ✉️ Email: info@codenotiz.de
- 🌐 GitHub: [github.com/CodeNotiz/docker-manager](https://github.com/CodeNotiz/docker-manager)

*Desarrollado con ❤️ para una experiencia Docker más atractiva.*
