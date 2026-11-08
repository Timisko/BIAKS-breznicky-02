import express from "express";
import { unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { unsafeDb, safeDb, prisma } from "./database.ts";

export const app = express();

app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello!" });
});

app.get("/api/products/unsafe", (req, res) => {
  const name = String(req.query.name ?? "");
  const sql = `SELECT id, name FROM "Product" WHERE name = '${name}' ORDER BY id`;
  unsafeDb.exec(sql);
  if (!unsafeDb.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'Product'").get()) {
    unsafeDb.close();
    unlinkSync(fileURLToPath(new URL("./unsafe.sqlite", import.meta.url)));
    process.exit(1);
  }
  res.json(unsafeDb.prepare(sql).all());
});

app.get("/api/products/safe", (req, res) => {
  const name = String(req.query.name ?? "");
  res.json(safeDb.prepare('SELECT id, name FROM "Product" WHERE name = ? ORDER BY id').all(name));
});

app.get("/api/products/prisma", async (req, res) => {
  const name = String(req.query.name ?? "");
  res.json(await prisma.product.findMany({ where: { name }, orderBy: { id: "asc" } }));
});

app.use("/api", (_req, res) => {
  res.sendStatus(404);
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dist = fileURLToPath(new URL("../dist/", import.meta.url));

  app.use(express.static(dist));

  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
  });
}
