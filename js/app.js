const ALL_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro', 'cyberpunk',
  'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe',
  'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee',
  'winter', 'dim', 'nord', 'sunset', 'caramellatte', 'abyss', 'silk'
];

const state = {
  settings: null,
  selectedTemplate: null,
  editorModes: {
    main: 'sv',
    template: 'sv'
  }
};

const editors = {
  main: null,
  template: null
};

const VDITOR_CDN_PATH = 'node_modules/vditor';
const VDITOR_TOOLBAR = [
  { name: 'headings', icon: '<i class="fa-solid fa-heading"></i>' },
  { name: 'bold', icon: '<i class="fa-solid fa-bold"></i>' },
  { name: 'italic', icon: '<i class="fa-solid fa-italic"></i>' },
  { name: 'strike', icon: '<i class="fa-solid fa-strikethrough"></i>' },
  { name: 'quote', icon: '<i class="fa-solid fa-quote-left"></i>' },
  { name: 'list', icon: '<i class="fa-solid fa-list-ul"></i>' },
  { name: 'code', icon: '<i class="fa-solid fa-code"></i>' },
  { name: 'link', icon: '<i class="fa-solid fa-link"></i>' }
];

const els = {};

function byId(id) {
  return document.getElementById(id);
}

function collectElements() {
  [
    'windowMinimizeButton',
    'windowMaximizeButton',
    'windowCloseButton',
    'quickThemeSelect',
    'dateInput',
    'categoryInput',
    'authorInput',
    'emailInput',
    'saveButton',
    'saveStatus',
    'saveStatusDot',
    'openSettingsButton',
    'mainModeSource',
    'mainModeVisual',
    'mainEditor',
    'settingsDialog',
    'tabGeneral',
    'tabTemplates',
    'tabUpdates',
    'tabAbout',
    'panelGeneral',
    'panelTemplates',
    'panelUpdates',
    'panelAbout',
    'settingAuthor',
    'settingEmail',
    'settingTheme',
    'settingUpdateMode',
    'settingCheckOnStartup',
    'templateCategorySelect',
    'addTemplateButton',
    'renameTemplateButton',
    'deleteTemplateButton',
    'templateModeSource',
    'templateModeVisual',
    'templateEditor',
    'checkUpdatesButton',
    'downloadUpdateButton',
    'installUpdateButton',
    'updateStatus',
    'saveSettingsButton',
    'copyrightLine',
    'templateNameDialog',
    'templateNameTitle',
    'templateNameInput',
    'templateNameConfirm',
    'templateNameCancel'
  ].forEach((id) => {
    els[id] = byId(id);
  });
}

function promptTemplateName(title, initialValue = '') {
  return new Promise((resolve) => {
    els.templateNameTitle.textContent = title;
    els.templateNameInput.value = initialValue;

    const cleanup = () => {
      els.templateNameConfirm.removeEventListener('click', onConfirm);
      els.templateNameCancel.removeEventListener('click', onCancel);
      els.templateNameDialog.removeEventListener('cancel', onCancel);
      els.templateNameInput.removeEventListener('keydown', onInputKeydown);
    };

    const onConfirm = () => {
      const value = els.templateNameInput.value.trim();
      cleanup();
      els.templateNameDialog.close();
      resolve(value || null);
    };

    const onCancel = (event) => {
      if (event) {
        event.preventDefault();
      }
      cleanup();
      els.templateNameDialog.close();
      resolve(null);
    };

    const onInputKeydown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onConfirm();
      }
    };

    els.templateNameConfirm.addEventListener('click', onConfirm);
    els.templateNameCancel.addEventListener('click', onCancel);
    els.templateNameDialog.addEventListener('cancel', onCancel);
    els.templateNameInput.addEventListener('keydown', onInputKeydown);

    els.templateNameDialog.showModal();
    els.templateNameInput.focus();
    els.templateNameInput.select();
  });
}

function initThemeSelectOptions() {
  [els.quickThemeSelect, els.settingTheme].forEach((selectEl) => {
    selectEl.innerHTML = '';
    ALL_THEMES.forEach((themeName) => {
      const option = document.createElement('option');
      option.value = themeName;
      option.textContent = themeName;
      selectEl.appendChild(option);
    });
  });
}

function applyTheme(themeName) {
  const finalTheme = ALL_THEMES.includes(themeName) ? themeName : 'corporate';
  document.documentElement.setAttribute('data-theme', finalTheme);
  document.body.setAttribute('data-theme', finalTheme);
  els.quickThemeSelect.value = finalTheme;
  els.settingTheme.value = finalTheme;
}

