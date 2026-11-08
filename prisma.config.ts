import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${fileURLToPath(new URL("./server/orm.sqlite", import.meta.url))}`,
  },
});
