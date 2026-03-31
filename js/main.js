const bootScreen = document.getElementById('boot-screen');
const bootProgress = document.getElementById('boot-progress');
const shutdownScreen = document.getElementById('shutdown-screen');
const powerOnBtn = document.getElementById('power-on');
const os = document.getElementById('os');

const desktopEl = document.getElementById('desktop');
const desktopIconsEl = document.getElementById('desktop-icons');
const activeAppEl = document.getElementById('active-app');
const clockEl = document.getElementById('clock');

const windowManager = new WindowManager(desktopEl, activeAppEl);
const apps = new AppsManager({ windowManager, desktopEl });

const appIdMap = {
  about: 'window-about',
  finder: 'window-finder',
  paint: 'window-paint',
  calculator: 'window-calculator',
  trash: 'window-trash'
};

const desktop = new DesktopManager(desktopEl, desktopIconsEl, (appName) => {
  if (appIdMap[appName]) windowManager.open(appName);
});

function bootSystem() {
  os.classList.add('hidden');
  shutdownScreen.classList.add('hidden');
  bootScreen.classList.remove('hidden');
  bootProgress.style.width = '0%';

  let p = 0;
  const timer = setInterval(() => {
    p += 4;
    bootProgress.style.width = `${Math.min(100, p)}%`;

    if (p >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        bootScreen.classList.add('hidden');
        os.classList.remove('hidden');
        setupDesktop();
        desktop.cleanUpIcons();
        windowManager.open('finder');
      }, 220);
    }
  }, 42);
}

function setupClock() {
  if (!clockEl) return;

  const update = () => {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  update();
  setInterval(update, 1000);
}

function setupWindows() {
  Object.entries(appIdMap).forEach(([key, elementId]) => {
    const winEl = document.getElementById(elementId);
    windowManager.register(key, winEl);
  });
}

function setupMenus() {
  const menuItems = [...document.querySelectorAll('.menu-item')];
  const dropdowns = [...document.querySelectorAll('.dropdown')];

  const closeMenus = () => {
    dropdowns.forEach((d) => d.classList.add('hidden'));
    menuItems.forEach((i) => i.classList.remove('active'));
  };

  menuItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      const target = document.getElementById(`menu-${item.dataset.menu}`);
      const shouldOpen = target.classList.contains('hidden');
      closeMenus();
      if (shouldOpen) {
        item.classList.add('active');
        target.classList.remove('hidden');
      }
    });
  });

  document.addEventListener('click', closeMenus);

  dropdowns.forEach((menu) => {
    menu.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      closeMenus();
      runAction(button.dataset.action);
    });
  });
}

function runAction(action) {
  if (action === 'about') return windowManager.open('about');
  if (action === 'restart') return bootSystem();
  if (action === 'shutdown') {
    os.classList.add('hidden');
    shutdownScreen.classList.remove('hidden');
    return;
  }

  if (action === 'open-finder') return windowManager.open('finder');
  if (action === 'new-note') return windowManager.open('notes');
  if (action === 'close-window') return windowManager.closeActive();

  if (action === 'clean-up') return desktop.cleanUpIcons();
  if (action === 'toggle-grid') return desktop.toggleGrid();
  if (action === 'bring-all-front') return windowManager.bringAllToFront();
  if (action === 'empty-trash') {
    windowManager.open('trash');
    document.getElementById('empty-trash-btn').click();
    return;
  }

  if (['undo', 'redo', 'cut', 'copy', 'paste'].includes(action)) {
    apps.handleEditAction(action);
  }
}

async function setupDesktop() {
  const icons = [
    { key: 'floppy', src: 'assets/floppy disk icon.png', label: 'Finder', app: 'finder', position: 'right-top' },
    { key: 'trash', src: 'assets/trash icon.png', label: 'Trash', app: 'trash', position: 'right-bottom' }
  ];

  await desktop.init(icons);

  desktopEl.addEventListener('click', (event) => {
    if (!event.target.closest('.desktop-icon')) desktop.clearSelection();
  });
}

powerOnBtn.addEventListener('click', bootSystem);
window.addEventListener('resize', () => {
  windowManager.clampToDesktop();
  desktop.cleanUpIcons();
});

async function init() {
  setupWindows();
  setupMenus();
  setupClock();
  apps.init();
  bootSystem();
}

init();
