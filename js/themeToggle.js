document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.createElement('div');
    themeToggle.id = 'themeToggle';
    themeToggle.classList.add('moon'); // 默认显示月亮图标
    themeToggle.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M21.752 15.002a9.004 9.004 0 01-10.49-10.49 9.004 9.004 0 1010.49 10.49z" fill="#F8F8F2"></path>
      </svg>
    `;
  
    themeToggle.addEventListener('click', () => {
      if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = `
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" fill="#FFA500"></circle>
            <line x1="12" y1="1" x2="12" y2="4" stroke="#FFA500" stroke-width="2"></line>
            <line x1="12" y1="20" x2="12" y2="23" stroke="#FFA500" stroke-width="2"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#FFA500" stroke-width="2"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#FFA500" stroke-width="2"></line>
            <line x1="1" y1="12" x2="4" y2="12" stroke="#FFA500" stroke-width="2"></line>
            <line x1="20" y1="12" x2="23" y2="12" stroke="#FFA500" stroke-width="2"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#FFA500" stroke-width="2"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#FFA500" stroke-width="2"></line>
          </svg>
        `;
        themeToggle.classList.remove('sun');
        themeToggle.classList.add('moon');
      } else {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = `
          <svg viewBox="0 0 24 24">
            <path d="M21.752 15.002a9.004 9.004 0 01-10.49-10.49 9.004 9.004 0 1010.49 10.49z" fill="#F8F8F2"></path>
          </svg>
        `;
        themeToggle.classList.remove('moon');
        themeToggle.classList.add('sun');
      }
    });
  
    document.body.appendChild(themeToggle);
  });
  
  function applyTheme(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
      themeToggle.classList.remove('moon');
      themeToggle.classList.add('sun');
    } else {
      document.body.classList.remove('dark-mode');
      themeToggle.classList.remove('sun');
      themeToggle.classList.add('moon');
    }
  }
  