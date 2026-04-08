# RIAL — Developer Quickstart

## First time setup (2 minutes)

```bash
# Clone and enter
cd rial.app.v1.5

# Install dependencies
npm install

# Create local environment
cp .env.example .env.local
# Edit .env.local — add your Gemini API key (optional, only needed for AI Coach)

# Start dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

## What you'll see

1. **Onboarding wizard** (5 steps) — select goal, enter body data, get calculated macros
2. **Home (Hoy)** — daily dashboard with macros, planned meals, training toggle, insights
3. **4-tab navigation**: Hoy | Cocina | Explorar | Mas

## Key URLs (local dev)

| URL | What |
|-----|------|
| http://localhost:3000 | App (auto-opens) |
| http://localhost:3000 (mobile view) | Use browser DevTools responsive mode (375px) |

## Testing features quickly

### Reset onboarding
Open browser console (F12) and run:
```js
localStorage.setItem('isFirstTime', 'true');
location.reload();
```

### Switch language
Settings (gear icon) > scroll to bottom > Language section > click English/Espanol

### Add test Real Feel data
```js
const logs = [];
for (let i = 0; i < 14; i++) {
  const d = new Date(); d.setDate(d.getDate() - i);
  logs.push({ id: Date.now()+i, date: d.toISOString(), level: Math.floor(Math.random()*3)+2, tags: [['energy','bloating','clarity'][i%3]] });
}
localStorage.setItem('realFeelLogs', JSON.stringify(logs));
location.reload();
```

### Toggle Pro mode
```js
localStorage.setItem('isPro', 'true');
location.reload();
```

### Clear all data
```js
localStorage.clear();
location.reload();
```

## Common dev tasks

| Task | Command |
|------|---------|
| Type check | `npx tsc --noEmit` |
| Build for production | `npm run build` |
| Preview prod build | `npm run preview` |
| Add a new screen | See CONTRIBUTING.md checklist |
| Add translations | See docs/i18n-dictionary.md |

## Project health checks

Before committing:
1. `npx tsc --noEmit` — must pass clean
2. Visual check in browser — navigate all 4 tabs
3. Switch to English — verify new strings translated
4. Switch back to Spanish — verify nothing broke

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 in use | `npm run dev -- --port 3001` |
| Blank screen | Check browser console for errors, clear localStorage |
| Barcode camera not working | Use manual code input, or test on HTTPS/localhost |
| AI Coach not responding | Check GEMINI_API_KEY in .env.local |
| Themes broken | Clear localStorage, check index.css theme tokens |
