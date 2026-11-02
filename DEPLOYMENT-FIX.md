# Nabeng-SBA deployment fix

## Build locally

```bash
npm install
npm run build
npm run preview
```

Deploy the **dist** folder, not the project root or `src` folder. For Render Static Site use:

- Build command: `npm install && npm run build`
- Publish directory: `dist`

Vite processes `src/main-system.js` and its CSS import into production JavaScript and CSS assets. Do not serve `/src/main-system.js` directly from a static host.

## Server environment

The optional Express AI server uses `OPENAI_API_KEY` from the server environment. Never commit API keys to source code. Set `OPENAI_API_KEY` in the server host's environment settings. The previously hard-coded key in the supplied source has been removed; revoke that exposed key and create a replacement.