async function createEditors() {
  await remountEditor('main', state.editorModes.main);
  await remountEditor('template', state.editorModes.template);
}

function createVditorEditor(elId, mode, initialMarkdown = '') {
  return new Promise((resolve) => {
    let editor = null;
    editor = new Vditor(elId, {
      cdn: VDITOR_CDN_PATH,
      lang: 'en_US',
      mode,
      height: '100%',
      toolbar: VDITOR_TOOLBAR,
      preview: {
        mode: 'editor',
        markdown: {
          toc: true,
          sanitize: false
        },
        actions: []
      },
      toolbarConfig: {
        pin: true
      },
      cache: {
        enable: false
      },
      after: () => {
        if (initialMarkdown) {
          editor.setValue(initialMarkdown);
        }
        resolve(editor);
      }
    });
  });
}

function updateEditorModeButtons(editorKey, isSource) {
  if (editorKey === 'main') {
    els.mainModeSource.classList.toggle('btn-primary', isSource);
    els.mainModeSource.classList.toggle('btn-outline', !isSource);
    els.mainModeVisual.classList.toggle('btn-primary', !isSource);
    els.mainModeVisual.classList.toggle('btn-outline', isSource);
    return;
  }

  els.templateModeSource.classList.toggle('btn-primary', isSource);
  els.templateModeSource.classList.toggle('btn-outline', !isSource);
  els.templateModeVisual.classList.toggle('btn-primary', !isSource);
  els.templateModeVisual.classList.toggle('btn-outline', isSource);
}

async function remountEditor(editorKey, mode) {
  const existingEditor = editors[editorKey];
  const previousMarkdown = existingEditor ? existingEditor.getMarkdown() : '';

  if (existingEditor && typeof existingEditor.destroy === 'function') {
    existingEditor.destroy();
  }

  const targetId = editorKey === 'main' ? 'mainEditor' : 'templateEditor';
  const instance = await createVditorEditor(targetId, mode, previousMarkdown);

  editors[editorKey] = {
    getMarkdown: () => instance.getValue(),
    setMarkdown: (value) => instance.setValue(typeof value === 'string' ? value : ''),
    destroy: () => instance.destroy()
  };

  state.editorModes[editorKey] = mode;
}

async function setEditorMode(editorKey, mode) {
  const isSource = mode === 'source';
  const vditorMode = isSource ? 'sv' : 'wysiwyg';
  updateEditorModeButtons(editorKey, isSource);

  if (state.editorModes[editorKey] === vditorMode) {
    return;
  }

  await remountEditor(editorKey, vditorMode);
}

function updateSaveStatus(text, state = 'idle') {
  els.saveStatus.textContent = text;
  els.saveStatusDot.classList.toggle('status-dot-ok', state === 'ok');
  els.saveStatusDot.classList.toggle('status-dot-fail', state === 'fail');
}

function updateUpdateStatus(message, type = 'info') {
  els.updateStatus.className = `alert ${type === 'error' ? 'alert-error' : 'alert-info'} text-sm`;
  els.updateStatus.textContent = `Update status: ${message}`;
}

function populateMainForm() {
  const { settings } = state;
  els.authorInput.value = settings.Author || '';
  els.emailInput.value = settings.Email || '';

  els.categoryInput.innerHTML = '';
  settings.Categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    els.categoryInput.appendChild(option);
  });

  els.categoryInput.value = settings.SelectedCategory || settings.Categories[0]?.name || '';
  syncMainContentByCategory();
}

function syncMainContentByCategory() {
  const categoryName = els.categoryInput.value;
  const selected = state.settings.Categories.find((item) => item.name === categoryName);
  state.settings.SelectedCategory = categoryName;
  editors.main.setMarkdown(selected ? selected.content : '');
}

function populateSettingsDialog() {
  const { settings } = state;
  els.settingAuthor.value = settings.Author || '';
  els.settingEmail.value = settings.Email || '';
  els.settingTheme.value = settings.Theme || 'corporate';
  els.settingUpdateMode.value = settings.Updates?.mode || 'manual';
  els.settingCheckOnStartup.checked = !!settings.Updates?.checkOnStartup;

  els.templateCategorySelect.innerHTML = '';
  settings.Categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    els.templateCategorySelect.appendChild(option);
  });

  els.templateCategorySelect.value = settings.SelectedCategory || settings.Categories[0]?.name || '';
  syncTemplateEditorByCategory();
}

