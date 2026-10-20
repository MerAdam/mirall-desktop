// ══════════════════════════════════════════════════
//  main.js — Adam | Mediterrània Desktop
//  Une fenêtre = une session indépendante (cookies/login séparés),
//  ce qui permet d'ouvrir plusieurs comptes en même temps.
//  Aucun serveur ne tourne ici : c'est juste une fenêtre vers le
//  dashboard hébergé sur Replit.
// ══════════════════════════════════════════════════
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require("electron");
const path = require("path");

// 👉 Mets ici l'URL stable de ton Replit (celle donnée à UptimeRobot)
const DASHBOARD_URL = "https://mirall.onrender.com";

let windowCount = 0;
const windows = new Set();
let tray = null;

function createWindow(partitionName) {
  windowCount++;
  // Each window gets its own persistent session (separate cookies/localStorage),
  // identified by partitionName. Re-using the same name re-opens the same session
  // (so closing and reopening "Window 1" keeps you logged in); a fresh name = a fresh login.
  const partition = "persist:" + partitionName;

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Mirall",
    backgroundColor: "#0b1a2b", // matches the navy theme while the page loads
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      partition,
      nodeIntegration: false,
      contextIsolation: true,
      // Native browser Notification API works out of the box in Electron —
      // if the dashboard calls `new Notification(...)`, it'll show as a real
      // desktop notification automatically. No extra wiring needed here.
    },
  });

  win.loadURL(DASHBOARD_URL);

  win.webContents.on("did-fail-load", (_e, errorCode, errorDescription) => {
    if (errorCode === -3) return; // ERR_ABORTED — usually just a redirect, ignore
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(`
        <body style="background:#0b1a2b;color:#f4e9d8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
          <div>
            <h2>⚠️ Impossible de joindre le dashboard</h2>
            <p>${errorDescription}</p>
            <p style="opacity:.7">Vérifie que le Repl est bien en ligne (UptimeRobot), puis réessaie.</p>
            <button onclick="location.reload()" style="padding:10px 20px;border-radius:8px;border:none;background:#C41E3A;color:white;cursor:pointer;font-size:14px;">Réessayer</button>
          </div>
        </body>`)
    );
  });

  windows.add(win);
  win.on("closed", () => windows.delete(win));

  buildMenu();
  return win;
}

function openNewWindow() {
  // Each click creates a brand-new, independent session — perfect for logging
  // in with a different staff account without affecting other open windows.
  createWindow("account-" + Date.now());
}

function buildMenu() {
  const template = [
    {
      label: "Mirall",
      submenu: [
        { label: "Nouvelle fenêtre (nouveau compte)", accelerator: "CmdOrCtrl+N", click: () => openNewWindow() },
        { type: "separator" },
        { label: "Recharger", accelerator: "CmdOrCtrl+R", click: () => BrowserWindow.getFocusedWindow()?.reload() },
        { label: "Forcer le rechargement", accelerator: "CmdOrCtrl+Shift+R", click: () => BrowserWindow.getFocusedWindow()?.webContents.reloadIgnoringCache() },
        { type: "separator" },
        { role: "quit", label: "Quitter" },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        { role: "zoomIn", label: "Zoomer" },
        { role: "zoomOut", label: "Dézoomer" },
        { role: "resetZoom", label: "Réinitialiser le zoom" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Plein écran" },
        { type: "separator" },
        { role: "toggleDevTools", label: "Outils de développement" },
      ],
    },
    {
      label: "Fenêtre",
      submenu: [
        { role: "minimize", label: "Réduire" },
        { role: "close", label: "Fermer" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createTray() {
  try {
    const icon = nativeImage.createFromPath(path.join(__dirname, "build", "icon.png"));
    tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
    tray.setToolTip("Mirall");
    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: "Nouvelle fenêtre", click: () => openNewWindow() },
        { type: "separator" },
        { label: "Quitter", role: "quit" },
      ])
    );
  } catch {
    // Tray icon is optional — never block startup if it fails (e.g. missing icon file)
  }
}

app.whenReady().then(() => {
  createWindow("default");
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow("default");
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
