const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    title: "HEMS Tactical Bridge",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false, // Simplified for local bridge communication
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

  // Open DevTools for debugging (optional)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  // Use fork to run the server.js script as a child process
  // Use path.join(__dirname, 'server.js') to ensure correct path resolution in packaged app
  serverProcess = fork(path.join(__dirname, 'server.js'));

  serverProcess.on('message', (message) => {
    // Relay messages from the server to the renderer process
    if (mainWindow) {
      mainWindow.webContents.send('server-message', message);
    }
  });

  serverProcess.on('exit', (code) => {
    console.log(`Server process exited with code ${code}`);
    if (mainWindow) {
      mainWindow.webContents.send('server-status', { status: 'stopped', code });
    }
  });
  
  if (mainWindow) {
    mainWindow.webContents.send('server-status', { status: 'started' });
  }
}

app.on('ready', () => {
  createWindow();
  startServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Ensure the server process is killed when the app quits
  if (serverProcess) {
    serverProcess.kill();
  }
});