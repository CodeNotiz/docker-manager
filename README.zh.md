# 🐳 Docker Manager 网页界面

[Deutsch](README.de.md) | [English](README.md) | [Español](README.es.md) | [Français](README.fr.md) | [Українська](README.uk.md) | [Русский](README.ru.md) | [日本語](README.ja.md) | [中文](README.zh.md)

一款强大、现代且具有未来感的网页界面，用于管理您的本地 Docker 环境。基于 Next.js、Tailwind CSS（毛玻璃拟态设计）和 Shadcn UI 构建。

![Dashboard Preview](docs/dashboard.png)

## ✨ 功能特性

- **未来感 UI：** 完全采用「毛玻璃拟态」风格设计，支持深色和浅色模式，并以流动的网格渐变作为背景。
- **🌍 多语言支持 (i18n)：** 界面完全支持 **8 种语言**：中文（简体）、英语、德语、西班牙语、法语、乌克兰语、俄语和日语。
- **🔐 内置认证：** 安全访问区域。应用程序自动生成 SQLite 数据库，并要求通过（可更改的）用户名和密码登录。默认登录：`admin` / `admin`。
- **📦 容器管理：**
  - 所有运行中和已停止容器的概览。
  - 启动、停止、重启或删除容器。
  - **实时终端 (xterm.js)：** 直接在浏览器中打开交互式 Shell，支持 TTY 颜色。
  - **实时日志：** 实时查看容器输出。
- **💿 镜像管理：**
  - 列出所有本地 Docker 镜像。
  - 删除单个镜像。
  - 智能清理：一键删除悬空镜像或所有未使用镜像。
- **🌐 网络管理：**
  - 所有 Docker 网络的概览。
  - 创建新网络（可选支持 IPv4/IPv6 子网/网关配置）。
  - 删除未使用的网络。
- **🥞 堆栈支持 (Docker Compose)：**
  - 内置代码编辑器 (Monaco)，用于 `docker-compose.yml` 文件。
  - 独立选项卡，用于并行管理 `.env` 变量。
  - 直接从浏览器部署 (`docker compose up -d`) 或停止 (`docker compose down`) 堆栈。

---

## 🚀 安装与启动

该应用程序正式 **支持 Docker**，并包含所需的一切（Alpine Linux、Docker CLI 和 Node.js 服务器）。您甚至无需在主机系统上安装 Node.js！

### 选项 1：预构建 Docker 镜像（最简单 – 推荐）

直接从 GitHub Container Registry 拉取最新镜像：

```bash
docker pull ghcr.io/codenotiz/docker-manager:latest
```

或使用附带的 **`docker-compose.yml`**，它会自动下载并启动镜像：

```bash
# 1. 下载 docker-compose.yml（或克隆仓库）
# 2. 在后台启动容器
docker compose up -d
```
应用现已可通过 **`http://localhost:3000`** 访问。

### 选项 2：通过 Docker Compose 从源码构建

使用附带的 `docker-compose.build.yml` 在本地构建镜像。需要先克隆仓库。

```bash
# 1. 克隆仓库
git clone https://github.com/CodeNotiz/docker-manager.git
cd docker-manager

# 2. 在后台构建并启动容器
docker compose -f docker-compose.build.yml up -d --build
```
应用现已可通过 **`http://localhost:3000`** 访问。

### 选项 3：通过 Node.js 经典方式安装（用于开发）

前提条件：主机上已安装 Node.js (v18+) 和 Docker。

```bash
npm install
npm run dev
```
开发服务器将在 3000 端口启动。*提示：首次启动时，`/data` 文件夹及 SQLite 数据库 `docker-manager.db` 将在后台自动创建。*

---

## ⚙️ 配置

### 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `LOG_LEVEL` | `INFO` | 控制服务器端日志输出的详细程度。 |
| `PORT` | `3000` | Node.js 服务器监听的端口。 |
| `HOST` | `0.0.0.0` | 服务器绑定的网络接口。 |
| `COOKIE_SECURE` | `false` | 仅在运行于 HTTPS/反向代理后面时设置为 `true`。 |

### 日志级别 (`LOG_LEVEL`)

| 值 | 说明 |
|---|---|
| `DEBUG` | 所有消息，包括 socket 连接和中间件重定向 |
| `INFO` | 标准 – 服务器启动、数据库初始化、错误 *(默认)* |
| `WARN` | 仅警告和错误（例如过期令牌） |
| `ERROR` | 仅错误 |
| `SILENT` | 无输出 |

**在 `docker-compose.yml` 中的示例：**
```yaml
environment:
  - LOG_LEVEL=DEBUG
```

**本地开发示例：**
```bash
LOG_LEVEL=DEBUG npm run dev
```

---

## 🛡️ 认证（登录）

应用程序受 Edge Middleware 保护。没有有效的 JWT Cookie，将无法访问仪表板或 API。

- **默认用户名：** `admin`
- **默认密码：** `admin`

*注意：强烈建议您在首次登录后更改这些凭据！*

### 更改凭据
点击侧边栏（左下角）的 **「设置」**。在那里可以设置新的用户名和/或密码。需要输入当前密码（初始为 `admin`）进行确认。

---

## 📁 服务器目录结构

除代码外，服务器在运行时会在根目录中创建两个重要目录：

- `data/docker-manager.db`：存储您的凭据（密码通过 `bcrypt` 加密和哈希处理）。
- `stacks_data/`：如果您在 UI 中创建 Docker Compose 堆栈，系统会在此处创建一个子文件夹。其中包含相应的 `docker-compose.yml` 和可能的 `.env` 文件。如有需要，这些文件也可以在 UI 外部进行编辑。

---

## 🛠️ 技术栈

- **前端：** Next.js (App Router), React, Tailwind CSS
- **组件：** Shadcn UI, Radix UI, Lucide Icons
- **终端 & 编辑器：** xterm.js（含用于 PTY 的 WebSockets），Monaco Editor (`@monaco-editor/react`)
- **后端 (API 路由)：** Node.js `fs`、`child_process`、`dockerode`（Docker API 适配器）
- **认证：** `jose` (JWT), `bcrypt`, `sqlite` / `sqlite3`

---

## 🤝 故障排除

* **终端颜色缺失？**
  确保后端在创建 PTY 时将环境设置为 `TERM: 'xterm-256color'`（已集成到代码中）。
* **Next.js 主机警告（跨域）？**
  `allowedDevOrigins` 参数在 `next.config.ts` 中配置。如果您在远程服务器上开发应用并通过 IP 访问，请在配置中设置相应的 IP 地址。
* **访问 `/var/run/docker.sock` 被拒绝？**
  您执行 Node.js 的用户必须是 `docker` 组的成员。
  如有必要，请运行 `sudo usermod -aG docker $USER` 并重新登录。

---

## 📬 联系方式 & 作者

由 **CodeNotiz** 开发
- ✉️ Email：info@codenotiz.de
- 🌐 GitHub：[github.com/CodeNotiz/docker-manager](https://github.com/CodeNotiz/docker-manager)

*以 ❤️ 打造，为您带来更美好的 Docker 体验。*
