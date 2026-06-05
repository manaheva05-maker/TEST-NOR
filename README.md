<h1 align="center">🤖 INCONNU XD V3</h1>
<p align="center">
  <b>Multi Device WhatsApp Bot — by INCONNU BOY</b><br>
  <i>Multi-language: English 🇬🇧 & French 🇫🇷</i>
</p>

---

<p align="center">
  <a href="https://github.com/INCONNU-BOY/INCONNU-XD-V3"><img src="https://img.shields.io/badge/GITHUB-INCONNU BOY-red?style=for-the-badge&logo=github"></a>
  <a href="https://github.com/INCONNU-BOY/INCONNU-XD-V3/stargazers"><img src="https://img.shields.io/github/stars/INCONNU-BOY/INCONNU-XD-V3?style=social"></a>
  <a href="https://github.com/INCONNU-BOY/INCONNU-XD-V3/network/members"><img src="https://img.shields.io/github/forks/INCONNU-BOY/INCONNU-XD-V3?style=social"></a>
</p>

---

## 1. 🔧 Fork this repo first

<a href="https://github.com/INCONNU-BOY/INCONNU-XD-V3/fork">
  <img src="https://img.shields.io/badge/FORK REPO-purple?style=for-the-badge&logo=github">
</a>

---

## 2. 🌍 Language / Langue

Set the `LANGUAGE` env variable:

| Value | Language |
|---|---|
| `en` | English 🇬🇧 (default) |
| `fr` | French 🇫🇷 |

Or use the bot command: `.setlang fr` / `.setlang en`

---

## 3. 🚀 Deploy

### Heroku
<a href="https://signup.heroku.com"><img src="https://img.shields.io/badge/SIGNUP-white?style=for-the-badge&logo=heroku"></a>
<a href="https://dashboard.heroku.com/new?template=https://github.com/INCONNU-BOY/INCONNU-XD-V3"><img src="https://img.shields.io/badge/DEPLOY ON HEROKU-purple?style=for-the-badge&logo=heroku"></a>

> PostgreSQL auto-provisioned via `heroku-postgresql:essential-0`

---

### Railway
<a href="https://railway.app"><img src="https://img.shields.io/badge/SIGNUP-black?style=for-the-badge&logo=railway"></a>
<a href="https://railway.app/new/github"><img src="https://img.shields.io/badge/DEPLOY ON RAILWAY-blue?style=for-the-badge&logo=railway"></a>

> Add PostgreSQL plugin — `DATABASE_URL` auto-linked

---

### Render
<a href="https://dashboard.render.com/signup"><img src="https://img.shields.io/badge/SIGNUP-green?style=for-the-badge&logo=render"></a>
<a href="https://render.com/deploy"><img src="https://img.shields.io/badge/DEPLOY ON RENDER-green?style=for-the-badge&logo=render"></a>

> Uses included `render.yaml` for one-click setup

---

### Koyeb
<a href="https://app.koyeb.com/auth/signup"><img src="https://img.shields.io/badge/SIGNUP-orange?style=for-the-badge"></a>
<a href="https://app.koyeb.com/deploy"><img src="https://img.shields.io/badge/DEPLOY ON KOYEB-orange?style=for-the-badge"></a>

