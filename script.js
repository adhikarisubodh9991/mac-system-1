const bootScreen = document.getElementById("boot-screen");
const bootProgress = document.getElementById("boot-progress");
const os = document.getElementById("os");
const shutdownScreen = document.getElementById("shutdown-screen");
const powerOnBtn = document.getElementById("power-on");
const desktop = document.getElementById("desktop");
const activeAppLabel = document.getElementById("active-app");
const clock = document.getElementById("clock");

const windows = {
  about: document.getElementById("window-about"),
  finder: document.getElementById("window-finder"),
  notes: document.getElementById("window-notes"),
  paint: document.getElementById("window-paint"),
  calculator: document.getElementById("window-calculator"),
  control: document.getElementById("window-control"),
  trash: document.getElementById("window-trash"),
};

let z = 10;
let dragState = null;
let activeWindow = null;
let selectedIcon = null;
let iconGridEnabled = false;

function bootSystem() {
  shutdownScreen.classList.add("hidden");
  bootScreen.classList.remove("hidden");
  os.classList.add("hidden");
  
  let p = 0;
  const timer = setInterval(() => {
    p += 4;
    bootProgress.style.width = `${Math.min(p, 100)}%`;
    if (p >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        bootScreen.classList.add("hidden");
        os.classList.remove("hidden");
        openWindow("finder");
      }, 250);
    }
  }, 45);
}

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function bringToFront(win, appName = "Finder") {
  z += 1;
  win.style.zIndex = z;
  activeWindow = win;
  activeAppLabel.textContent = appName;
}

function openWindow(name) {
  const win = windows[name];
  if (!win) return;
  win.classList.remove("hidden");
  bringToFront(win, win.querySelector(".title-bar span").textContent);
}

function closeWindowById(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.classList.add("hidden");
  if (activeWindow === win) {
    activeWindow = null;
    activeAppLabel.textContent = "Finder";
  }
}

function setupWindowInteractions() {
  Object.values(windows).forEach((win) => {
    const bar = win.querySelector(".title-bar");
    bar.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("w-btn")) return;
      bringToFront(win, bar.querySelector("span").textContent);
      const rect = win.getBoundingClientRect();
      dragState = {
        win,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
    });

    win.addEventListener("mousedown", () => bringToFront(win, bar.querySelector("span").textContent));

    const closeBtn = win.querySelector(".close");
    closeBtn.addEventListener("click", () => closeWindowById(closeBtn.dataset.close));

    const zoomBtn = win.querySelector(".zoom");
    zoomBtn.addEventListener("click", () => {
      if (win.dataset.maximized === "true") {
        // Restore previous size
        win.style.width = win.dataset.prevW;
        win.style.height = win.dataset.prevH;
        win.style.left = win.dataset.prevL;
        win.style.top = win.dataset.prevT;
        win.dataset.maximized = "false";
      } else {
        const dw = desktop.clientWidth;
        const dh = desktop.clientHeight;
        win.dataset.prevW = win.style.width;
        win.dataset.prevH = win.style.height;
        win.dataset.prevL = win.style.left;
        win.dataset.prevT = win.style.top;
        win.style.left = "10px";
        win.style.top = "10px";
        win.style.width = `${Math.max(240, dw - 20)}px`;
        win.style.height = `${Math.max(120, dh - 20)}px`;
        win.dataset.maximized = "true";
      }
    });
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragState) return;
    const { win, offsetX, offsetY } = dragState;
    const deskRect = desktop.getBoundingClientRect();
    const nextLeft = e.clientX - deskRect.left - offsetX;
    const nextTop = e.clientY - deskRect.top - offsetY;
    const left = Math.max(0, Math.min(nextLeft, desktop.clientWidth - win.offsetWidth));
    const top = Math.max(0, Math.min(nextTop, desktop.clientHeight - win.offsetHeight));
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  });

  window.addEventListener("mouseup", () => {
    dragState = null;
  });
}

function setupDesktopIcons() {
  document.querySelectorAll(".desktop-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      document.querySelectorAll(".desktop-icon").forEach((i) => i.classList.remove("selected"));
      icon.classList.add("selected");
      selectedIcon = icon;
    });

    icon.addEventListener("dblclick", () => {
      openWindow(icon.dataset.open);
    });
  });

  desktop.addEventListener("click", (e) => {
    if (!e.target.closest(".desktop-icon")) {
      document.querySelectorAll(".desktop-icon").forEach((i) => i.classList.remove("selected"));
      selectedIcon = null;
    }
  });
}

function setupFinderList() {
  document.querySelectorAll(".finder-list li").forEach((item) => {
    item.addEventListener("dblclick", () => openWindow(item.dataset.open));
  });
}

function setupMenus() {
  const menuItems = document.querySelectorAll(".menu-item");
  const menus = document.querySelectorAll(".dropdown");

  const closeMenus = () => {
    menus.forEach((m) => m.classList.add("hidden"));
    menuItems.forEach((i) => i.classList.remove("active"));
  };

  menuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const menuName = item.dataset.menu;
      const target = document.getElementById(`menu-${menuName}`);
      const wasHidden = target.classList.contains("hidden");
      closeMenus();
      if (wasHidden) {
        target.classList.remove("hidden");
        item.classList.add("active");
      }
    });
  });

  document.addEventListener("click", closeMenus);

  menus.forEach((menu) => {
    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      closeMenus();
      runAction(btn.dataset.action);
    });
  });
}

