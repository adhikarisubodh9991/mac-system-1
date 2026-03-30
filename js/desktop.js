// Desktop manager: creates icons, downloads icon images, and supports drag/select/open.
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


  attachIconInteraction(iconEl, appName) {
    let dragStart = null;
    let hasMoved = false;

    iconEl.addEventListener('click', (event) => {
      event.stopPropagation();
      this.selectIcon(iconEl);
    });

    iconEl.addEventListener('dblclick', (event) => {
      event.stopPropagation();
      this.openApp(appName);
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
      if (!dragStart) return;

      if (hasMoved && this.gridEnabled) {
        this.snapIconToGrid(iconEl);
      }

      dragStart = null;
      hasMoved = false;
    });
  }

  selectIcon(iconEl) {
    this.iconsContainerEl.querySelectorAll('.desktop-icon').forEach((el) => el.classList.remove('selected'));
    iconEl.classList.add('selected');
    this.selectedIconEl = iconEl;
  }

  clearSelection() {
    this.iconsContainerEl.querySelectorAll('.desktop-icon').forEach((el) => el.classList.remove('selected'));
    this.selectedIconEl = null;
  }

  cleanUpIcons() {
    const nodes = [...this.iconsContainerEl.querySelectorAll('.desktop-icon')];
    nodes.forEach((iconEl, index) => {
      const icon = this.icons[index] || {};
      const pos = this.getIconPosition(icon, index);
      iconEl.style.left = `${pos.x}px`;
      iconEl.style.top = `${pos.y}px`;
    });
  }

  toggleGrid() {
    this.gridEnabled = !this.gridEnabled;
    if (this.gridEnabled) this.cleanUpIcons();
  }

  gridPosition(index) {
    const column = Math.floor(index / 6);
    const row = index % 6;
    return {
      x: 24 + column * 96,
      y: 18 + row * 88
    };
  }

  getIconPosition(icon, index) {
    if (icon.position === 'left-top') {
      return {
        x: 16,
        y: 22
      };
    }

    if (icon.position === 'left-bottom') {
      return {
        x: 16,
        y: Math.max(22, this.desktopEl.clientHeight - 108)
      };
    }

    if (icon.position === 'right-top') {
      return {
        x: Math.max(8, this.desktopEl.clientWidth - 96),
        y: 22
      };
    }

    if (icon.position === 'right-bottom') {
      return {
        x: Math.max(8, this.desktopEl.clientWidth - 96),
        y: Math.max(22, this.desktopEl.clientHeight - 108)
      };
    }

    return this.gridPosition(index);
  }

  snapIconToGrid(iconEl) {
    const x = parseInt(iconEl.style.left || '0', 10);
    const y = parseInt(iconEl.style.top || '0', 10);

    const gx = Math.max(24, Math.round((x - 24) / 96) * 96 + 24);
    const gy = Math.max(18, Math.round((y - 18) / 88) * 88 + 18);

    iconEl.style.left = `${gx}px`;
    iconEl.style.top = `${gy}px`;
  }
}

window.DesktopManager = DesktopManager;
