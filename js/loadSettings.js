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

        // 加载设置
        loadSettings(filePath);
    });

    // 当 Category 变更时，更新 Markdown Content
    document.getElementById('categoryInput').addEventListener('change', updateMarkdownContent);

    // 设置默认日期为当前日期
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

            // 保存设置到全局，以便后续使用
            window.settings = settings;

            // 填充 Author 和 Email
            document.getElementById('authorInput').value = settings.Author || '';
            document.getElementById('emailInput').value = settings.Email || '';

            // 填充 Category，并选中当前的 Category
            const categoryInput = document.getElementById('categoryInput');
            categoryInput.innerHTML = ''; // 清空之前的选项
            settings.Categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categoryInput.appendChild(option);
            });
            categoryInput.value = settings.SelectedCategory || settings.Categories[0].name;

            // 填充 Markdown Content
            updateMarkdownContent();

            // 初始化主题设置
            window.initTheme(settings.theme, settings.themeColor);

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
