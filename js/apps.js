// Apps manager: Finder files, notes, calculator, control panel, and MacPaint-style tools.
class AppsManager {
  constructor({ windowManager, desktopEl }) {
    this.windowManager = windowManager;
    this.desktopEl = desktopEl;

    this.files = [];
    this.notes = {
      undoStack: [],
      redoStack: []
    };
    this.paint = {
      tool: 'pencil',
      drawing: false,
      startX: 0,
      startY: 0,
      snapshot: null,
      undoStack: [],
      redoStack: []
    };
  }

  init() {
    this.setupNotes();
    this.setupCalculator();
    this.setupControlPanel();
    this.setupPaint();
    this.setupTrash();

    this.bootstrapFiles();
    this.renderFinderFiles();
  }

  bootstrapFiles() {
    // Finder starts with app shortcuts and fills with downloaded files later.
    this.files = [
      { name: 'Write', type: 'Application', action: () => this.openWindow('notes') },
      { name: 'MacPaint', type: 'Application', action: () => this.openWindow('paint') },
      { name: 'Calculator', type: 'Application', action: () => this.openWindow('calculator') },
      { name: 'Control Panel', type: 'Application', action: () => this.openWindow('control') },
      { name: 'About This Macintosh', type: 'Application', action: () => this.openWindow('about') }
    ];
  }

  addDownloadedFile(file) {
    this.files.push(file);
    this.renderFinderFiles();
  }

  renderFinderFiles() {
    const container = document.getElementById('finder-files');
    container.innerHTML = '';

    for (const file of this.files) {
      const row = document.createElement('div');
      row.className = 'finder-row';

      const name = document.createElement('span');
      name.textContent = file.name;

      const type = document.createElement('span');
      type.textContent = file.type;

      const actionCell = document.createElement('span');
      const openBtn = document.createElement('button');
      openBtn.className = 'finder-open';
      openBtn.textContent = file.type === 'Application' ? 'Open' : 'Save';

      openBtn.addEventListener('click', () => {
        if (file.type === 'Application') {
          file.action();
          return;
        }

        if (file.url) {
          const a = document.createElement('a');
          a.href = file.url;
          a.download = file.name;
          a.click();
        }
      });

      row.addEventListener('dblclick', () => {
        if (file.type === 'Application') {
          file.action();
        } else if (file.preview) {
          this.openFilePreview(file);
        }
      });

      actionCell.appendChild(openBtn);
      row.append(name, type, actionCell);
      container.appendChild(row);
    }
  }

  openWindow(name) {
    this.windowManager.open(name);
  }

  openFilePreview(file) {
    const notes = document.getElementById('notes-area');
    if (!notes) return;

    this.openWindow('notes');
    notes.value = file.preview;
  }

