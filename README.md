# Mac System 1 Web OS

A nostalgic, fully functional web-based recreation of the classic Apple Macintosh System 1 OS. Built with vanilla JavaScript to bring that retro one-bit UI experience right to your browser.

## What is This?

This is a working web OS that mimics the original 1984 Macintosh System 1 - menus, windows, draggable icons, and all. It's got real apps you can actually use (calculator, paint, text editor, finder) and the whole interface is draggable, resizable, and interactive. Pretty cool for a nostalgia trip or just messing around with retro UI design.

## Features

- **Draggable & Resizable Windows** - Grab any window by its title bar and drag it around, or resize from the bottom right corner
- **Boot Animation** - Classic Mac startup screen with progress bar
- **Desktop Icons** - Floppy disk icon (opens Finder) and Trash icon, positioned retro-style
- **Finder** - File browser for viewing desktop files
- **MacPaint** - Simple drawing app with pencil, line, rectangle, circle, and fill tools
- **Calculator** - Basic calculator that actually works
- **Write** (Text Editor) - Full text editor with undo/redo, cut/copy/paste, and autosave to localStorage
- **Control Panel** - Customize desktop patterns and font sizes
- **Trash** - Classic Mac trash can (mostly for show)
- **Menu System** - Apple menu, File, Edit, View, and Special menus with real functionality

## How to Use

Just open `index.html` in a modern browser and click the "Power On" button. The system will boot up with that classic Mac startup animation.

### Menu Buttons & What They Do

**File Menu:**
- **New Note** - Opens the Write app so you can type stuff
- **Open Macintosh HD** - Opens Finder to see what's on the "drive"
- **Close Window** - Closes whichever window you're looking at

**Edit Menu:**
- **Undo** - Undoes your last action (works with text editor, paint, everything)
- **Redo** - Redoes what you just undid
- **Cut** - Cuts selected text or paint selection
- **Copy** - Copies selected stuff
- **Paste** - Pastes from clipboard into text editor or wherever

**View Menu:**
- **Clean Up Icons** - Automatically arranges desktop icons into neat columns (left-aligned grid)
- **Toggle Desktop Grid** - Turns on/off grid snapping for icons. When enabled, you'll see a faint grid pattern on the desktop, and any icons you drag will snap to the grid alignment. Helpful for keeping things tidy and organized
- **Bring All to Front** - Brings all open windows to the front and stacks them

**Special Menu:**
- **About This Macintosh** - Shows some info about the OS
- **Restart** - Reboots the whole system (resets to startup screen)
- **Shut Down** - Powers off the OS (basically the opposite of boot)

### Apps

**MacPaint** - Draw stuff on a mini canvas
- Tools: Pencil, Line, Rectangle, Circle, Fill
- Undo and Redo buttons work
- Canvas is 384x256 pixels (classic size)

**Calculator** - Just a normal calculator
- Basic arithmetic operations
- Number pad and operators
- Display shows your calculation

**Write** - Text editor
- Type whatever you want
- Undo/Redo works per keystroke
- Cut/Copy/Paste via Edit menu
- Auto-saves to browser storage, so your notes stay even after refresh

**Finder** - File browser
- Shows desktop files and downloaded stuff
- Double-click apps to open them

## Technical Stuff

Built with:
- **Pure JavaScript** - No frameworks, no dependencies
- **Vanilla CSS** - All the styling is hand-written
- **localStorage** - For saving your documents between sessions
- **Clipboard API** - For cut/copy/paste functionality

File structure:
```
mac-system-1/
├── index.html          # Main HTML, all windows and menus
├── styles.css          # All the retro styling
└── js/
    ├── main.js         # Startup, boot sequence, menu handling
    ├── apps.js         # All the app logic (calculator, paint, notes, etc)
    ├── desktop.js      # Desktop icon management
    └── window-manager.js # Window dragging, resizing, z-index stacking
```

## Browser Support

Works in any modern browser that supports:
- ES6 JavaScript classes
- CSS Grid
- Clipboard API
- Canvas API

Tested in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Quirks

- The paint app canvas size is fixed at 384x256 (classic Macintosh screen resolution)
- Some operations are visual only (like "Empty Trash" - trash can doesn't actually do anything)
- Drag-and-drop between windows isn't implemented (system 1 limitation, honestly)
- No actual file system - everything is simulated with browser storage

## Why Vanilla JS?

Because why not? It's actually pretty clean to write without all the framework overhead when you're just building an interactive UI. Plus it gives you direct control over the DOM and makes the whole thing feel snappy.

## Future Ideas

- More apps (like Scrapbook, Key Caps, etc)
- Actual drag-and-drop between windows
- More desktop patterns
- Network features (just kidding)
- Better file management

## Credits

Just me, recreating something awesome from 1984. Apple, rest in peace (the company's still around but this OS? That was special).

