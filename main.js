const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');

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
      shell.openPath(file.filePath.toString()).catch(err => {
        console.error('Failed to open the file:', err);
      });
      // 获取文件所在的目录路径
      const folderPath = path.dirname(file.filePath.toString());
      // 打开该目录
      shell.openPath(folderPath).catch(err => {
        console.error('Failed to open the folder:', err);
      });
    }
  }).catch(err => {
    console.error(err);
  });
});