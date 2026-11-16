require("dotenv").config();

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const pool = require("./config/db");
const { verificarToken } = require("./middleware/auth");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Configura JWT_SECRET en .env con al menos 32 caracteres.");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
// No exponer dashboard.html mediante el servidor de archivos estáticos.
app.get("/dashboard.html", verificarToken, (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});
app.use(express.static(path.join(__dirname, "public"), { index: "index.html", extensions: false, setHeaders(res, filePath) {
  if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-store");
} , dotfiles: "deny" , redirect: false, fallthrough: true }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ estado: "ok", baseDatos: "conectada" });
  } catch {
    res.status(503).json({ estado: "error", baseDatos: "sin conexión" });
  }
});

// Protección básica CSRF para acciones que usan cookies de sesión.
app.use("/api/auth", (req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.get("origin");
    const expected = `${req.protocol}://${req.get("host")}`;
    if (origin && origin !== expected) return res.status(403).json({ mensaje: "Origen no autorizado." });
  }
  next();
}, authRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ mensaje: "Error interno del servidor." });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`Dulce Encanto disponible en http://localhost:${PORT}`));