function syncTemplateEditorByCategory() {
  const categoryName = els.templateCategorySelect.value;
  state.selectedTemplate = state.settings.Categories.find((item) => item.name === categoryName) || null;
  editors.template.setMarkdown(state.selectedTemplate ? state.selectedTemplate.content : '');
}

function switchTab(tabId) {
  const mapping = {
    tabGeneral: 'panelGeneral',
    tabTemplates: 'panelTemplates',
    tabUpdates: 'panelUpdates',
    tabAbout: 'panelAbout'
  };

  Object.keys(mapping).forEach((tabKey) => {
    const active = tabId === tabKey;
    els[tabKey].classList.toggle('tab-active', active);
    els[mapping[tabKey]].classList.toggle('hidden', !active);
  });
}

function createDefaultFileName() {
  const date = els.dateInput.value || new Date().toISOString().slice(0, 10);
  const category = (els.categoryInput.value || 'note').replace(/\s+/g, '_');
  return `${category}_${date}.md`;
}

function buildMarkdownOutput() {
  const date = els.dateInput.value;
  const category = els.categoryInput.value;
  const author = els.authorInput.value.trim();
  const email = els.emailInput.value.trim();
  const content = editors.main.getMarkdown();
  const yamlContent = `---\ndate: ${date}\ncategory: ${category}\nauthor: ${author}\nemail: ${email}\n---\n\n`;
  return yamlContent + content;
}

function syncWindowMaxButton(isMaximized) {
  els.windowMaximizeButton.textContent = isMaximized ? '❐' : '▢';
  document.body.classList.toggle('window-maximized', isMaximized);
}

function applyCopyrightLine() {
  const info = state.settings.Copyright || {};
  const year = info.year || new Date().getFullYear();
  const owner = info.owner || 'Jie Hua';
  const license = info.license || 'MIT';
  els.copyrightLine.textContent = `Copyright © ${year} ${owner} | License: ${license}`;
}

function saveSettingsFromDialog() {
  state.settings.Author = els.settingAuthor.value.trim();
  state.settings.Email = els.settingEmail.value.trim();
  state.settings.Theme = els.settingTheme.value;
  state.settings.Updates = {
    mode: els.settingUpdateMode.value,
    checkOnStartup: els.settingCheckOnStartup.checked
  };

  if (state.selectedTemplate) {
    state.selectedTemplate.content = editors.template.getMarkdown();
  }

  state.settings.SelectedCategory = els.categoryInput.value;
  return window.lablogAPI.saveSettings(state.settings);
}

function bindWindowControls() {
  els.windowMinimizeButton.addEventListener('click', () => window.lablogAPI.minimizeWindow());
  els.windowMaximizeButton.addEventListener('click', () => window.lablogAPI.toggleMaximizeWindow());
  els.windowCloseButton.addEventListener('click', () => window.lablogAPI.closeWindow());

  window.lablogAPI.isWindowMaximized().then(syncWindowMaxButton);
  window.lablogAPI.onWindowMaximizeStateChange(syncWindowMaxButton);
}

