// saveMarkdown.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('saveMarkdown.js is loaded');
  
    document.getElementById('saveButton').addEventListener('click', () => {
      console.log('Save button clicked');
      
      const date = document.getElementById('dateInput').value;
      const category = document.getElementById('categoryInput').value;
      const author = document.getElementById('authorInput').value;
      const email = document.getElementById('emailInput').value;
      const markdownContent = document.getElementById('markdownContent').value;
  
      const yamlContent = `---\ndate: ${date}\ncategory: ${category}\nauthor: ${author}\nemail: ${email}\n---\n\n`;
      const completeContent = yamlContent + markdownContent;
      const defaultFileName = `${category.replace(/\s+/g, '_')}_${date}.md`;
  
      window.ipcRenderer.send('save-markdown', completeContent, defaultFileName);
    });
  });
  