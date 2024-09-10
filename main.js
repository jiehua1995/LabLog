const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
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

// 复制 settings.json 文件到用户数据目录
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

ipcMain.on('save-markdown', (event, content, fileName) => {
  console.log('File Name:', fileName);  // 这行用来检查 fileName 是否正确传递
  const { dialog } = require('electron');

  dialog.showSaveDialog({
    title: 'Save Markdown File',
    defaultPath: path.join(app.getPath('userData'), fileName || 'defaultFileName.md'),
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(file => {
    if (!file.canceled && file.filePath) {
      fs.writeFileSync(file.filePath.toString(), content);
      event.sender.send('save-markdown-reply', 'File saved successfully.');

      // 自动打开保存的文件
      shell.openPath(file.filePath.toString()).catch(err => {
        console.error('Failed to open the file:', err);
      });
    } else {
      console.error('File path is undefined or saving was canceled');
    }
  }).catch(err => {
    console.error('Failed to save the file:', err);
  });
});