function bindEvents() {
  bindWindowControls();

  els.categoryInput.addEventListener('change', syncMainContentByCategory);

  els.mainModeSource.addEventListener('click', () => setEditorMode('main', 'source'));
  els.mainModeVisual.addEventListener('click', () => setEditorMode('main', 'visual'));
  els.templateModeSource.addEventListener('click', () => setEditorMode('template', 'source'));
  els.templateModeVisual.addEventListener('click', () => setEditorMode('template', 'visual'));

  els.quickThemeSelect.addEventListener('change', async (event) => {
    const selectedTheme = event.target.value;
    applyTheme(selectedTheme);
    state.settings.Theme = selectedTheme;
    await window.lablogAPI.saveSettings(state.settings);
  });

  els.saveButton.addEventListener('click', () => {
    updateSaveStatus('Saving...', 'idle');
    window.lablogAPI.saveMarkdown(buildMarkdownOutput(), createDefaultFileName());
  });

  window.lablogAPI.onSaveMarkdownReply((message) => {
    const success = message.toLowerCase().includes('success');
    updateSaveStatus(message, success ? 'ok' : 'fail');
  });

  els.openSettingsButton.addEventListener('click', () => {
    populateSettingsDialog();
    switchTab('tabGeneral');
    els.settingsDialog.showModal();
  });

  ['tabGeneral', 'tabTemplates', 'tabUpdates', 'tabAbout'].forEach((id) => {
    els[id].addEventListener('click', () => switchTab(id));
  });

  els.templateCategorySelect.addEventListener('change', syncTemplateEditorByCategory);

  els.addTemplateButton.addEventListener('click', async () => {
    const name = await promptTemplateName('Enter a new category name');
    if (!name) {
      return;
    }

    const cleaned = name.trim();
    if (!cleaned) {
      return;
    }
    if (state.settings.Categories.some((item) => item.name === cleaned)) {
      window.alert('Category already exists.');
      return;
    }

    state.settings.Categories.push({ name: cleaned, content: '' });
    populateSettingsDialog();
    els.templateCategorySelect.value = cleaned;
    syncTemplateEditorByCategory();
  });

  els.renameTemplateButton.addEventListener('click', async () => {
    const oldName = els.templateCategorySelect.value;
    const newName = await promptTemplateName('Rename category', oldName);
    if (!newName) {
      return;
    }

    const cleaned = newName.trim();
    if (!cleaned || cleaned === oldName) {
      return;
    }
    if (state.settings.Categories.some((item) => item.name === cleaned)) {
      window.alert('Category already exists.');
      return;
    }

    const target = state.settings.Categories.find((item) => item.name === oldName);
    if (target) {
      target.name = cleaned;
    }
    if (state.settings.SelectedCategory === oldName) {
      state.settings.SelectedCategory = cleaned;
    }
    if (els.categoryInput.value === oldName) {
      els.categoryInput.value = cleaned;
    }

    populateSettingsDialog();
    els.templateCategorySelect.value = cleaned;
    syncTemplateEditorByCategory();
  });

  els.deleteTemplateButton.addEventListener('click', () => {
    if (state.settings.Categories.length <= 1) {
      window.alert('At least one category is required.');
      return;
    }

    const current = els.templateCategorySelect.value;
    if (!window.confirm(`Delete category "${current}"?`)) {
      return;
    }

    state.settings.Categories = state.settings.Categories.filter((item) => item.name !== current);
    if (state.settings.SelectedCategory === current) {
      state.settings.SelectedCategory = state.settings.Categories[0].name;
    }

    populateSettingsDialog();
    populateMainForm();
  });

  els.saveSettingsButton.addEventListener('click', async () => {
    try {
      const saved = await saveSettingsFromDialog();
      state.settings = saved;
      applyTheme(saved.Theme || 'corporate');
      populateMainForm();
      applyCopyrightLine();
      els.settingsDialog.close();
    } catch (error) {
      window.alert(`Failed to save settings: ${error.message}`);
    }
  });

  els.checkUpdatesButton.addEventListener('click', async () => {
    try {
      updateUpdateStatus('Checking for updates...');
      await window.lablogAPI.checkForUpdates();
    } catch (error) {
      updateUpdateStatus(`Check failed: ${error.message}`, 'error');
    }
  });

  els.downloadUpdateButton.addEventListener('click', async () => {
    try {
      updateUpdateStatus('Downloading update...');
      await window.lablogAPI.downloadUpdate();
    } catch (error) {
      updateUpdateStatus(`Download failed: ${error.message}`, 'error');
    }
  });

  els.installUpdateButton.addEventListener('click', async () => {
    try {
      updateUpdateStatus('Restarting to install update...');
      await window.lablogAPI.installUpdate();
    } catch (error) {
      updateUpdateStatus(`Install failed: ${error.message}`, 'error');
    }
  });

  window.lablogAPI.onUpdateStatus((payload) => {
    const isError = payload?.state === 'error';
    updateUpdateStatus(payload?.message || 'Unknown update state', isError ? 'error' : 'info');
  });
}

async function init() {
  collectElements();
  initThemeSelectOptions();
  await createEditors();
  bindEvents();

  const today = new Date().toISOString().split('T')[0];
  els.dateInput.value = today;

  state.settings = await window.lablogAPI.getSettings();
  applyTheme(state.settings.Theme || 'corporate');
  populateMainForm();
  populateSettingsDialog();
  applyCopyrightLine();

  if (typeof themeChange === 'function') {
    themeChange(false);
  }

  updateSaveStatus('Not saved yet', 'idle');
  await setEditorMode('main', 'source');
  await setEditorMode('template', 'source');
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch((error) => {
    window.alert(`Application failed to initialize: ${error.message}`);
  });
});
