const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lablogAPI', {
  getSettingsPath: () => ipcRenderer.invoke('settings:get-path'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  saveMarkdown: (content, fileName) => ipcRenderer.send('save-markdown', content, fileName),
  onSaveMarkdownReply: (handler) => ipcRenderer.on('save-markdown-reply', (_, message) => handler(message)),
  checkForUpdates: () => ipcRenderer.invoke('updates:check'),
  downloadUpdate: () => ipcRenderer.invoke('updates:download'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  onUpdateStatus: (handler) => ipcRenderer.on('updates:status', (_, payload) => handler(payload)),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  toggleMaximizeWindow: () => ipcRenderer.send('window:toggle-maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onWindowMaximizeStateChange: (handler) => ipcRenderer.on('window:maximize-state', (_, isMaximized) => handler(isMaximized))
});
