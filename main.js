const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const { autoUpdater } = require('electron-updater');

const cacheDir = path.join(app.getPath('userData'), 'cache');
app.commandLine.appendSwitch('disk-cache-dir', cacheDir);
app.commandLine.appendSwitch('media-cache-dir', cacheDir);

const APP_NAME = 'LabLog Generator';
const SETTINGS_FILE_NAME = 'settings.json';

let mainWindow = null;

function getDefaultSettings() {
  const currentYear = new Date().getFullYear();
  return {
    Author: 'Jie Hua',
    Email: 'Jie.Hua@lmu.de',
    SelectedCategory: 'Experimental log',
    Categories: [
      {
        name: 'Experimental log',
        content:
          "[toc]\n\n## To-do list\n\n- [ ] \n\n## Experiments\n\n## Other things\n\n<button type='button' data-path='./' style='border-radius: 15px; padding: 4px 12px; border: 1px solid #9ca3af; cursor: pointer'>📁 File Path</button>"
      },
      {
        name: 'Discussion',
        content:
          "[toc]\n\n## Content\n\n<button type='button' data-path='./' style='border-radius: 15px; padding: 4px 12px; border: 1px solid #9ca3af; cursor: pointer'>📁 File Path</button>"
      },
      {
        name: 'Reading',
        content:
          "[toc]\n\n## Basic Information\n\n**Title:**\n\n**DOI:**\n\n**URL:**\n\n**Published:**\n\n**Journal:**\n\n## Notes\n\n<button type='button' data-path='./' style='border-radius: 15px; padding: 4px 12px; border: 1px solid #9ca3af; cursor: pointer'>📁 File Path</button>"
      },
      {
        name: 'Inspiration',
        content:
          "[toc]\n\n## Content\n\n<button type='button' data-path='./' style='border-radius: 15px; padding: 4px 12px; border: 1px solid #9ca3af; cursor: pointer'>📁 File Path</button>"
      }
    ],
    Theme: 'corporate',
    Updates: {
      mode: 'manual',
      checkOnStartup: true
    },
    Copyright: {
      owner: 'Jie Hua',
      year: currentYear,
      license: 'MIT'
    }
  };
}

function normalizeLegacyToc(markdown) {
  if (typeof markdown !== 'string') {
    return '';
  }

  const pathButton = "<button type='button' data-path='./' style='border-radius: 15px; padding: 4px 12px; border: 1px solid #9ca3af; cursor: pointer'>📁 File Path</button>";

  return markdown
    .replace(/(^|\n)##\s*目录(?=\n|$)/g, '$1[toc]')
    .replace(/(^|\n)\[toc\](?=\n|$)/gi, '$1[toc]')
    .replace(/\[File\s*Path\]\(\.\/\)/gi, pathButton)
    .replace(/<button[^>]*>\s*\[:?file_folder:?\s*File\s*Path\]\(\.\/\)\s*<\/button>/gi, pathButton)
    .replace(/<button[^>]*>\s*\[📁\s*File\s*Path\]\(\.\/\)\s*<\/button>/gi, pathButton);
}

function sanitizeSettings(incoming) {
  const defaults = getDefaultSettings();
  const settings = { ...defaults, ...(incoming || {}) };

  if (!Array.isArray(settings.Categories) || settings.Categories.length === 0) {
    settings.Categories = defaults.Categories;
  }

  settings.Categories = settings.Categories
    .filter((item) => item && typeof item.name === 'string')
    .map((item) => ({
      name: item.name.trim() || 'Untitled',
      content: normalizeLegacyToc(item.content)
    }));

  // Keep bundled templates available even if an older settings file removed them.
  const existingNames = new Set(settings.Categories.map((item) => item.name));
  defaults.Categories.forEach((template) => {
    if (!existingNames.has(template.name)) {
      settings.Categories.push({ ...template });
    }
  });

  if (!settings.Categories.some((c) => c.name === settings.SelectedCategory)) {
    settings.SelectedCategory = settings.Categories[0].name;
  }

  if (typeof settings.Theme !== 'string' || !settings.Theme.trim()) {
    settings.Theme = defaults.Theme;
  }

  if (!settings.Updates || typeof settings.Updates !== 'object') {
    settings.Updates = defaults.Updates;
  }

  if (!['manual', 'auto'].includes(settings.Updates.mode)) {
    settings.Updates.mode = 'manual';
  }

  if (typeof settings.Updates.checkOnStartup !== 'boolean') {
    settings.Updates.checkOnStartup = true;
  }

  if (!settings.Copyright || typeof settings.Copyright !== 'object') {
    settings.Copyright = defaults.Copyright;
  }

  if (typeof settings.Copyright.owner !== 'string' || !settings.Copyright.owner.trim()) {
    settings.Copyright.owner = defaults.Copyright.owner;
  }

  if (!Number.isInteger(settings.Copyright.year)) {
    settings.Copyright.year = defaults.Copyright.year;
  }

  if (typeof settings.Copyright.license !== 'string' || !settings.Copyright.license.trim()) {
    settings.Copyright.license = defaults.Copyright.license;
  }

  return settings;
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), SETTINGS_FILE_NAME);
}