> Free DB: [neon.tech](https://neon.tech) · [supabase.com](https://supabase.com) · [aiven.io](https://aiven.io)

---

### GitHub Codespaces
<a href="https://codespaces.new/INCONNU-BOY/INCONNU-XD-V3"><img src="https://img.shields.io/badge/OPEN IN CODESPACES-black?style=for-the-badge&logo=github"></a>

---

### VPS / Docker

```bash
git clone https://github.com/INCONNU-BOY/INCONNU-XD-V3
cd INCONNU-XD-V3
cp .env.example .env
# Edit .env — add SESSION_ID
npm install && npm start
```

```bash
# Docker
docker build -t inconnu-xd-v3 .
docker run -d --env-file .env -p 5000:5000 inconnu-xd-v3
```

---

## 4. ⚙️ Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SESSION_ID` | ✅ | — | WhatsApp session ID |
| `MODE` | ✅ | `public` | `public` or `private` |
| `TIME_ZONE` | ✅ | `America/Sao_Paulo` | Your timezone |
| `LANGUAGE` | ❌ | `en` | `en` or `fr` |
| `AUTO_READ_STATUS` | ❌ | `true` | Auto-view statuses |
| `AUTO_LIKE_STATUS` | ❌ | `true` | Auto-like statuses |
| `DATABASE_URL` | ❌ | — | PostgreSQL URL (falls back to SQLite) |

---

## 5. 📁 Project Structure

```
INCONNU-XD-V3/
│
├── index.js                   ← Main entry point
├── config.js                  ← Env config loader
├── .env                       ← Environment variables
│
├── inconnu/                   ← 🌍 Language files
│   ├── en.json                   English strings
│   └── fr.json                   French strings
│
├── Lib/                       ← Utilities
│   └── i18n.js                   Multi-lang helper (t, ts)
│
├── inconnuTech/               ← 🔌 Command plugins
│   ├── group.js                  Group management
│   ├── settings.js               Bot settings + setlang
│   ├── owner.js                  Owner commands
│   ├── general.js                Ping, report
│   ├── ai.js                     AI commands
│   ├── downloader.js             Download media
│   ├── games.js                  Games
│   └── ... (25 plugin files)
│
└── inconnuboy/                ← 🧠 Core engine
    ├── index.js               ← Engine barrel export
    │
    ├── core/                  ← Core logic
    │   ├── commands.js           gmd() command registry
    │   ├── utils.js              Media/format utilities
    │   ├── features.js           Anti-link, chatbot, etc.
    │   ├── media.js              Upload/CDN helpers
    │   ├── helpers.js            createContext, reply helpers
    │   ├── context.js            Context info builder
    │   ├── gameEngine.js         Game handler
    │   ├── gameAI.js             AI game logic
    │   ├── tictactoe.js          Tic-tac-toe game
    │   ├── wordchain.js          Word chain game
    │   └── dictionary.js         Dictionary data
    │
    ├── socket/                ← WhatsApp socket layer
    │   ├── config.js             Socket config builder
    │   ├── reconnect.js          Auto-reconnect handler
    │   ├── cache.js              Group metadata cache
    │   └── serializer.js         Message serializer
    │
    ├── events/                ← Event handlers
    │   └── groupEvents.js        Welcome/goodbye/promote/demote
    │
    ├── plugins/               ← Plugin system
    │   └── loader.js             Plugin loader + command finder
    │
    ├── store/                 ← Database layer
    │   ├── database.js           DB connection
    │   ├── settings.js           Bot settings CRUD
    │   ├── groupSettings.js      Per-group settings
    │   ├── sudo.js               Sudo users
    │   ├── notes.js              Notes storage
    │   ├── messageStore.js       Anti-delete store
    │   ├── games.js              Game state
    │   ├── wcgGame.js            Word chain DB
    │   ├── diceGame.js           Dice game DB
    │   ├── autoUpdate.js         Auto-update tracker
    │   ├── lidMapping.js         LID → JID mapping
    │   └── tempmail.js           Temp mail sessions
    │
    ├── session/               ← WhatsApp session (gitignored)
    └── temp/                  ← Temp files (gitignored)
```

---

## 6. 🌍 Multi-Language Usage

```js
// In any plugin command:
const { t } = require('../Lib/i18n');

gmd({ pattern: 'mycommand' }, async (from, Gifted, conText) => {
  const { reply, lang } = conText;  // lang auto-injected
  return reply(await t('general.groupOnly', {}, lang));
});
```

**Add new strings** → edit `inconnu/en.json` and `inconnu/fr.json`

**Change language** → `.setlang fr` or `.setlang en`

---

<p align="center">Made with ❤️ by <b>INCONNU BOY</b> · Dev: 554488138425</p>
