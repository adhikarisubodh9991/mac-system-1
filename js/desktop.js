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
    this.gridEnabled = false;
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
    const w = Math.max(this.desktopEl.clientWidth || window.innerWidth, 600);
    const h = Math.max(this.desktopEl.clientHeight || 400, 300);
    if (icon.position === 'right-top') {
      return { x: Math.max(w - 100, 20), y: 20 };
    }
    if (icon.position === 'right-bottom') {
      return { x: Math.max(w - 100, 20), y: Math.max(h - 120, 120) };
    }
    return { x: 20, y: 20 };
  }

  attachIconInteraction(iconEl, appName) {
    let dragStart = null;
    let hasMoved = false;

    iconEl.addEventListener('click', (event) => {
      event.stopPropagation();
      this.selectIcon(iconEl);
    });

    iconEl.addEventListener('mousedown', (event) => {
      const rect = iconEl.getBoundingClientRect();
      const deskRect = this.desktopEl.getBoundingClientRect();
      dragStart = {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        deskLeft: deskRect.left,
        deskTop: deskRect.top
      };
      hasMoved = false;
      this.selectIcon(iconEl);
    });

    window.addEventListener('mousemove', (event) => {
      if (!dragStart) return;
      hasMoved = true;

      const left = Math.max(0, Math.min(event.clientX - dragStart.deskLeft - dragStart.offsetX, this.desktopEl.clientWidth - iconEl.offsetWidth));
      const top = Math.max(0, Math.min(event.clientY - dragStart.deskTop - dragStart.offsetY, this.desktopEl.clientHeight - iconEl.offsetHeight));

      iconEl.style.left = `${left}px`;
      iconEl.style.top = `${top}px`;
    });

    window.addEventListener('mouseup', () => {
      dragStart = null;
      hasMoved = false;
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

  cleanUpIcons() {}
  toggleGrid() { this.gridEnabled = !this.gridEnabled; }
}

window.DesktopManager = DesktopManager;