async function ensureSettingsFile() {
  const settingsPath = getSettingsPath();
  if (!existsSync(settingsPath)) {
    const defaultPath = path.join(__dirname, SETTINGS_FILE_NAME);
    if (existsSync(defaultPath)) {
      const data = await fs.readFile(defaultPath, 'utf8');
      const merged = sanitizeSettings(JSON.parse(data));
      await fs.writeFile(settingsPath, JSON.stringify(merged, null, 2), 'utf8');
      return;
    }

    await fs.writeFile(settingsPath, JSON.stringify(getDefaultSettings(), null, 2), 'utf8');
  }

  const current = await fs.readFile(settingsPath, 'utf8');
  const merged = sanitizeSettings(JSON.parse(current));
  await fs.writeFile(settingsPath, JSON.stringify(merged, null, 2), 'utf8');
}

async function readSettings() {
  const settingsPath = getSettingsPath();
  const raw = await fs.readFile(settingsPath, 'utf8');
  return sanitizeSettings(JSON.parse(raw));
}

async function writeSettings(settings) {
  const clean = sanitizeSettings(settings);
  await fs.writeFile(getSettingsPath(), JSON.stringify(clean, null, 2), 'utf8');
  return clean;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 760,
    minHeight: 620,
    show: false,
    frame: false,
    transparent: false,
    roundedCorners: true,
    backgroundColor: '#111111',
    title: APP_NAME,
    icon: path.join(__dirname, 'build/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximize-state', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximize-state', false);
  });

  mainWindow.setMenuBarVisibility(false);
  Menu.setApplicationMenu(null);

  mainWindow.loadFile('index.html');
}

function bindAutoUpdaterEvents() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updates:status', {
      state: 'checking',
      message: 'Checking for updates...'
    });
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('updates:status', {
      state: 'available',
      version: info.version,
      message: `New version ${info.version} is available.`
    });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('updates:status', {
      state: 'not-available',
      message: 'You are using the latest version.'
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('updates:status', {
      state: 'downloading',
      message: `Downloading update ${Math.round(progress.percent)}%`,
      percent: progress.percent
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('updates:status', {
      state: 'downloaded',
      version: info.version,
      message: `Update ${info.version} downloaded. Restart to install.`
    });
  });

  autoUpdater.on('error', (error) => {
    mainWindow?.webContents.send('updates:status', {
      state: 'error',
      message: `Update failed: ${error?.message || 'Unknown error'}`
    });
  });
}

async function checkUpdatesOnStartup() {
  try {
    const settings = await readSettings();
    if (!settings.Updates?.checkOnStartup) {
      return;
    }

    autoUpdater.autoDownload = settings.Updates.mode === 'auto';
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('Update check on startup failed:', error);
  }
}

app.whenReady().then(() => {
  ensureSettingsFile().catch((error) => {
    console.error('Failed to ensure settings file:', error);
  });

  bindAutoUpdaterEvents();
  createWindow();

  setTimeout(() => {
    checkUpdatesOnStartup().catch((error) => {
      console.error('Startup update check error:', error);
    });
  }, 1800);
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

ipcMain.handle('settings:get-path', () => {
  return getSettingsPath();
});

ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:toggle-maximize', () => {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:is-maximized', () => {
  return mainWindow?.isMaximized() || false;
});

ipcMain.handle('settings:get', async () => {
  await ensureSettingsFile();
  return readSettings();
});

ipcMain.handle('settings:save', async (_, newSettings) => {
  return writeSettings(newSettings);
});

ipcMain.handle('updates:check', async () => {
  const settings = await readSettings();
  autoUpdater.autoDownload = settings.Updates.mode === 'auto';
  return autoUpdater.checkForUpdates();
});

ipcMain.handle('updates:download', async () => {
  return autoUpdater.downloadUpdate();
});

ipcMain.handle('updates:install', () => {
  autoUpdater.quitAndInstall();
  return true;
});

ipcMain.on('save-markdown', (event, content, fileName) => {
  dialog.showSaveDialog({
    title: 'Save Markdown File',
    defaultPath: path.join(app.getPath('userData'), fileName || 'defaultFileName.md'),
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(file => {
    if (!file.canceled && file.filePath) {
      const savedPath = file.filePath.toString();
      fs.writeFile(savedPath, content, 'utf8')
        .then(() => {
          event.sender.send('save-markdown-reply', { message: 'File saved successfully.', filePath: savedPath });
        })
        .catch((err) => {
          console.error('Failed to write markdown file:', err);
          event.sender.send('save-markdown-reply', { message: 'Failed to save file.', error: err?.message || String(err) });
        });
    } else {
      event.sender.send('save-markdown-reply', { message: 'Save canceled.' });
      console.error('File path is undefined or saving was canceled');
    }
  }).catch(err => {
    console.error('Failed to save the file:', err);
    try {
      // Notify renderer about failure with error details when possible
      event.sender.send('save-markdown-reply', { message: 'Failed to save file.', error: err?.message || String(err) });
    } catch (e) {
      // ignore if event.sender is not available
    }
  });
});

ipcMain.handle('open-file', async (_, filePath) => {
  try {
    if (!filePath) return { success: false, error: 'No file path provided' };
    const { shell } = require('electron');
    const result = await shell.openPath(filePath);
    // shell.openPath returns an empty string on success, or an error message on failure
    if (typeof result === 'string' && result.length > 0) {
      return { success: false, error: result };
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to open file:', err);
    return { success: false, error: err?.message || String(err) };
  }
});
