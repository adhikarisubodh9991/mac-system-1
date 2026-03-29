const bootScreen = document.getElementById('boot-screen');
const bootProgress = document.getElementById('boot-progress');
const shutdownScreen = document.getElementById('shutdown-screen');
const powerOnBtn = document.getElementById('power-on');
const os = document.getElementById('os');

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
  if (action === 'restart') return bootSystem();
  if (action === 'shutdown') {
    os.classList.add('hidden');
    shutdownScreen.classList.remove('hidden');
    return;
  }
}

function init() {
  setupMenus();
  bootSystem();
}

powerOnBtn.addEventListener('click', init);
init();
