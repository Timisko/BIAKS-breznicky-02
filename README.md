# BIAKS-breznicky-02

Vue frontend buildovaný cez Vite a Express API.

Použi Node.js 22.18+ alebo 24+ (natívne spúšťanie TypeScriptu).

```sh
npm install
npm run dev
```

Vite spustí Vue frontend aj Express API na `http://localhost:5173`.
API je dostupné na `GET /api/hello`. Vo Vue ho môžeš volať cez
`fetch("/api/hello")`. Zmeny servera reštartujú Vite.

Produkčné spustenie:

```sh
npm run build
npm start
```

Express servuje API aj frontend z `dist` na `http://localhost:3000`.
Port môžeš nastaviť cez premennú prostredia `PORT`.
