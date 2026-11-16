# Dulce Encanto — acceso con JWT

Proyecto de ejemplo para probar registro, inicio/cierre de sesión, rutas protegidas con JWT, roles y PostgreSQL. Interfaz en HTML/CSS/JavaScript y servidor Node.js/Express.

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- Visual Studio Code (opcional)
- Navegador web

## 1. Crear la base de datos

Abre pgAdmin o `psql` y ejecuta el archivo `database/dulce_encanto.sql`.
El script crea la base de datos. Luego conéctate a `dulce_encanto` y ejecuta también las instrucciones de creación de tabla que aparecen en ese archivo.

## 2. Configurar el proyecto

Desde la carpeta raíz del proyecto:

```bash
npm install
```

Copia `.env.example` y renombra la copia a `.env`. Completa los datos de conexión PostgreSQL y configura `JWT_SECRET` con una cadena aleatoria larga (mínimo 32 caracteres).

En Windows puedes copiarlo desde CMD:
```cmd
copy .env.example .env
```

## 3. Crear tabla (si no se creó al ejecutar el SQL)

Conéctate a `dulce_encanto` y ejecuta:

```sql
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
```

## 4. Iniciar

```bash
npm run dev
```

Abre <http://localhost:3000>.

## 5. Probar

1. En **Crear cuenta**, registra un usuario.
2. Inicia sesión con ese correo y contraseña.
3. Debes entrar al panel de Dulce Encanto.
4. Cierra sesión y comprueba que el panel redirige al login.
5. Comprueba la protección intentando abrir `/api/auth/perfil` sin iniciar sesión: debe responder HTTP 401.

### Dar rol administrador

Por seguridad, el registro público solo crea empleados. Para asignar el primer administrador, ejecuta en pgAdmin, conectado a `dulce_encanto`:

```sql
UPDATE usuarios
SET rol = 'administrador'
WHERE correo = 'tu-correo@ejemplo.com';
```

Cierra sesión e inicia sesión nuevamente. Aparecerá la sección de administración, que consulta la lista de usuarios mediante una ruta protegida por rol.

## Endpoints

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/registro` | Público |
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/logout` | Público |
| GET | `/api/auth/perfil` | Sesión válida |
| GET | `/api/auth/usuarios` | Administrador |
| GET | `/api/health` | Público |

## ¿Dónde está JWT?

Al iniciar sesión, el servidor firma un JWT con `jsonwebtoken` y lo guarda en una cookie `HttpOnly`, que JavaScript del navegador no puede leer. El middleware `middleware/auth.js` verifica la firma y expiración en cada ruta protegida.

## Notas de seguridad

- Las contraseñas se guardan con hash bcrypt; nunca en texto plano.
- El token se guarda en cookie `HttpOnly`, `SameSite=Strict`; en producción se activa `Secure` al configurar `NODE_ENV=production` y usar HTTPS.
- El rol no se recibe desde el formulario de registro; el servidor asigna `empleado`.
- Para producción, añade limitación de intentos de login, política de contraseñas, monitoreo, copias de seguridad y una estrategia CSRF apropiada si amplías el uso de cookies.
- No subas `.env` ni secretos al repositorio.


## Mejoras de seguridad y diseño (versión revisada)
- `GET /dashboard.html` requiere un JWT válido; no se sirve como archivo público.
- El middleware verifica algoritmo HS256, emisor, expiración y estado/rol actual en PostgreSQL.
- El servidor comprueba el encabezado `Origin` en solicitudes de escritura cuando está presente; SameSite Strict contribuye a mitigar CSRF. Para despliegues públicos considerar protección CSRF dedicada y rate limiting.
- Menú del dashboard visible con accesos a productos, pedidos, inventario y seguridad. Estas secciones son **informativas**, no módulos CRUD.
- `JWT_EXPIRES_IN` se mantiene en 2h en el código para coincidir con la duración de la cookie.
- Si se usa HTTPS en producción, configurar `NODE_ENV=production` para activar cookie Secure.

## Evidencias recomendadas
1. Capturar registro, login y dashboard en ejecución.
2. En F12 > Application > Cookies verificar `token` con `HttpOnly` (ocultar el valor).
3. En Network comprobar la petición `/api/auth/perfil` y su respuesta.
4. En una ventana privada visitar `/dashboard.html` y `/api/auth/perfil` para comprobar HTTP 401.
5. Para token inválido, utilizar exclusivamente un valor de prueba y comprobar HTTP 401.
6. No subir `.env`, tokens reales, ni credenciales al informe.

## Almacenamiento local
Los usuarios, roles y hashes de contraseñas se guardan en PostgreSQL local. El navegador ofrece una casilla opcional para recordar **solo el correo electrónico** en `localStorage` (`dulceEncanto.correoRecordado`). El JWT sigue en una cookie HttpOnly; no se guardan tokens ni contraseñas en localStorage. Para borrar el correo recordado, desmarca la casilla e inicia sesión o elimínalo desde F12 > Application > Local Storage.
"# dulce-encanto" 
