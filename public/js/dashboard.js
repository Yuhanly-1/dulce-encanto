const welcomeName = document.getElementById("welcomeName");
const userName = document.getElementById("userName");
const roleBadge = document.getElementById("roleBadge");
const adminPanel = document.getElementById("adminPanel");

async function loadProfile() {
  const response = await fetch("/api/auth/perfil", { credentials: "same-origin" });
  if (!response.ok) {
    window.location.replace("/");
    return;
  }
  const data = await response.json();
  const user = data.usuario;
  welcomeName.textContent = user.nombre.split(" ")[0];
  userName.textContent = user.nombre;
  roleBadge.textContent = user.rol === "administrador" ? "Administrador" : "Empleado";
  if (user.rol === "administrador") adminPanel.classList.remove("hidden");
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  window.location.replace("/");
});

document.getElementById("loadUsers").addEventListener("click", async () => {
  const output = document.getElementById("usersResult");
  output.textContent = "Consultando...";
  try {
    const response = await fetch("/api/auth/usuarios", { credentials: "same-origin" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.mensaje || "No se pudo consultar.");
    const table = document.createElement("table");
    table.innerHTML = "<thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead>";
    const tbody = document.createElement("tbody");
    data.usuarios.forEach((u) => {
      const tr = document.createElement("tr");
      [u.nombre, u.correo, u.rol, u.activo ? "Activo" : "Inactivo"].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    output.replaceChildren(table);
  } catch (error) {
    output.textContent = error.message;
  }
});

loadProfile();
