import fs from 'node:fs';
import path from 'node:path';

const keysToAdd = {
  de: {
    dashboard: { fetchError: "Fehler beim Laden der Statistiken" },
    containers: {
      pageSubtitle: "Verwalte deine lokalen Docker-Container.",
      detailsGeneral: "Allgemein", detailsId: "ID", detailsImage: "Image", detailsCreated: "Erstellt am", detailsEntrypoint: "Entrypoint",
      detailsNetworks: "Netzwerke", detailsIpAddress: "IP-Adresse", detailsGateway: "Gateway", detailsMacAddress: "Mac Address",
      detailsViews: "Ansichten", detailsViewLogs: "ansehen", detailsInteractiveTerminal: "Interactive Terminal",
      detailsControl: "Steuerung", detailsMounts: "Mounts", detailsEnvFilter: "Environment Filter (ENV)"
    },
    logs: { title: "Logs: ", clear: "Löschen", download: "Herunterladen", waiting: "Warte auf Logs..." },
    terminal: { connecting: "Verbinde mit ", connected: "[Verbunden]", disconnected: "[Vom Server getrennt]" },
    images: { pageSubtitle: "Verwalten Sie Ihre lokalen Docker-Images, löschen Sie ungenutzte Images oder führen Sie ein Prune durch." },
    networks: { pageSubtitle: "Verwalten Sie Ihre Docker-Netzwerke, legen Sie neue an oder löschen Sie ungenutzte Netzwerke." },
    stacks: { pageSubtitle: "Erstellen und verwalten Sie komplexe Anwendungen mit Docker Compose Stacks." }
  },
  en: {
    dashboard: { fetchError: "Error loading statistics" },
    containers: {
      pageSubtitle: "Manage your local Docker containers.",
      detailsGeneral: "General", detailsId: "ID", detailsImage: "Image", detailsCreated: "Created At", detailsEntrypoint: "Entrypoint",
      detailsNetworks: "Networks", detailsIpAddress: "IP Address", detailsGateway: "Gateway", detailsMacAddress: "Mac Address",
      detailsViews: "Views", detailsViewLogs: "view logs", detailsInteractiveTerminal: "Interactive Terminal",
      detailsControl: "Control", detailsMounts: "Mounts", detailsEnvFilter: "Environment Filter (ENV)"
    },
    logs: { title: "Logs: ", clear: "Clear", download: "Download", waiting: "Waiting for logs..." },
    terminal: { connecting: "Connecting to ", connected: "[Connected]", disconnected: "[Disconnected from server]" },
    images: { pageSubtitle: "Manage your local Docker images, delete unused images, or perform a prune." },
    networks: { pageSubtitle: "Manage your Docker networks, create new ones, or delete unused networks." },
    stacks: { pageSubtitle: "Create and manage complex applications using Docker Compose Stacks." }
  },
  es: {
    dashboard: { fetchError: "Error al cargar las estadísticas" },
    containers: {
      pageSubtitle: "Gestiona tus contenedores locales de Docker.",
      detailsGeneral: "General", detailsId: "ID", detailsImage: "Imagen", detailsCreated: "Creado en", detailsEntrypoint: "Punto de entrada (Entrypoint)",
      detailsNetworks: "Redes", detailsIpAddress: "Dirección IP", detailsGateway: "Puerta de enlace", detailsMacAddress: "Dirección MAC",
      detailsViews: "Vistas", detailsViewLogs: "ver registros", detailsInteractiveTerminal: "Terminal Interactivo",
      detailsControl: "Control", detailsMounts: "Montajes (Mounts)", detailsEnvFilter: "Filtro de entorno (ENV)"
    },
    logs: { title: "Registros: ", clear: "Limpiar", download: "Descargar", waiting: "Esperando registros..." },
    terminal: { connecting: "Conectando a ", connected: "[Conectado]", disconnected: "[Desconectado del servidor]" },
    images: { pageSubtitle: "Gestiona tus imágenes locales de Docker, elimina las que no uses o realiza una limpieza (prune)." },
    networks: { pageSubtitle: "Gestiona tus redes de Docker, crea otras nuevas o elimina las que no uses." },
    stacks: { pageSubtitle: "Crea y gestiona aplicaciones complejas usando Pilas (Stacks) de Docker Compose." }
  },
  fr: {
    dashboard: { fetchError: "Erreur lors du chargement des statistiques" },
    containers: {
      pageSubtitle: "Gérez vos conteneurs Docker locaux.",
      detailsGeneral: "Général", detailsId: "ID", detailsImage: "Image", detailsCreated: "Créé le", detailsEntrypoint: "Point d'entrée",
      detailsNetworks: "Réseaux", detailsIpAddress: "Adresse IP", detailsGateway: "Passerelle", detailsMacAddress: "Adresse MAC",
      detailsViews: "Vues", detailsViewLogs: "voir les journaux", detailsInteractiveTerminal: "Terminal interactif",
      detailsControl: "Contrôle", detailsMounts: "Montages", detailsEnvFilter: "Filtre d'environnement (ENV)"
    },
    logs: { title: "Journaux: ", clear: "Effacer", download: "Télécharger", waiting: "En attente des journaux..." },
    terminal: { connecting: "Connexion à ", connected: "[Connecté]", disconnected: "[Déconnecté du serveur]" },
    images: { pageSubtitle: "Gérez vos images Docker locales, supprimez les images inutilisées ou effectuez un nettoyage (prune)." },
    networks: { pageSubtitle: "Gérez vos réseaux Docker, créez-en de nouveaux ou supprimez les réseaux inutilisés." },
    stacks: { pageSubtitle: "Créez et gérez des applications complexes en utilisant les piles Docker Compose." }
  },
  ja: {
    dashboard: { fetchError: "統計の読み込みエラー" },
    containers: {
      pageSubtitle: "ローカルのDockerコンテナを管理します。",
      detailsGeneral: "一般", detailsId: "ID", detailsImage: "イメージ", detailsCreated: "作成日時", detailsEntrypoint: "エントリポイント",
      detailsNetworks: "ネットワーク", detailsIpAddress: "IPアドレス", detailsGateway: "ゲートウェイ", detailsMacAddress: "MACアドレス",
      detailsViews: "ビュー", detailsViewLogs: "ログを表示", detailsInteractiveTerminal: "対話型ターミナル",
      detailsControl: "制御", detailsMounts: "マウント", detailsEnvFilter: "環境フィルター (ENV)"
    },
    logs: { title: "ログ: ", clear: "クリア", download: "ダウンロード", waiting: "ログを待機中..." },
    terminal: { connecting: "接続中: ", connected: "[接続されました]", disconnected: "[サーバーから切断されました]" },
    images: { pageSubtitle: "ローカルのDockerイメージを管理し、未使用のイメージを削除したり、プルーニング（整理）を実行します。" },
    networks: { pageSubtitle: "Dockerネットワークを管理し、新しいネットワークを作成したり、未使用のものを削除します。" },
    stacks: { pageSubtitle: "Docker Composeのスタックを使用して、複雑なアプリケーションを作成および管理します。" }
  },
  ru: {
    dashboard: { fetchError: "Ошибка при загрузке статистики" },
    containers: {
      pageSubtitle: "Управляйте локальными Docker-контейнерами.",
      detailsGeneral: "Общие", detailsId: "ID", detailsImage: "Образ", detailsCreated: "Создан", detailsEntrypoint: "Точка входа",
      detailsNetworks: "Сети", detailsIpAddress: "IP-адрес", detailsGateway: "Шлюз", detailsMacAddress: "MAC-адрес",
      detailsViews: "Виды", detailsViewLogs: "просмотр логов", detailsInteractiveTerminal: "Интерактивный терминал",
      detailsControl: "Управление", detailsMounts: "Монтирования", detailsEnvFilter: "Фильтр среды (ENV)"
    },
    logs: { title: "Логи: ", clear: "Очистить", download: "Скачать", waiting: "Ожидание логов..." },
    terminal: { connecting: "Подключение к ", connected: "[Подключено]", disconnected: "[Отключено от сервера]" },
    images: { pageSubtitle: "Управляйте локальными Docker-образами, удаляйте неиспользуемые образы или выполняйте очистку (prune)." },
    networks: { pageSubtitle: "Управляйте Docker-сетями, создавайте новые или удаляйте неиспользуемые сети." },
    stacks: { pageSubtitle: "Создавайте и управляйте сложными приложениями с помощью стеков Docker Compose." }
  },
  uk: {
    dashboard: { fetchError: "Помилка завантаження статистики" },
    containers: {
      pageSubtitle: "Керуйте локальними Docker-контейнерами.",
      detailsGeneral: "Загальні", detailsId: "ID", detailsImage: "Образ", detailsCreated: "Створено", detailsEntrypoint: "Точка входу",
      detailsNetworks: "Мережі", detailsIpAddress: "IP-адреса", detailsGateway: "Шлюз", detailsMacAddress: "MAC-адреса",
      detailsViews: "Перегляди", detailsViewLogs: "перегляд логів", detailsInteractiveTerminal: "Інтерактивний термінал",
      detailsControl: "Управління", detailsMounts: "Монтування", detailsEnvFilter: "Фільтр середовища (ENV)"
    },
    logs: { title: "Логи: ", clear: "Очистити", download: "Завантажити", waiting: "Очікування логів..." },
    terminal: { connecting: "Підключення до ", connected: "[Підключено]", disconnected: "[Відключено від сервера]" },
    images: { pageSubtitle: "Керуйте локальними Docker-образами, видаляйте невикористані образи або виконуйте очищення (prune)." },
    networks: { pageSubtitle: "Керуйте Docker-мережами, створюйте нові або видаляйте невикористані мережі." },
    stacks: { pageSubtitle: "Створюйте та керуйте складними програмами за допомогою стеків Docker Compose." }
  },
  zh: {
    dashboard: { fetchError: "加载统计信息时出错" },
    containers: {
      pageSubtitle: "管理您的本地 Docker 容器。",
      detailsGeneral: "常规", detailsId: "ID", detailsImage: "镜像", detailsCreated: "创建时间", detailsEntrypoint: "入口点",
      detailsNetworks: "网络", detailsIpAddress: "IP 地址", detailsGateway: "网关", detailsMacAddress: "MAC 地址",
      detailsViews: "视图", detailsViewLogs: "查看日志", detailsInteractiveTerminal: "交互式终端",
      detailsControl: "控制", detailsMounts: "挂载点", detailsEnvFilter: "环境变量过滤器 (ENV)"
    },
    logs: { title: "日志: ", clear: "清除", download: "下载", waiting: "等待日志..." },
    terminal: { connecting: "正在连接至 ", connected: "[已连接]", disconnected: "[已断开与服务器的连接]" },
    images: { pageSubtitle: "管理您的本地 Docker 镜像，删除未使用的镜像或执行清理 (prune)。" },
    networks: { pageSubtitle: "管理您的 Docker 网络，创建新网络或删除未使用的网络。" },
    stacks: { pageSubtitle: "使用 Docker Compose 堆栈创建和管理复杂的应用程序。" }
  }
};

const dicDir = 'c:/DEV/demo/Projekt10/docker-manager/src/i18n/dictionaries';
const files = fs.readdirSync(dicDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const lang = path.basename(file, '.json');
  if (keysToAdd[lang]) {
    const filePath = path.join(dicDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Merge nested objects
    for (const [key, val] of Object.entries(keysToAdd[lang])) {
        if (!content[key]) {
            content[key] = {};
        }
        for (const [subKey, subVal] of Object.entries(val)) {
            content[key][subKey] = subVal;
        }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`Updated ${file}`);
  }
}
