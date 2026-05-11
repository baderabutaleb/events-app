# Events

A minimal, dark-themed personal event tracker built as a Progressive Web App. No accounts, no servers — everything lives in your browser.

---

## Features

- **Create & manage events** — title, category, date/time, and optional notes
- **Four categories** — Uni, Health, Life, and Other (with a custom label)
- **Upcoming & Past views** — completed events move to a separate history tab
- **Status indicators** — cards highlight when an event is due within 24 hours or overdue
- **Calendar export** — download any event as an `.ics` file (opens in Apple Calendar, Google Calendar, Outlook, etc.)
- **Installable PWA** — add to your home screen on iOS or Android for a native app feel
- **Offline-ready** — works entirely in the browser with no internet required after loading
- **Zero dependencies** — plain HTML, CSS, and JavaScript; nothing to install or build

---

## Getting Started

### Option 1 — Open directly in a browser

Just open `index.html` in any modern browser. Because events are stored in `localStorage`, they persist between sessions as long as you use the same browser.

> **Note:** Some browsers restrict `localStorage` when opening files via `file://`. If events don't save, use Option 2.

### Option 2 — Serve locally (recommended)

You need a simple static file server. Pick any of the following:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx, no install needed)
npx serve .

# VS Code — install the "Live Server" extension and click "Go Live"
```

Then open `http://localhost:8080` in your browser.

---

## Installing as a PWA

### iPhone / iPad (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button
3. Select **Add to Home Screen**
4. Tap **Add**

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **⋮** menu
3. Select **Add to Home Screen** or **Install App**

### Desktop (Chrome / Edge)
1. Open the app URL
2. Click the **install icon** in the address bar
3. Click **Install**

Once installed, the app runs in its own window with no browser chrome, just like a native app.

---

## Using the App

| Action | How |
|---|---|
| Create an event | Tap the **+** button (bottom right) |
| Edit an event | Tap anywhere on the event card |
| Complete an event | Tap the **checkmark** button on the card |
| Restore an event | Switch to **Past Events**, tap the checkmark again |
| Delete an event | Open the edit form, tap **Delete event** |
| Export to calendar | Tap the **calendar** icon on any card |
| Switch views | Tap the **≡** menu (top left) |

---

## File Structure

```
events-app/
├── index.html          # App markup — sidebar, topbar, event list, modal form
├── styles.css          # Dark theme — CSS variables, cards, modal sheet, tags
├── app.js              # Vanilla JS — state, rendering, localStorage, ICS export
├── manifest.json       # PWA manifest
├── icon-192.png        # PWA icon (192×192)
├── icon-512.png        # PWA icon (512×512)
├── apple-touch-icon.png  # iOS home screen icon (180×180)
├── favicon.ico         # Browser tab icon (32×32)
└── .gitignore
```

---

## Data & Privacy

All data is stored locally in your browser's `localStorage` under the key `event-tracker-v1`. Nothing is sent to any server. Clearing your browser data will erase your events.

---

## Browser Support

Works in any modern browser — Chrome, Safari, Firefox, and Edge.
