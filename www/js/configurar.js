document.getElementById('form-configuracion').onsubmit = async function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre-baston').value;
  const tipo = document.getElementById('tipo-baston').value;
  
  // Crear objeto del bastón
  const baston = {
    id: Date.now(), // ID único
    nombre: nombre,
    tipo: tipo,
    fechaCreacion: new Date().toISOString(),
    bateria: Math.floor(Math.random() * 41) + 60, // Batería simulada 60-100%
    estado: 'Activo'
  };

  // Guardar en localStorage
  let bastones = JSON.parse(localStorage.getItem('bastones') || '[]');
  bastones.push(baston);
  localStorage.setItem('bastones', JSON.stringify(bastones));

  // Mostrar mensaje de éxito
  document.getElementById('mensaje-configuracion').textContent = 'Configurando...';
  
  setTimeout(() => {
    document.getElementById('mensaje-configuracion').innerHTML = 
      `¡Bastón "${nombre}" (${tipo}) guardado exitosamente!<br>
       <button onclick="window.location.href='index.html'" style="margin-top: 10px;">Regresar al inicio</button>`;
    
    // Anunciar éxito con TalkBack si está disponible
    if (window.talkBack) {
      window.talkBack.announceAction(`Bastón ${nombre} de tipo ${tipo} guardado exitosamente`);
    }
  }, 1500);
};
