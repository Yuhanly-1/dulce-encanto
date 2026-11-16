const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const rememberEmail = document.getElementById("rememberEmail");
const savedEmail = localStorage.getItem("dulceEncanto.correoRecordado");
if (savedEmail) {
  document.getElementById("loginCorreo").value = savedEmail;
  rememberEmail.checked = true;
}

function showMessage(text, success = false) {
  message.textContent = text;
  message.className = success ? "message success" : "message";
}

function setTab(mode) {
  const login = mode === "login";
  loginForm.classList.toggle("hidden", !login);
  registerForm.classList.toggle("hidden", login);
  loginTab.classList.toggle("active", login);
  registerTab.classList.toggle("active", !login);
  showMessage("");
}
loginTab.addEventListener("click", () => setTab("login"));
registerTab.addEventListener("click", () => setTab("register"));

async function send(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.mensaje || "No se pudo completar la operación.");
  return result;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button[type=submit]");
  button.disabled = true;
  showMessage("Verificando tus datos...");
  try {
    await send("/api/auth/login", {
      correo: loginForm.correo.value,
      password: loginForm.password.value
    });
    if (rememberEmail.checked) {
      localStorage.setItem("dulceEncanto.correoRecordado", loginForm.correo.value.trim().toLowerCase());
    } else {
      localStorage.removeItem("dulceEncanto.correoRecordado");
    }
    window.location.href = "/dashboard.html";
  } catch (error) {
    showMessage(error.message);
  } finally {
    button.disabled = false;
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = registerForm.querySelector("button[type=submit]");
  button.disabled = true;
  showMessage("Creando tu cuenta...");
  try {
    const result = await send("/api/auth/registro", {
      nombre: registerForm.nombre.value,
      correo: registerForm.correo.value,
      password: registerForm.password.value
    });
    registerForm.reset();
    setTab("login");
    document.getElementById("loginCorreo").value = result.usuario.correo;
    showMessage(result.mensaje, true);
  } catch (error) {
    showMessage(error.message);
  } finally {
    button.disabled = false;
  }
});

// Si ya existe una sesión, entrar directamente al panel.
fetch("/api/auth/perfil", { credentials: "same-origin" })
  .then((r) => { if (r.ok) window.location.replace("/dashboard.html"); })
  .catch(() => {});
