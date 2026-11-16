const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { cookieOptions } = require("../middleware/auth");

exports.registrar = async (req, res) => {
  try {
    const nombre = String(req.body.nombre || "").trim();
    const correo = String(req.body.correo || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!nombre || !correo || !password) {
      return res.status(400).json({ mensaje: "Completa todos los campos." });
    }
    if (nombre.length > 100 || correo.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ mensaje: "Verifica el nombre y el correo electrónico." });
    }
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ mensaje: "La contraseña debe tener entre 8 y 72 bytes." });
    }

    const hash = await bcrypt.hash(password, 12);
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, correo, rol`,
      [nombre, correo, hash]
    );

    res.status(201).json({
      mensaje: "Cuenta creada. Ya puedes iniciar sesión.",
      usuario: resultado.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ mensaje: "Ese correo ya está registrado." });
    }
    console.error("Registro:", error.message);
    res.status(500).json({ mensaje: "No se pudo completar el registro." });
  }
};

exports.login = async (req, res) => {
  try {
    const correo = String(req.body.correo || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!correo || !password) {
      return res.status(400).json({ mensaje: "Escribe tu correo y contraseña." });
    }

    const resultado = await pool.query(
      `SELECT id, nombre, correo, password_hash, rol, activo
       FROM usuarios WHERE correo = $1`,
      [correo]
    );
    const usuario = resultado.rows[0];

    if (!usuario || !usuario.activo || !(await bcrypt.compare(password, usuario.password_hash))) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "2h", issuer: "dulce-encanto" }
    );

    res.cookie("token", token, {
      ...cookieOptions(),
      maxAge: 2 * 60 * 60 * 1000
    });

    res.json({
      mensaje: `¡Bienvenido/a, ${usuario.nombre}!`,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
    });
  } catch (error) {
    console.error("Login:", error.message);
    res.status(500).json({ mensaje: "Ocurrió un error al iniciar sesión." });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", cookieOptions());
  res.json({ mensaje: "Sesión cerrada correctamente." });
};

exports.perfil = async (req, res) => {
  res.json({ usuario: req.usuario });
};
