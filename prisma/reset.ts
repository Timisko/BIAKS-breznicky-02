import { readFileSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const schema = readFileSync(new URL("./migrations/20261014110645_init/migration.sql", import.meta.url), "utf8");
const products = ["Notebook", "Monitor", "Klávesnica"];

for (const name of ["unsafe", "safe", "orm"]) {
  const databasePath = fileURLToPath(new URL(`../server/${name}.sqlite`, import.meta.url));
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    rmSync(`${databasePath}${suffix}`, { force: true });
  }

  const db = new DatabaseSync(databasePath);
  db.exec(schema);
  const insert = db.prepare('INSERT INTO "Product" (name) VALUES (?)');
  for (const product of products) {
    insert.run(product);
  }
  db.close();
  console.log(`${name}.sqlite: reset hotový, ${products.length} produkty`);
}
