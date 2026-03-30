const bootScreen = document.getElementById('boot-screen');
const bootProgress = document.getElementById('boot-progress');
const shutdownScreen = document.getElementById('shutdown-screen');
const powerOnBtn = document.getElementById('power-on');
const os = document.getElementById('os');
const desktopEl = document.getElementById('desktop');
const desktopIconsEl = document.getElementById('desktop-icons');

const windowManager = new WindowManager(desktopEl, null);
const desktop = new DesktopManager(desktopEl, desktopIconsEl, (appName) => {
  if (appName === 'finder') windowManager.open('finder');
  if (appName === 'trash') windowManager.open('trash');
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
      }, 220);
    }
  }, 42);
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
}

function setupWindows() {
  const finderEl = document.getElementById('window-finder');
  const aboutEl = document.getElementById('window-about');
  const trashEl = document.getElementById('window-trash');
  windowManager.register('finder', finderEl);
  windowManager.register('about', aboutEl);
  windowManager.register('trash', trashEl);
}

async function setupDesktop() {
  const icons = [
    { key: 'floppy', src: 'assets/floppy disk icon.png', label: 'system 1.1 finder 1', app: 'finder', position: 'right-top' },
    { key: 'trash', src: 'assets/trash icon.png', label: 'Trash', app: 'trash', position: 'right-bottom' }
  ];
  await desktop.init(icons);
  desktopEl.addEventListener('click', (event) => {
    if (!event.target.closest('.desktop-icon')) desktop.clearSelection();
  });
}

function init() {
  setupWindows();
  setupMenus();
  bootSystem();
}

powerOnBtn.addEventListener('click', init);
init();
