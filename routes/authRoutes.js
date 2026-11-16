const router = require("express").Router();
const controller = require("../controllers/authController");
const { verificarToken, soloAdministrador } = require("../middleware/auth");
const pool = require("../config/db");

router.post("/registro", controller.registrar);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/perfil", verificarToken, controller.perfil);

// Ejemplo de ruta restringida al rol administrador.
router.get("/usuarios", verificarToken, soloAdministrador, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, correo, rol, activo, fecha_registro FROM usuarios ORDER BY id"
    );
    res.json({ usuarios: result.rows });
  } catch (error) {
    console.error("Usuarios:", error.message);
    res.status(500).json({ mensaje: "No se pudieron consultar los usuarios." });
  }
});

module.exports = router;
