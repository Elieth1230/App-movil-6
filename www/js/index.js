// Script principal para la gestión de contactos y dispositivos

// Anunciar página principal cuando se carga
document.addEventListener('DOMContentLoaded', function() {
  // Verificar sesión primero
  setTimeout(() => {
    if (window.talkBack) {
      window.talkBack.announceNavigation('Página principal de la aplicación');
    }
  }, 1000);

  // Crear botón TalkBack como respaldo si no existe
  setTimeout(() => {
    if (!document.getElementById('talkback-toggle')) {
      createTalkBackButton();
    }
  }, 3000);
});

// Función de respaldo para crear el botón TalkBack
function createTalkBackButton() {
  const isEnabled = localStorage.getItem('talkback-enabled') === 'true';
  
  const button = document.createElement('button');
  button.id = 'talkback-toggle';
  button.textContent = isEnabled ? '🔊 TalkBack ON' : '🔇 TalkBack OFF';
  button.style.cssText = `
    position: fixed !important;
    top: 10px !important;
    right: 10px !important;
    z-index: 10000 !important;
    padding: 10px 15px !important;
    border: none !important;
    border-radius: 25px !important;
    background-color: ${isEnabled ? '#4CAF50' : '#9E9E9E'} !important;
    color: white !important;
    font-weight: bold !important;
    font-size: 12px !important;
    cursor: pointer !important;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
    transition: all 0.3s ease !important;
    min-width: 100px !important;
    text-align: center !important;
    display: block !important;
  `;
  
  button.onclick = () => {
    if (window.talkBack) {
      window.talkBack.toggle();
    } else {
      // Toggle manual si talkBack no está disponible
      const newState = !isEnabled;
      localStorage.setItem('talkback-enabled', newState);
      button.textContent = newState ? '🔊 TalkBack ON' : '🔇 TalkBack OFF';
      button.style.backgroundColor = newState ? '#4CAF50' : '#9E9E9E';
    }
  };
  
  document.body.appendChild(button);
  console.log('✅ Backup TalkBack button created');
}

// -------- CONTACTO --------
document.getElementById('add-contacto').addEventListener('click', () => {
  if (window.talkBack) {
    window.talkBack.announceAction('Abriendo formulario para agregar contacto');
  }
  document.getElementById('modal-contacto').style.display = 'flex';
});

document.getElementById('cerrar-modal-contacto').addEventListener('click', () => {
  if (window.talkBack) {
    window.talkBack.announceAction('Cerrando formulario de contacto');
  }
  document.getElementById('modal-contacto').style.display = 'none';
});

document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const telefono = document.getElementById('telefono').value;

  const li = document.createElement('li');
  li.className = 'item-contacto';
  li.innerHTML = `
    <span class="nombre-contacto">${nombre}</span>
    <span class="telefono-contacto">${telefono}</span>
  `;

  const btnLlamar = document.createElement('button');
  btnLlamar.className = 'btn-llamar';
  btnLlamar.textContent = 'Llamar';
  btnLlamar.onclick = () => window.location.href = `tel:${telefono}`;

  li.appendChild(btnLlamar);
  document.getElementById('listaContactos').appendChild(li);

  this.reset();
  document.getElementById('modal-contacto').style.display = 'none';
});

// -------- BASTÓN --------
document.getElementById('add-baston').addEventListener('click', () => {
  document.getElementById('modal-baston').style.display = 'flex';
});

document.getElementById('cerrar-modal-baston').addEventListener('click', () => {
  document.getElementById('modal-baston').style.display = 'none';
});

