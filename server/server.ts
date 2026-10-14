import express from "express";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const app = express();

app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello!" });
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
