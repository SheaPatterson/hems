import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
let tray: Tray | null;

// Handle auto-update logic here if needed later

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'favicon.ico'),
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    backgroundColor: '#09090b',
  });

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Use fileURLToPath for robust path resolution in production
    const indexHtmlPath = path.join(process.env.DIST!, 'index.html');
    win.loadFile(indexHtmlPath);
  }

  win.on('close', (event: any) => {
    if (!(app as any).isQuitting) {
      event.preventDefault();
      win?.hide();
    }
    return false;
  });
}

function createTray() {
  const iconPath = path.join(process.env.VITE_PUBLIC!, 'favicon.ico');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Command Center', click: () => win?.show() },
    { type: 'separator' },
    { label: 'Exit HEMS Ops', click: () => {
        (app as any).isQuitting = true;
        app.quit();
    }}
  ]);

  tray.setToolTip('HEMS Ops Center');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => win?.show());
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('window-minimize', () => win?.minimize());
ipcMain.on('window-maximize', () => win?.isMaximized() ? win.unmaximize() : win?.maximize());
ipcMain.on('window-close', () => win?.hide());
ipcMain.on('restart_app', () => {
    (app as any).isQuitting = true;
    app.relaunch();
    app.exit();
});