function runAction(action) {
  switch (action) {
    case "about":
      openWindow("about");
      break;
    case "restart":
      Object.values(windows).forEach((w) => w.classList.add("hidden"));
      bootProgress.style.width = "0%";
      bootSystem();
      break;
    case "shutdown":
      os.classList.add("hidden");
      shutdownScreen.classList.remove("hidden");
      break;
    case "new-note":
      openWindow("notes");
      break;
    case "open-finder":
      openWindow("finder");
      break;
    case "close-window":
      if (activeWindow) activeWindow.classList.add("hidden");
      activeAppLabel.textContent = "Finder";
      break;
    case "undo":
      document.execCommand("undo");
      break;
    case "cut":
      document.execCommand("cut");
      break;
    case "copy":
      document.execCommand("copy");
      break;
    case "paste":
      document.execCommand("paste");
      break;
    case "toggle-grid":
      iconGridEnabled = !iconGridEnabled;
      if (iconGridEnabled) cleanUpIcons(true);
      break;
    case "clean-up":
      cleanUpIcons(true);
      break;
    case "empty-trash":
      emptyTrash();
      break;
    case "bring-all-front":
      bringAllToFront();
      break;
  }
}

function cleanUpIcons(force = false) {
  if (!force && !iconGridEnabled) return;
  const icons = [...document.querySelectorAll(".desktop-icon")];
  const colX = [26, 128, 230, 332, 434, 536, 638, 740];
  icons.forEach((icon, i) => {
    const col = i % colX.length;
    const row = Math.floor(i / colX.length);
    icon.style.left = `${colX[col]}px`;
    icon.style.top = `${42 + row * 90}px`;
  });
}

function bringAllToFront() {
  Object.values(windows)
    .filter((w) => !w.classList.contains("hidden"))
    .forEach((w) => bringToFront(w, w.querySelector(".title-bar span").textContent));
}

function emptyTrash() {
  document.getElementById("trash-status").textContent = "Trash emptied.";
  openWindow("trash");
}

function setupNotes() {
  const notesArea = document.getElementById("notes-area");
  notesArea.value = localStorage.getItem("system1-note") || "";
  notesArea.addEventListener("input", () => {
    localStorage.setItem("system1-note", notesArea.value);
  });
}

function setupPaint() {
  const canvas = document.getElementById("paint-canvas");
  const ctx = canvas.getContext("2d");
  const penBtn = document.getElementById("paint-pen");
  const eraserBtn = document.getElementById("paint-eraser");
  const clearBtn = document.getElementById("paint-clear");

  let drawing = false;
  let erasing = false;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const p = getPos(e);
    ctx.strokeStyle = erasing ? "white" : "black";
    ctx.lineWidth = erasing ? 8 : 2;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  window.addEventListener("mouseup", () => {
    drawing = false;
  });

  penBtn.addEventListener("click", () => (erasing = false));
  eraserBtn.addEventListener("click", () => (erasing = true));
  clearBtn.addEventListener("click", () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
}

function setupCalculator() {
  const display = document.getElementById("calc-display");
  const grid = document.getElementById("calc-grid");
  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+", "C"];

  let expr = "";

  keys.forEach((key) => {
    const btn = document.createElement("button");
    btn.textContent = key;
    grid.appendChild(btn);

    btn.addEventListener("click", () => {
      if (key === "C") {
        expr = "";
        display.value = "0";
      } else if (key === "=") {
        try {
          expr = String(Function(`"use strict"; return (${expr || 0})`)());
          display.value = expr;
        } catch {
          display.value = "Error";
          expr = "";
        }
      } else {
        expr += key;
        display.value = expr;
      }
    });
  });
}

function setupControlPanel() {
  document.querySelectorAll("[data-pattern]").forEach((btn) => {
    btn.addEventListener("click", () => {
      desktop.classList.remove("pattern-grid", "pattern-dots", "pattern-stripes", "pattern-plain");
      desktop.classList.add(btn.dataset.pattern);
      localStorage.setItem("system1-pattern", btn.dataset.pattern);
    });
  });

  document.querySelectorAll("[data-font]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.documentElement.style.setProperty("--font-size", `${btn.dataset.font}px`);
      localStorage.setItem("system1-font", btn.dataset.font);
    });
  });

  const savedPattern = localStorage.getItem("system1-pattern");
  if (savedPattern) {
    desktop.classList.remove("pattern-grid", "pattern-dots", "pattern-stripes", "pattern-plain");
    desktop.classList.add(savedPattern);
  }

  const savedFont = localStorage.getItem("system1-font");
  if (savedFont) {
    document.documentElement.style.setProperty("--font-size", `${savedFont}px`);
  }

  document.getElementById("empty-trash-btn").addEventListener("click", emptyTrash);
}

powerOnBtn.addEventListener("click", () => {
  bootProgress.style.width = "0%";
  bootSystem();
});

window.addEventListener("resize", () => {
  const dw = desktop.clientWidth;
  const dh = desktop.clientHeight;
  Object.values(windows).forEach((win) => {
    if (win.classList.contains("hidden")) return;
    const left = parseInt(win.style.left || "0", 10);
    const top = parseInt(win.style.top || "0", 10);
    const maxLeft = Math.max(0, dw - win.offsetWidth);
    const maxTop = Math.max(0, dh - win.offsetHeight);
    win.style.left = `${Math.min(left, maxLeft)}px`;
    win.style.top = `${Math.min(top, maxTop)}px`;
  });
});

setupWindowInteractions();
setupDesktopIcons();
setupFinderList();
setupMenus();
setupNotes();
setupPaint();
setupCalculator();
setupControlPanel();

updateClock();
setInterval(updateClock, 1000);

bootSystem();
