// themeToggle.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.querySelector('[data-toggle-theme]');
  
    // 定义全局的初始化主题函数
    window.initTheme = (theme, themeColor) => {
      applyTheme(theme || 'auto', themeColor || '#FF80AB');
    };
  
    // 主题应用和切换函数
    function applyTheme(theme, themeColor) {
      document.body.classList.remove('light', 'dark-mode');
      if (theme === 'auto') {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDarkScheme ? 'dark-mode' : 'light';
      }
      document.body.classList.add(theme);
      localStorage.setItem('theme', theme);
  
      // 设置图标和主题色
      if (theme === 'dark-mode') {
        themeToggleButton.innerHTML = '🌙'; // 月亮图标
        themeToggleButton.style.color = '#FFFFFF'; // 月亮图标白色
      } else {
        themeToggleButton.innerHTML = '☀️'; // 太阳图标
        themeToggleButton.style.color = '#FFA500'; // 太阳图标黄色
      }
  
      // 应用自定义主题色到所有按钮
      document.querySelectorAll('button').forEach(button => {
        button.style.backgroundColor = themeColor;
      });
    }
  
    // 从本地存储中读取当前主题
    const currentTheme = localStorage.getItem('theme') || 'light';
    const currentColor = '#FF80AB'; // 默认颜色（如果未设置）
    applyTheme(currentTheme, currentColor);
  
    // 点击按钮时切换主题
    themeToggleButton.addEventListener('click', () => {
      const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark-mode';
      const themeColor = window.settings ? window.settings.themeColor : '#FF80AB';
      applyTheme(newTheme, themeColor);
    });
  });
  