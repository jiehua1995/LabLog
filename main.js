const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    icon: path.join(__dirname, 'build/icon.ico'), // 设置窗口图标
    autoHideMenuBar: true, // 隐藏菜单栏
    webPreferences: {
      nodeIntegration: true, // 启用Node.js集成
      contextIsolation: false, // 禁用上下文隔离
    }
  });

  mainWindow.loadFile('index.html');
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

// IPC 主进程处理，用于将安装路径发送到渲染进程
ipcMain.handle('get-install-path', (event) => {
  return app.getAppPath();
});
