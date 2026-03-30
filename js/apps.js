class AppsManager {
  constructor({ windowManager, desktopEl }) {
    this.windowManager = windowManager;
    this.desktopEl = desktopEl;
    this.files = [];
  }

  init() {
    this.bootstrapFiles();
    this.renderFinderFiles();
    this.setupCalculator();
  }

  bootstrapFiles() {
    this.files = [
      { name: 'Calculator', type: 'Application', action: () => this.openWindow('calculator') },
      { name: 'About This Macintosh', type: 'Application', action: () => this.openWindow('about') }
    ];
  }

  renderFinderFiles() {
    const container = document.getElementById('finder-files');
    if (!container) return;
    container.innerHTML = '';

    for (const file of this.files) {
      const row = document.createElement('div');
      row.className = 'finder-row';

      const name = document.createElement('span');
      name.textContent = file.name;

      const type = document.createElement('span');
      type.textContent = file.type;

      const actionCell = document.createElement('span');
      const openBtn = document.createElement('button');
      openBtn.className = 'finder-open';
      openBtn.textContent = 'Open';

      openBtn.addEventListener('click', () => file.action());

      row.addEventListener('dblclick', () => file.action());

      actionCell.appendChild(openBtn);
      row.append(name, type, actionCell);
      container.appendChild(row);
    }
  }

  openWindow(name) {
    this.windowManager.open(name);
  }

  setupCalculator() {
    const display = document.getElementById('calc-display');
    const grid = document.getElementById('calc-grid');
    if (!grid) return;

    const keys = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];
    let expr = '';

    keys.forEach((key) => {
      const button = document.createElement('button');
      button.textContent = key;
      grid.appendChild(button);
      button.addEventListener('click', () => {
        if (key === 'C') {
          expr = '';
          display.value = '0';
          return;
        }
        if (key === '=') {
          try {
            const result = Function(`"use strict"; return (${expr || 0})`)();
            expr = String(result);
            display.value = expr;
          } catch {
            expr = '';
            display.value = 'Error';
          }
          return;
        }
        expr += key;
        display.value = expr;
      });
    });
  }

  handleEditAction(action) {
    // Placeholder for future edit actions
  }
}

window.AppsManager = AppsManager;
