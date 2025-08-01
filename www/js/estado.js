function obtenerEstado() {
  // Cambia esta IP por la IP del ESP32 si está en modo AP
  const url = "http://192.168.4.1/status";

  fetch(url)
    .then(response => response.json())
    .then(data => {
      document.getElementById("proximidad").textContent = data.proximidad + " cm";
      document.getElementById("sos").textContent = data.sos === 1 ? "¡ACTIVADO!" : "Inactivo";
      document.getElementById("bateria").textContent = data.bateria + "%";
      document.getElementById("conexion").textContent = data.conectado ? "Conectado" : "Desconectado";
    })
    .catch(err => {
      console.error("Error al obtener estado:", err);
      alert("No se pudo conectar al bastón.");
    });
}

// Carga el estado automáticamente al abrir
window.onload = obtenerEstado;
