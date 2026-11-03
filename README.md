# ICT Field Guide

An offline, installable troubleshooting guide for ICT interns at the Nigerian Ports Authority (NPA).

Interns scan one QR code on a poster in the ICT office, install the app on their phone and leave for their assigned ticket. Every guide, 3D figure and tool list is saved on the phone, so it still opens in a basement server room with no signal.

## Why it exists

At NPA, a complaint becomes a ticket on the ICT Support dashboard. A supervisor assigns it to an intern, the intern fixes it in the department, reports back, and the supervisor marks it resolved. Interns often got stuck on site and had to walk back to the office or hunt for a senior who knew that one thing. The Field Guide puts that knowledge in their pocket.

## What's inside

| Part | What it does |
| --- | --- |
| **Trip card** (home) | "I'm going to *Finance & Accounts* for a *software issue*" lists the guides for that trip and shows they're saved offline. |
| **Guides** | 20 step-by-step guides in 8 categories: printers, software, networking, NPA email, Oracle, in-house apps and Java, hardware and UPS, servers. Commands have a copy button. Steps can be ticked off. |
| **Search** | Works offline. Try `printer offline`, `ORA-12154`, `ups beeping`. |
| **Resolution note** | One tap copies a note (ticket number, department, issue, steps done) to paste for the supervisor. "Ask a senior" shares where you're stuck. |
| **How it works** | 3D figures (Three.js) you can turn around: a laser printer and a UPS. Step buttons, a cutaway window, sound words and live numbers driven by one model per device. The UPS has a load slider. |
| **Tools inventory** | ICT tools and spares with where they're kept. |
| **QR poster** | A printable poster with a QR code to the app's own address. |
| **Install guide** | "Install the Field Guide on your phone" covers iPhone, iPad and Android. The install card on the home page links to it. |
| **Languages** | Interface in English, Hausa, Yoruba and Igbo. Guides are in English for now. |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # data, search and model checks
npm run build      # production build in dist/, with the service worker
npm run preview    # serve dist/ at http://localhost:4173
```

The offline service worker only runs in the production build (`build` + `preview`), not in `dev`.

To test offline: open the preview once, then turn on airplane mode (or DevTools → Network → Offline) and reload.

## Deploy

The repo includes a GitHub Pages workflow (`.github/workflows/deploy.yml`) that tests, builds and publishes on every push to `main`.

One-time setup: GitHub → Settings → Pages → Source: **GitHub Actions**. The app will be at `https://aliphatichyd.github.io/ICT-FIELD-GUIDE/`.

The build uses relative paths, so `dist/` also works on any static host (Render, Netlify, an internal NPA web server).

After deploying, open **QR poster** in the app, print it and put it up in the ICT office. The QR code always points at the address the app is served from.

## Edit the content

All content is plain JavaScript data, no database:

- `src/data/guides.js`: guides and categories
- `src/data/tools.js`: tools inventory
- `src/data/departments.js`: departments in the trip card
- `src/i18n.js`: interface text in the four languages

Text in `[[double brackets]]` marks something only the NPA ICT office knows (a server name, an IP range, an internal app name). The app highlights it in amber with "confirm with supervisor" until someone replaces it.

Each guide has `reviewedBy: null` until a supervisor checks it. The app then shows "Not yet reviewed" so interns know how far to trust it. Set it to the reviewer's name once checked.

Run `npm test` after editing: it checks every guide has its fields, links resolve, and every language has every string.

## How it's built

```
index.html
src/
  main.js            router and views (home, guides, search, figures, tools, ticket flow, poster)
  styles.css         NPA green, paper and ink tokens, noise overlay, container queries
  search.js          offline search
  i18n.js            English, Hausa, Yoruba, Igbo
  data/              guides, tools, departments
  figures/
    models.js        pure models: every number a figure shows
    engine.js        shared figure runner (Three.js scene, steps, Manual/Auto, labels)
    printer.js       laser printer
    ups.js           UPS
public/              icons and favicon
tests/               node:test checks
```

- **Vite** builds a static site. **vite-plugin-pwa** (Workbox) precaches every file, so the whole app works offline after the first visit, and writes the web app manifest so it can be installed.
- **Three.js** is loaded only when a figure opens, but is still precached for offline use.
- Fonts (Bricolage Grotesque, JetBrains Mono) are bundled, not loaded from Google, so they work offline.
- Layout uses CSS container queries: bottom tabs on phones, a sidebar on tablets and desktops.

## Before launch

- Replace every amber `[[...]]` value with the real NPA value.
- Have a supervisor review each guide and set `reviewedBy`.
- Have native speakers check the Hausa, Yoruba and Igbo interface text in `src/i18n.js`.
- Confirm permission to use the NPA logo before adding it. The app currently uses a plain "ICT" mark.
- Fill in real counts and locations in the tools inventory.
