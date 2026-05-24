import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import app from "./src/serverApp";

// Fix for CJS/ESM compatibility - using a safer approach
const isESM = typeof import.meta !== 'undefined' && import.meta.url;
let _filename = '';
let _dirname = '';

if (isESM) {
  _filename = fileURLToPath(import.meta.url);
  _dirname = path.dirname(_filename);
} else {
  _filename = typeof __filename !== 'undefined' ? __filename : '';
  _dirname = typeof __dirname !== 'undefined' ? __dirname : '';
}

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, server.cjs is IN dist/, so distPath is either current dir or process.cwd()/dist
    let distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(distPath)) {
      distPath = _dirname; // Fallback to current directory of server.cjs
    }
    
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

