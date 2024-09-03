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
    icon: path.join(__dirname, 'build/icon.ico'),
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

// IPC 主进程处理，用于保存 Markdown 文件
ipcMain.on('save-markdown', (event, content, fileName) => {
  const { dialog } = require('electron');

  dialog.showSaveDialog({
    title: 'Save Markdown File',
    defaultPath: path.join(app.getPath('desktop'), fileName),
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(file => {
    if (!file.canceled) {
      fs.writeFileSync(file.filePath.toString(), content);
      event.sender.send('save-markdown-reply', 'File saved successfully.');
    }
  }).catch(err => {
    console.error('Failed to save the file:', err);
  });
});
