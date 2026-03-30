class WindowManager {
  constructor(desktopEl, activeAppEl) {
    this.desktopEl = desktopEl;
    this.activeAppEl = activeAppEl;
    this.windows = new Map();
    this.z = 20;
    this.activeWindowId = null;
  }

  register(id, windowEl) {
    this.windows.set(id, windowEl);
    const closeBtn = windowEl.querySelector('.close');
    closeBtn?.addEventListener('click', () => this.close(id));
    windowEl.addEventListener('mousedown', () => this.bringToFront(id));
  }

  open(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.classList.remove('hidden');
    win.classList.add('opening');
    this.bringToFront(id);
    requestAnimationFrame(() => {
      win.classList.remove('opening');
    });
  }

  close(id) {
    const win = this.windows.get(id);
    if (!win) return;
    win.classList.add('closing');
    setTimeout(() => {
      win.classList.add('hidden');
      win.classList.remove('closing');
      if (this.activeWindowId === id) {
        this.activeWindowId = null;
      }
    }, 120);
  }

  bringToFront(id) {
    const win = this.windows.get(id);
    if (!win) return;
    this.z += 1;
    win.style.zIndex = String(this.z);
    this.activeWindowId = id;
  }

  findWindowId(windowEl) {
    for (const [id, el] of this.windows.entries()) {
      if (el === windowEl) return id;
    }
    return null;
  }
}

window.WindowManager = WindowManager;
