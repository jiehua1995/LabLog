const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 将缓存目录设置为用户数据目录中的一个子目录
const cacheDir = path.join(app.getPath('userData'), 'cache');
app.commandLine.appendSwitch('disk-cache-dir', cacheDir);
app.commandLine.appendSwitch('media-cache-dir', cacheDir);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('index.html');
}

function copySettingsFile() {
  const userDataPath = app.getPath('userData'); // 获取用户数据目录
  const settingsSrcPath = path.join(__dirname, 'settings.json'); // 原始 settings.json 文件路径
  const settingsDestPath = path.join(userDataPath, 'settings.json'); // 目标路径

  // 如果目标目录不存在 settings.json，则从原始路径复制
  if (!fs.existsSync(settingsDestPath)) {
    fs.copyFileSync(settingsSrcPath, settingsDestPath);
  }
}

app.whenReady().then(() => {
  copySettingsFile();
  createWindow();
});

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

// IPC 主进程处理，用于将设置文件的路径发送到渲染进程
ipcMain.handle('get-settings-path', (event) => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  return settingsPath;
});
