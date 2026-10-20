// ══════════════════════════════════════════════════
//  main.js — Adam | Mediterrània Desktop
//  Une fenêtre = une session indépendante (cookies/login séparés),
//  ce qui permet d'ouvrir plusieurs comptes en même temps.
//  Aucun serveur ne tourne ici : c'est juste une fenêtre vers le
//  dashboard hébergé sur Render.
// ══════════════════════════════════════════════════
const { app, BrowserWindow, Menu, Tray, nativeImage } = require("electron");
const path = require("path");

const DASHBOARD_URL = "https://mirall.onrender.com";

let windowCount = 0;
const windows = new Set();
let tray = null;

// Title bar overlay colours — update both when adding light mode
const TITLEBAR = {
  color: "#0f0f0f",        // background of the overlay (matches app bg)
  symbolColor: "#9a9a9a",  // colour of the min/max/close icons
  height: 36,
};

function createWindow(partitionName) {
  windowCount++;
  const partition = "persist:" + partitionName;

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Mirall",
    backgroundColor: "#0f0f0f",
    icon: path.join(__dirname, "build", "icon.png"),
    // Native title bar hidden — only the coloured overlay (min/max/close) remains
    titleBarStyle: "hidden",
    titleBarOverlay: TITLEBAR,
    webPreferences: {
      partition,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove the menu bar entirely
  Menu.setApplicationMenu(null);

  win.loadURL(DASHBOARD_URL);

  win.webContents.on("did-fail-load", (_e, errorCode, errorDescription) => {
    if (errorCode === -3) return; // ERR_ABORTED — redirect, ignore
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(`
        <body style="background:#0f0f0f;color:#f0f0f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
          <div>
            <h2>⚠️ Impossible de joindre le dashboard</h2>
            <p>${errorDescription}</p>
            <p style="opacity:.5">Vérifie ta connexion, puis réessaie.</p>
            <button onclick="location.reload()" style="margin-top:16px;padding:10px 20px;border-radius:8px;border:none;background:#c94030;color:white;cursor:pointer;font-size:14px;">Réessayer</button>
          </div>
        </body>`)
    );
  });

  windows.add(win);
  win.on("closed", () => windows.delete(win));

  return win;
}

function openNewWindow() {
  createWindow("account-" + Date.now());
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
    // Tray icon is optional — never block startup if it fails
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
