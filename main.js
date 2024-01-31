const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    icon: "favicon.ico", // Update the path
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true  // 启用 remote 模块
    },
    autoHideMenuBar: true, //自动隐藏菜单栏
    // frame: false
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('save-markdown', (event, content, filePath) => {
  dialog.showSaveDialog({
    filters: [{ name: 'Markdown', extensions: ['md'] }],
    defaultPath: filePath
  }).then(file => {
    if (!file.canceled && file.filePath) {
      fs.writeFileSync(file.filePath.toString(), content, 'utf-8');
    }
  }).catch(err => {
    console.error(err);
  });
});