  setupNotes() {
    const notes = document.getElementById('notes-area');
    notes.value = localStorage.getItem('system1-note') || '';

    // Initialize undo/redo stack with current value
    this.notes.undoStack = [];
    this.notes.redoStack = [];
    if (notes.value) {
      this.notes.undoStack.push(notes.value);
    }

    // Track changes for undo/redo - capture state BEFORE change
    notes.addEventListener('keydown', (e) => {
      // Save state before the key is processed
      if (!['Control', 'Shift', 'Alt', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        this.notes.undoStack.push(notes.value);
        this.notes.redoStack = [];
        if (this.notes.undoStack.length > 50) {
          this.notes.undoStack.shift();
        }
      }
    });

    // Save after input for next keystroke
    notes.addEventListener('input', () => {
      localStorage.setItem('system1-note', notes.value);
    });

    // Preserve selection on undo/redo
    const saveSelection = () => {
      notes.dataset.selectionStart = notes.selectionStart;
      notes.dataset.selectionEnd = notes.selectionEnd;
    };

    notes.addEventListener('click', saveSelection);
    notes.addEventListener('keydown', saveSelection);
  }

  setupCalculator() {
    const display = document.getElementById('calc-display');
    const grid = document.getElementById('calc-grid');

    const keys = [
      '7', '8', '9', '/',
      '4', '5', '6', '*',
      '1', '2', '3', '-',
      '0', '.', '=', '+',
      'C'
    ];

    let expr = '';

    keys.forEach((key) => {
      const button = document.createElement('button');
      button.textContent = key;
      grid.appendChild(button);

      button.addEventListener('click', () => {
        if (key === 'C') {
          expr = '';
          display.value = '0';
          return;
        }

        if (key === '=') {
          try {
            const result = Function(`"use strict"; return (${expr || 0})`)();
            expr = String(result);
            display.value = expr;
          } catch {
            expr = '';
            display.value = 'Error';
          }
          return;
        }

        expr += key;
        display.value = expr;
      });
    });
  }

  setupControlPanel() {
    const desktop = this.desktopEl;

    document.querySelectorAll('[data-pattern]').forEach((btn) => {
      btn.addEventListener('click', () => {
        desktop.classList.remove('pattern-grid', 'pattern-dots', 'pattern-stripes', 'pattern-plain');
        desktop.classList.add(btn.dataset.pattern);
        localStorage.setItem('system1-pattern', btn.dataset.pattern);
      });
    });

    document.querySelectorAll('[data-font]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.documentElement.style.setProperty('--font-size', `${btn.dataset.font}px`);
        localStorage.setItem('system1-font', btn.dataset.font);
      });
    });

    const savedPattern = localStorage.getItem('system1-pattern');
    if (savedPattern) {
      desktop.classList.remove('pattern-grid', 'pattern-dots', 'pattern-stripes', 'pattern-plain');
      desktop.classList.add(savedPattern);
    }

    const savedFont = localStorage.getItem('system1-font');
    if (savedFont) {
      document.documentElement.style.setProperty('--font-size', `${savedFont}px`);
    }
  }

  setupTrash() {
    const status = document.getElementById('trash-status');
    const button = document.getElementById('empty-trash-btn');

    button.addEventListener('click', () => {
      status.textContent = 'Trash emptied.';
    });
  }

  setupPaint() {
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const toolbar = document.getElementById('paint-toolbar');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.imageSmoothingEnabled = false;

    const saveState = () => {
      this.paint.undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (this.paint.undoStack.length > 40) this.paint.undoStack.shift();
      this.paint.redoStack.length = 0;
    };

    const restoreState = (stackFrom, stackTo) => {
      if (!stackFrom.length) return;
      stackTo.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      const image = stackFrom.pop();
      ctx.putImageData(image, 0, 0);
    };

    const pos = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((event.clientY - rect.top) * (canvas.height / rect.height));
      return { x, y };
    };

    const drawPixel = (x, y, color = '#000') => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    };

    const drawLine = (x1, y1, x2, y2) => {
      const dx = Math.abs(x2 - x1);
      const sx = x1 < x2 ? 1 : -1;
      const dy = -Math.abs(y2 - y1);
      const sy = y1 < y2 ? 1 : -1;
      let err = dx + dy;

      while (true) {
        drawPixel(x1, y1);
        if (x1 === x2 && y1 === y2) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
          err += dy;
          x1 += sx;
        }
        if (e2 <= dx) {
          err += dx;
          y1 += sy;
        }
      }
    };

    const drawRect = (x1, y1, x2, y2) => {
      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const top = Math.min(y1, y2);
      const bottom = Math.max(y1, y2);

      drawLine(left, top, right, top);
      drawLine(left, bottom, right, bottom);
      drawLine(left, top, left, bottom);
      drawLine(right, top, right, bottom);
    };

    const drawCircle = (x1, y1, x2, y2) => {
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;
      const cx = Math.min(x1, x2) + rx;
      const cy = Math.min(y1, y2) + ry;

      for (let t = 0; t < Math.PI * 2; t += 0.01) {
        const x = Math.round(cx + rx * Math.cos(t));
        const y = Math.round(cy + ry * Math.sin(t));
        drawPixel(x, y);
      }
    };

    const fillArea = (startX, startY) => {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = img;
      const idx = (x, y) => (y * width + x) * 4;

      const target = idx(startX, startY);
      const targetColor = [data[target], data[target + 1], data[target + 2], data[target + 3]];
      const fillColor = [0, 0, 0, 255];

      const same = (i, c) => data[i] === c[0] && data[i + 1] === c[1] && data[i + 2] === c[2] && data[i + 3] === c[3];
      if (same(target, fillColor)) return;

      const stack = [[startX, startY]];
      while (stack.length) {
        const [x, y] = stack.pop();
        if (x < 0 || y < 0 || x >= width || y >= height) continue;

        const i = idx(x, y);
        if (!same(i, targetColor)) continue;

        data[i] = fillColor[0];
        data[i + 1] = fillColor[1];
        data[i + 2] = fillColor[2];
        data[i + 3] = fillColor[3];

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }

      ctx.putImageData(img, 0, 0);
    };

    const setTool = (tool) => {
      this.paint.tool = tool;
      toolbar.querySelectorAll('[data-tool]').forEach((button) => {
        button.classList.toggle('active', button.dataset.tool === tool);
      });
    };

    toolbar.querySelectorAll('[data-tool]').forEach((button) => {
      button.addEventListener('click', () => setTool(button.dataset.tool));
    });

    document.getElementById('paint-undo').addEventListener('click', () => restoreState(this.paint.undoStack, this.paint.redoStack));
    document.getElementById('paint-redo').addEventListener('click', () => restoreState(this.paint.redoStack, this.paint.undoStack));

    document.getElementById('paint-clear').addEventListener('click', () => {
      saveState();
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    canvas.addEventListener('mousedown', (event) => {
      const p = pos(event);
      this.paint.drawing = true;
      this.paint.startX = p.x;
      this.paint.startY = p.y;
      this.paint.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (this.paint.tool === 'pencil') {
        saveState();
        drawPixel(p.x, p.y);
      }

      if (this.paint.tool === 'fill') {
        saveState();
        fillArea(p.x, p.y);
        this.paint.drawing = false;
      }
    });

    canvas.addEventListener('mousemove', (event) => {
      if (!this.paint.drawing) return;
      const p = pos(event);

      if (this.paint.tool === 'pencil') {
        drawLine(this.paint.startX, this.paint.startY, p.x, p.y);
        this.paint.startX = p.x;
        this.paint.startY = p.y;
        return;
      }

      ctx.putImageData(this.paint.snapshot, 0, 0);

      if (this.paint.tool === 'line') drawLine(this.paint.startX, this.paint.startY, p.x, p.y);
      if (this.paint.tool === 'rect') drawRect(this.paint.startX, this.paint.startY, p.x, p.y);
      if (this.paint.tool === 'circle') drawCircle(this.paint.startX, this.paint.startY, p.x, p.y);
    });

    window.addEventListener('mouseup', (event) => {
      if (!this.paint.drawing) return;
      const p = pos(event);

      if (['line', 'rect', 'circle'].includes(this.paint.tool)) {
        saveState();
        ctx.putImageData(this.paint.snapshot, 0, 0);
        if (this.paint.tool === 'line') drawLine(this.paint.startX, this.paint.startY, p.x, p.y);
        if (this.paint.tool === 'rect') drawRect(this.paint.startX, this.paint.startY, p.x, p.y);
        if (this.paint.tool === 'circle') drawCircle(this.paint.startX, this.paint.startY, p.x, p.y);
      }

      this.paint.drawing = false;
    });
  }

  handleEditAction(action) {
    const active = this.windowManager.getActiveWindowId();

    if (active === 'paint') {
      if (action === 'undo') document.getElementById('paint-undo').click();
      if (action === 'redo') document.getElementById('paint-redo').click();
      return;
    }

    if (active === 'notes') {
      const notes = document.getElementById('notes-area');
      notes.focus();
      
      if (action === 'undo') {
        if (this.notes.undoStack.length > 1) {
          this.notes.redoStack.push(this.notes.undoStack.pop());
          notes.value = this.notes.undoStack[this.notes.undoStack.length - 1];
          localStorage.setItem('system1-note', notes.value);
        }
        return;
      }
      
      if (action === 'redo') {
        if (this.notes.redoStack.length > 0) {
          const state = this.notes.redoStack.pop();
          this.notes.undoStack.push(state);
          notes.value = state;
          localStorage.setItem('system1-note', notes.value);
        }
        return;
      }

      if (action === 'cut') {
        const selected = notes.value.substring(notes.selectionStart, notes.selectionEnd);
        if (selected) {
          navigator.clipboard.writeText(selected);
          notes.value = notes.value.substring(0, notes.selectionStart) + notes.value.substring(notes.selectionEnd);
          localStorage.setItem('system1-note', notes.value);
          this.notes.undoStack.push(notes.value);
          this.notes.redoStack = [];
        }
        return;
      }

      if (action === 'copy') {
        const selected = notes.value.substring(notes.selectionStart, notes.selectionEnd);
        if (selected) {
          navigator.clipboard.writeText(selected);
        }
        return;
      }

      if (action === 'paste') {
        navigator.clipboard.readText().then(text => {
          const start = notes.selectionStart;
          const end = notes.selectionEnd;
          notes.value = notes.value.substring(0, start) + text + notes.value.substring(end);
          localStorage.setItem('system1-note', notes.value);
          notes.selectionStart = notes.selectionEnd = start + text.length;
          this.notes.undoStack.push(notes.value);
          this.notes.redoStack = [];
        });
        return;
      }
    }

    if (action === 'undo') document.execCommand('undo');
    if (action === 'cut') document.execCommand('cut');
    if (action === 'copy') document.execCommand('copy');
    if (action === 'paste') document.execCommand('paste');
  }
}

window.AppsManager = AppsManager;
