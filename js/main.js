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

powerOnBtn.addEventListener('click', bootSystem);
bootSystem();
