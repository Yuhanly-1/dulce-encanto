CREATE DATABASE dulce_encanto;

-- Conéctate a la base de datos dulce_encanto y ejecuta lo siguiente:
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'empleado'
        CHECK (rol IN ('administrador', 'empleado')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Después de registrar tu primer usuario desde la pantalla de registro,
-- conviértelo en administrador ejecutando (sustituye el correo):
-- UPDATE usuarios SET rol = 'administrador' WHERE correo = 'tu-correo@ejemplo.com';
