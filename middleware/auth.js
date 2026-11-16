const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function verificarToken(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ mensaje: "Inicia sesión para continuar." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "dulce-encanto" });
    const result = await pool.query("SELECT id, nombre, correo, rol, activo FROM usuarios WHERE id = $1", [payload.id]);
    const user = result.rows[0];
    if (!user || !user.activo) {
      res.clearCookie("token", cookieOptions());
      return res.status(401).json({ mensaje: "Cuenta no disponible." });
    }
    req.usuario = { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
    next();
  } catch (error) {
    if (!error.name?.includes("JsonWebToken") && error.name !== "TokenExpiredError" && error.name !== "NotBeforeError") {
      console.error("Verificación de sesión:", error.message);
      return res.status(503).json({ mensaje: "No se pudo verificar la sesión." });
    }
    res.clearCookie("token", cookieOptions());
    return res.status(401).json({ mensaje: "La sesión expiró. Inicia sesión nuevamente." });
  }
}

function soloAdministrador(req, res, next) {
  if (req.usuario?.rol !== "administrador") {
    return res.status(403).json({ mensaje: "No tienes permisos para esta acción." });
  }
  next();
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  };
}

module.exports = { verificarToken, soloAdministrador, cookieOptions };
