// loadSettings.js
const { shell } = require('electron');
const fs = require('fs');

document.addEventListener('DOMContentLoaded', () => {
  console.log('loadSettings.js is loaded');
  
  window.ipcRenderer.invoke('get-settings-path').then((settingsPath) => {
    loadSettings(settingsPath);

    const jsonFilePathElement = document.getElementById('jsonFilePath');
    jsonFilePathElement.textContent = `Configuration File: `;
    const fileLink = document.createElement('a');
    fileLink.href = "#";
    fileLink.textContent = settingsPath;
    fileLink.addEventListener('click', (event) => {
      event.preventDefault();
      shell.openPath(settingsPath).catch(err => {
        console.error('Failed to open the file:', err);
      });
    });
    jsonFilePathElement.appendChild(fileLink);
  });

  document.getElementById('categoryInput').addEventListener('change', updateMarkdownContent);

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateInput').value = today;
});

function loadSettings(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the settings file:', err);
      return;
    }

    try {
      const settings = JSON.parse(data);
      window.settings = settings;

      document.getElementById('authorInput').value = settings.Author || '';
      document.getElementById('emailInput').value = settings.Email || '';

      const categoryInput = document.getElementById('categoryInput');
      categoryInput.innerHTML = '';
      settings.Categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categoryInput.appendChild(option);
      });
      categoryInput.value = settings.SelectedCategory || settings.Categories[0].name;

      updateMarkdownContent();
      if (window.initTheme) {
        window.initTheme(settings.theme, settings.themeColor);
      }
    } catch (parseError) {
      console.error('Error parsing the settings file:', parseError);
    }
  });
}

function updateMarkdownContent() {
  const selectedCategoryName = document.getElementById('categoryInput').value;
  const selectedCategory = window.settings.Categories.find(category => category.name === selectedCategoryName);
  const markdownContent = selectedCategory ? selectedCategory.content : '';
  document.getElementById('markdownContent').value = markdownContent;
}
