import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.ts";

export const unsafeDb = new DatabaseSync(fileURLToPath(new URL("./unsafe.sqlite", import.meta.url)));
export const safeDb = new DatabaseSync(fileURLToPath(new URL("./safe.sqlite", import.meta.url)));
export const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: `file:${fileURLToPath(new URL("./orm.sqlite", import.meta.url))}`,
  }),
});
