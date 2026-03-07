import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "history.db");
console.log(`Initializing database at: ${dbPath}`);
const db = new Database(dbPath);

// Initialize database
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS analysis_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      result_json TEXT NOT NULL,
      model_used TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Database tables initialized successfully.");
} catch (err) {
  console.error("Failed to initialize database tables:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/history", (req, res) => {
    try {
      const history = db.prepare("SELECT * FROM analysis_history ORDER BY timestamp DESC LIMIT 50").all();
      res.json(history);
    } catch (err) {
      console.error("Error fetching history:", err);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/history", (req, res) => {
    try {
      const { text, result_json, model_used } = req.body;
      const info = db.prepare("INSERT INTO analysis_history (text, result_json, model_used) VALUES (?, ?, ?)").run(text, result_json, model_used);
      res.json({ id: info.lastInsertRowid });
    } catch (err) {
      console.error("Error saving history:", err);
      res.status(500).json({ error: "Failed to save history" });
    }
  });

  app.get("/api/logs", (req, res) => {
    try {
      const logs = db.prepare("SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 100").all();
      res.json(logs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  app.post("/api/logs", (req, res) => {
    try {
      const { level, message } = req.body;
      db.prepare("INSERT INTO system_logs (level, message) VALUES (?, ?)").run(level, message);
      res.status(201).send();
    } catch (err) {
      console.error("Error saving log:", err);
      res.status(500).json({ error: "Failed to save log" });
    }
  });

  app.delete("/api/history/:id", (req, res) => {
    db.prepare("DELETE FROM analysis_history WHERE id = ?").run(req.params.id);
    res.status(204).send();
  });

  app.delete("/api/history", (req, res) => {
    db.prepare("DELETE FROM analysis_history").run();
    res.status(204).send();
  });

  app.delete("/api/logs/:id", (req, res) => {
    db.prepare("DELETE FROM system_logs WHERE id = ?").run(req.params.id);
    res.status(204).send();
  });

  app.delete("/api/logs", (req, res) => {
    db.prepare("DELETE FROM system_logs").run();
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
