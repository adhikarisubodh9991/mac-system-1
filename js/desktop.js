const FALLBACK_ICONS = {
  finder: 'assets/floppy disk icon.png',
  trash: 'assets/trash icon.png'
};

class DesktopManager {
  constructor(desktopEl, iconsContainerEl, openApp) {
    this.desktopEl = desktopEl;
    this.iconsContainerEl = iconsContainerEl;
    this.openApp = openApp;
    this.icons = [];
    this.selectedIconEl = null;
  }

  async init(iconDefinitions) {
    this.icons = iconDefinitions;
    await this.renderIcons();
  }

  async renderIcons() {
    this.iconsContainerEl.innerHTML = '';
    for (const [index, icon] of this.icons.entries()) {
      const iconEl = document.createElement('article');
      iconEl.className = 'desktop-icon';
      iconEl.dataset.app = icon.app;
      iconEl.dataset.index = String(index);
      iconEl.innerHTML = `
        <div class="icon-image"><img alt="${icon.label}" /></div>
        <div class="icon-label">${icon.label}</div>
      `;
      const img = iconEl.querySelector('img');
      img.src = icon.src || FALLBACK_ICONS[icon.key] || FALLBACK_ICONS.finder;
      const pos = this.getIconPosition(icon, index);
      iconEl.style.left = `${pos.x}px`;
      iconEl.style.top = `${pos.y}px`;
      this.attachIconInteraction(iconEl, icon.app);
      this.iconsContainerEl.appendChild(iconEl);
    }
  }

  getIconPosition(icon, index) {
    if (icon.position === 'right-top') {
      return { x: this.desktopEl.clientWidth - 100, y: 20 + (index * 100) };
    }
    if (icon.position === 'right-bottom') {
      return { x: this.desktopEl.clientWidth - 100, y: this.desktopEl.clientHeight - 120 };
    }
    return { x: 20 + (index * 100), y: 20 };
  }

  attachIconInteraction(iconEl, appName) {
    iconEl.addEventListener('click', (event) => {
      event.stopPropagation();
      this.selectIcon(iconEl);
    });
    iconEl.addEventListener('dblclick', (event) => {
      event.stopPropagation();
      this.openApp(appName);
    });
  }

  selectIcon(iconEl) {
    if (this.selectedIconEl) {
      this.selectedIconEl.classList.remove('selected');
    }
    iconEl.classList.add('selected');
    this.selectedIconEl = iconEl;
  }

  clearSelection() {
    if (this.selectedIconEl) {
      this.selectedIconEl.classList.remove('selected');
      this.selectedIconEl = null;
    }
  }
}

window.DesktopManager = DesktopManager;