document.getElementById('form-configuracion').addEventListener('submit', function (e) {
  e.preventDefault();
  const nombreBaston = document.getElementById('nombre-baston').value;
  const tipoBaston = document.getElementById('tipo-baston').value;

  // Oculta formulario y muestra loader
  this.style.display = 'none';
  document.getElementById('loader-vincular').style.display = 'block';
  document.getElementById('vincular-exito').style.display = 'none';

  // Crear objeto del bastón
  const baston = {
    id: Date.now(),
    nombre: nombreBaston,
    tipo: tipoBaston,
    fechaCreacion: new Date().toISOString(),
    bateria: Math.floor(Math.random() * 41) + 60, // Batería simulada 60-100%
    estado: 'Activo'
  };

  // Guardar en localStorage
  let bastones = JSON.parse(localStorage.getItem('bastones') || '[]');
  bastones.push(baston);
  localStorage.setItem('bastones', JSON.stringify(bastones));

  // Simular guardado
  setTimeout(() => {
    document.getElementById('loader-vincular').style.display = 'none';
    document.getElementById('vincular-exito').style.display = 'block';

    // Crear el botón del dispositivo
    const btn = document.createElement('button');
    btn.className = 'item-btn';
    btn.textContent = `${nombreBaston} (${tipoBaston})`;
    btn.onclick = function() {
      // Guardar el bastón seleccionado en localStorage
      localStorage.setItem('bastonSeleccionado', JSON.stringify(baston));
      window.location.href = 'dispositivos.html';
    };
    document.getElementById('lista-bastones').appendChild(btn);

    // Anunciar éxito con TalkBack
    if (window.talkBack) {
      window.talkBack.announceAction(`Bastón ${nombreBaston} de tipo ${tipoBaston} guardado exitosamente`);
    }

    setTimeout(() => {
      document.getElementById('modal-baston').style.display = 'none';
      document.getElementById('form-configuracion').style.display = 'block';
      document.getElementById('vincular-exito').style.display = 'none';
      document.getElementById('form-configuracion').reset();
    }, 2000);
  }, 1500);
});

  // Función para mostrar el detalle del bastón
  function mostrarDetalleBaston(nombre, bateria, sensores) {
    document.getElementById('modal-nombre').textContent = nombre;
    document.getElementById('modal-bateria').textContent = bateria + '%';
    const ul = document.getElementById('modal-componentes');
    ul.innerHTML = '';
    // Puedes agregar aquí los componentes si los tienes
    // ul.appendChild(...)
    document.getElementById('modal-detalle').style.display = 'flex';
  }

// Función para cargar bastones guardados al iniciar la aplicación
function cargarBastones() {
  const bastones = JSON.parse(localStorage.getItem('bastones') || '[]');
  const listaBastones = document.getElementById('lista-bastones');
  
  bastones.forEach(baston => {
    const btn = document.createElement('button');
    btn.className = 'item-btn';
    btn.textContent = `${baston.nombre} (${baston.tipo})`;
    btn.onclick = function() {
      localStorage.setItem('bastonSeleccionado', JSON.stringify(baston));
      window.location.href = 'dispositivos.html';
    };
    listaBastones.appendChild(btn);
  });
}

// -------- AUTENTICACIÓN --------
// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  checkAuthSession();
  initLogout();
  cargarBastones(); // Cargar bastones guardados
});

function checkAuthSession() {
  const userSession = localStorage.getItem('userSession');
  
  if (!userSession) {
    // No hay sesión, redirigir al login
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const session = JSON.parse(userSession);
    
    // Verificar si la sesión ha expirado
    const now = new Date().getTime();
    const sessionExpiry = new Date(session.expiry).getTime();
    
    if (now > sessionExpiry) {
      // Sesión expirada
      localStorage.removeItem('userSession');
      localStorage.removeItem('rememberMe');
      window.location.href = 'login.html';
      return;
    }
    
    // Sesión válida, mostrar información del usuario
    displayUserInfo(session);
    
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    localStorage.removeItem('userSession');
    localStorage.removeItem('rememberMe');
    window.location.href = 'login.html';
  }
}

function displayUserInfo(session) {
  const userName = document.getElementById('userName');
  if (userName) {
    // Mostrar nombre del usuario o email si no hay nombre
    const displayName = session.name || session.email.split('@')[0];
    userName.textContent = displayName;
  }
}

function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Confirmar logout
      if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        if (window.talkBack) {
          window.talkBack.announceAction('Cerrando sesión');
        }
        logout();
      }
    });
  }
}

function logout() {
  // Limpiar datos de sesión
  localStorage.removeItem('userSession');
  localStorage.removeItem('rememberMe');
  
  // Limpiar otros datos si es necesario
  // localStorage.clear(); // Esto limpia todo, úsalo si quieres limpiar todos los datos
  
  if (window.talkBack) {
    window.talkBack.announceNavigation('Regresando al inicio de sesión');
  }
  
  // Redirigir al login
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// Función para verificar sesión periódicamente (opcional)
function startSessionCheck() {
  setInterval(() => {
    checkAuthSession();
  }, 60000); // Verificar cada minuto
}

// Iniciar verificación periódica (opcional)
// startSessionCheck();
