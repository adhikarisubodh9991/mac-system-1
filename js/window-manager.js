// Window manager: handles dragging, resizing, stacking, and animated open/close.
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
    this.attachDrag(windowEl);
    this.attachResize(windowEl);

    const closeBtn = windowEl.querySelector('.close');
    const zoomBtn = windowEl.querySelector('.zoom');

    closeBtn?.addEventListener('click', () => this.close(id));
    zoomBtn?.addEventListener('click', () => this.toggleZoom(id));

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
        if (this.activeAppEl) this.activeAppEl.textContent = 'Finder';
      }
    }, 120);
  }

  bringToFront(id) {
    const win = this.windows.get(id);
    if (!win) return;

    this.z += 1;
    win.style.zIndex = String(this.z);
    this.activeWindowId = id;

    const title = win.querySelector('.title-bar span')?.textContent || 'Finder';
    if (this.activeAppEl) this.activeAppEl.textContent = title;
  }

  bringAllToFront() {
    const visibleWindows = [];
    for (const [id, win] of this.windows.entries()) {
      if (!win.classList.contains('hidden')) {
        visibleWindows.push({ id, win });
      }
    }

    // Bring all visible windows to front in order
    visibleWindows.forEach(({ id, win }) => {
      this.z += 1;
      win.style.zIndex = String(this.z);
    });

    // Update active window title to the topmost one
    if (visibleWindows.length > 0) {
      const topmost = visibleWindows[visibleWindows.length - 1];
      this.activeWindowId = topmost.id;
      const title = topmost.win.querySelector('.title-bar span')?.textContent || 'Finder';
      if (this.activeAppEl) this.activeAppEl.textContent = title;
    }
  }

  closeActive() {
    if (!this.activeWindowId) return;
    this.close(this.activeWindowId);
  }

  getActiveWindowId() {
    return this.activeWindowId;
  }

  toggleZoom(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (win.dataset.maximized === 'true') {
      win.style.left = win.dataset.prevLeft;
      win.style.top = win.dataset.prevTop;
      win.style.width = win.dataset.prevWidth;
      win.style.height = win.dataset.prevHeight;
      win.dataset.maximized = 'false';
      return;
    }

    win.dataset.prevLeft = win.style.left;
    win.dataset.prevTop = win.style.top;
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;

    win.style.left = '8px';
    win.style.top = '8px';
    win.style.width = `${this.desktopEl.clientWidth - 16}px`;
    win.style.height = `${this.desktopEl.clientHeight - 16}px`;
    win.dataset.maximized = 'true';
  }

  attachDrag(win) {
    const titleBar = win.querySelector('.title-bar');
    if (!titleBar) return;

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titleBar.addEventListener('mousedown', (event) => {
      if (event.target.closest('.w-btn')) return;
      dragging = true;

      const rect = win.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;

      const id = this.findWindowId(win);
      if (id) this.bringToFront(id);
    });

    window.addEventListener('mousemove', (event) => {
      if (!dragging) return;

      const deskRect = this.desktopEl.getBoundingClientRect();
      const left = Math.max(0, Math.min(event.clientX - deskRect.left - offsetX, this.desktopEl.clientWidth - win.offsetWidth));
      const top = Math.max(0, Math.min(event.clientY - deskRect.top - offsetY, this.desktopEl.clientHeight - win.offsetHeight));

      win.style.left = `${left}px`;
      win.style.top = `${top}px`;
    });

    window.addEventListener('mouseup', () => {
      dragging = false;
    });
  }

  attachResize(win) {
    const handle = win.querySelector('.resize-handle');
    if (!handle) return;

    let resizing = false;
    let startX = 0;
    let startY = 0;
    let startW = 0;
    let startH = 0;

    handle.addEventListener('mousedown', (event) => {
      event.preventDefault();
      resizing = true;
      startX = event.clientX;
      startY = event.clientY;
      startW = win.offsetWidth;
      startH = win.offsetHeight;
      const id = this.findWindowId(win);
      if (id) this.bringToFront(id);
    });

    window.addEventListener('mousemove', (event) => {
      if (!resizing) return;

      const width = Math.max(220, Math.min(startW + (event.clientX - startX), this.desktopEl.clientWidth - win.offsetLeft));
      const height = Math.max(130, Math.min(startH + (event.clientY - startY), this.desktopEl.clientHeight - win.offsetTop));

      win.style.width = `${width}px`;
      win.style.height = `${height}px`;
    });

    window.addEventListener('mouseup', () => {
      resizing = false;
    });
  }

  clampToDesktop() {
    for (const win of this.windows.values()) {
      if (win.classList.contains('hidden')) continue;

      const left = parseInt(win.style.left || '0', 10);
      const top = parseInt(win.style.top || '0', 10);
      const maxLeft = Math.max(0, this.desktopEl.clientWidth - win.offsetWidth);
      const maxTop = Math.max(0, this.desktopEl.clientHeight - win.offsetHeight);

      win.style.left = `${Math.min(left, maxLeft)}px`;
      win.style.top = `${Math.min(top, maxTop)}px`;
    }
  }

  findWindowId(windowEl) {
    for (const [id, el] of this.windows.entries()) {
      if (el === windowEl) return id;
    }
    return null;
  }
}

window.WindowManager = WindowManager;
