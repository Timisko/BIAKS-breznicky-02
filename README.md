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

## SQLite a SQL injection ukážka

Každý režim používa vlastnú databázu: `server/unsafe.sqlite`,
`server/safe.sqlite` a `server/orm.sqlite`. Po inštalácii závislostí priprav
databázy a spusti web:

```sh
npm run db:setup
npm run build
npm run dev
```

Web otvor na `http://localhost:3000`. Úvodná obrazovka má tri farebné časti.
Kliknutím otvoríš formulár vybraného režimu. Tlačidlá ukážkových vstupov
vyplnia formulár; tlačidlo „Vyhľadať“ vykoná dotaz a zobrazí výsledky.

Po testovaní zastav server a resetuj všetky tri databázy:

```sh
npm run db:reset
npm run dev
```

Reset odstráni celý obsah všetkých troch databáz, obnoví tabuľku produktov
a vloží Notebook, Monitor a Klávesnicu s ID 1 až 3. Funguje aj po odstránení
tabuľky alebo zmene jej štruktúry. Schému pre reset berie z úvodnej SQL migrácie.

Tri varianty vyhľadávania produktov:

| Endpoint | Prístup |
| --- | --- |
| `/api/products/unsafe` | Zámerne neošetrené skladanie SQL |
| `/api/products/safe` | Raw SQL s parametrom `?` |
| `/api/products/prisma` | Prisma `findMany` |

Bežný vstup `Notebook` vráti jeden produkt vo všetkých variantoch.
Vstup `' OR 1=1 --` vráti všetky tri produkty iba v neošetrenom variante;
parametrizovaný SQL aj ORM vrátia prázdne pole.

```sh
curl --get --data-urlencode "name=Notebook" http://localhost:3000/api/products/unsafe
curl --get --data-urlencode "name=' OR 1=1 --" http://localhost:3000/api/products/unsafe
curl --get --data-urlencode "name=' OR 1=1 --" http://localhost:3000/api/products/safe
curl --get --data-urlencode "name=' OR 1=1 --" http://localhost:3000/api/products/prisma
```

Neošetrený endpoint slúži na lokálnu prezentáciu s testovacími dátami.

### Ďalšie ukážkové vstupy

Zistenie štruktúry databázy (CREATE TABLE príkazy sa zobrazia v stĺpci Produkt):

```sql
' UNION SELECT rowid, sql FROM sqlite_schema WHERE type = 'table' --
```

Úprava produktu s ID 1, potom vyhľadaj `Zmenený produkt`:

```sql
'; UPDATE Product SET name = 'Zmenený produkt' WHERE id = 1; --
```

Zmazanie všetkých produktov, tabuľka zostane zachovaná:

```sql
'; DELETE FROM Product; --
```

Neošetrený režim používa `exec()` na vykonanie celej SQL sekvencie vrátane
pripojených príkazov. Ošetrený SQL a Prisma spracujú ukážkové vstupy ako text.
Po úprave alebo zmazaní dát zastav server a spusti `npm run db:reset`.

Zmazanie databázy a demonštračný pád služby:

```sql
'; DROP TABLE Product; --
```

SQL odstráni tabuľku Product. Neošetrený endpoint potom výslovne zmaže
`server/unsafe.sqlite` a ukončí celý Node proces s kódom 1. Ide o zámerne
doplnený demonštračný následok, samotný DROP TABLE proces neukončuje.
Databázy safe.sqlite a orm.sqlite sa nezmažú, ale počas pádu servera sú
nedostupné aj ich endpointy. Kliknutie na ukážku iba vyplní vstup;
server sa ukončí až po odoslaní formulára.

Obnova služby:

```sh
npm run db:reset
npm run dev
```
