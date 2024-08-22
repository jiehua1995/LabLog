const { ipcRenderer, shell } = require('electron');
const path = require('path');
const fs = require('fs');

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.invoke('get-install-path').then((installPath) => {
    const filePath = path.join(installPath, 'settings.json');
    const jsonFilePathElement = document.getElementById('jsonFilePath');
    jsonFilePathElement.textContent = `Configuration File: `;
    const fileLink = document.createElement('a');
    fileLink.href = "#";
    fileLink.textContent = filePath;
    fileLink.addEventListener('click', (event) => {
      event.preventDefault();
      shell.openPath(filePath).catch(err => {
        console.error('Failed to open the file:', err);
      });
    });
    jsonFilePathElement.appendChild(fileLink);

    loadSettings(filePath);
  });

  // 当 Category 变更时，更新 Markdown Content
  document.getElementById('categoryInput').addEventListener('change', () => {
    ipcRenderer.invoke('get-install-path').then((installPath) => {
      const filePath = path.join(installPath, 'settings.json');
      loadSettings(filePath);
    });
  });
  
  // 设置默认日期
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateInput').value = today;
});

function loadSettings(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const settings = JSON.parse(data);

    document.getElementById('authorInput').value = settings.Author || '';
    document.getElementById('emailInput').value = settings.Email || '';
    updateMarkdownContent(settings);

    if (settings.theme) {
      applyTheme(settings.theme);
    }
  } catch (error) {
    console.error('Error reading the settings file:', error);
  }
}

function updateMarkdownContent(settings) {
  const selectedCategory = document.getElementById('categoryInput').value;
  const markdownContent = settings.Category[selectedCategory] || '';
  document.getElementById('markdownContent').value = markdownContent;  // 直接将内容加载到 textarea
}