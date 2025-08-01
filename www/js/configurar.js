document.getElementById('form-configuracion').onsubmit = async function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre-baston').value;
  const ssid = document.getElementById('ssid').value;
  const password = document.getElementById('password').value;
  // Aquí deberías enviar la configuración al ESP32 (por ejemplo, usando fetch a la IP del ESP32)
  // Este es un ejemplo simulado:
  document.getElementById('mensaje-configuracion').textContent = 'Configurando...';
  setTimeout(() => {
    document.getElementById('mensaje-configuracion').textContent = '¡Bastón configurado y conectado!';
    // Aquí podrías redirigir a dispositivos.html o guardar el dispositivo
  }, 2000);
};
