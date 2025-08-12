
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

// Engancha el handler al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-configuracion');
  if (form) form.addEventListener('submit', vincularBastonSubmit);
});

// Handler REAL: guarda el bastón en Mongo usando la API
// Handler REAL: guarda el bastón en Mongo usando la API (con fallback)
async function vincularBastonSubmit(e) {
  e.preventDefault();

  const nombreBaston = document.getElementById('nombre-baston').value.trim();
  const tipoUI       = document.getElementById('tipo-baston').value; // "blanco" | "verde" | "blanco-con-rojo" o ya capitalizado
  const token        = localStorage.getItem('authToken');

  if (!token) {
    alert('Tu sesión expiró, inicia sesión de nuevo.');
    window.location.href = 'login.html';
    return;
  }

  // Mapea al enum del backend
  const mapTipo = { 'blanco':'Blanco', 'verde':'Verde', 'blanco-con-rojo':'Blanco y Rojo',
                    'Blanco':'Blanco', 'Verde':'Verde', 'Blanco y Rojo':'Blanco y Rojo' };
  const tipoBaston = mapTipo[tipoUI] || tipoUI;

  // UI
  const form   = document.getElementById('form-configuracion');
  const loader = document.getElementById('loader-vincular');
  const exito  = document.getElementById('vincular-exito');
  if (form)   form.style.display = 'none';
  if (loader) loader.style.display = 'block';
  if (exito)  exito.style.display  = 'none';

  const nuevoBaston = { nombre: nombreBaston || 'ClearPath', tipo: tipoBaston };

  try {
    // 1) Intento con $push (la forma ideal)
    await apiRequest('/usuarios/me', 'PUT', { $push: { bastones: nuevoBaston } }, token);
  } catch (errPush) {
    console.warn('PUT $push falló, probando fallback $set:', errPush?.message);

    // 2) Fallback: leo el usuario, agrego en cliente y mando todo con $set
    try {
      const me = await apiRequest('/usuarios/me', 'GET', null, token);
      const bastones = Array.isArray(me?.bastones) ? me.bastones.slice() : [];
      bastones.push(nuevoBaston);
      await apiRequest('/usuarios/me', 'PUT', { bastones }, token);
    } catch (errSet) {
      if (loader) loader.style.display = 'none';
      if (form)   form.style.display = 'block';
      console.error('Fallback $set falló:', errSet);
      alert(errSet.message || 'No se pudo vincular el bastón.');
      return;
    }
  }

  // Si llegó aquí, guardó con $push o con $set
  try {
    if (typeof cargarBastones === 'function') await cargarBastones();
    if (loader) loader.style.display = 'none';
    if (exito)  exito.style.display  = 'block';

    setTimeout(() => {
      const modal = document.getElementById('modal-baston');
      if (modal) modal.style.display = 'none';
      if (form) { form.style.display = 'block'; form.reset(); }
      if (exito) exito.style.display = 'none';
    }, 1500);
  } catch (postErr) {
    if (loader) loader.style.display = 'none';
    if (form)   form.style.display = 'block';
    console.error(postErr);
    alert('Se guardó, pero no se pudo refrescar la lista.');
  }
}



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
async function cargarBastones() {
  const token = localStorage.getItem('authToken');
  if (!token) { window.location.href = 'login.html'; return; }

  const lista = document.getElementById('lista-bastones');
  lista.innerHTML = '';

  try {
    const me = await apiRequest('/usuarios/me', 'GET', null, token);
    const bastones = me?.bastones || [];

    if (bastones.length === 0) {
      const vacio = document.createElement('div');
      vacio.style.cssText = 'padding:12px;color:#666;';
      vacio.textContent = 'No tienes bastones asignados todavía.';
      lista.appendChild(vacio);
      return;
    }

    bastones.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'item-btn';
      const bateriaTxt = (b?.estado?.bateria ?? null) !== null ? ` - ${b.estado.bateria}%` : '';
      btn.textContent = `${b?.nombre || 'ClearPath'} (${b?.tipo || '—'})${bateriaTxt}`;
      btn.onclick = () => {
        localStorage.setItem('bastonSeleccionado', JSON.stringify(b));
        window.location.href = 'dispositivos.html';
      };
      lista.appendChild(btn);
    });
  } catch (e) {
    console.error(e);
    alert('No se pudieron cargar tus dispositivos.');
  }
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
    cargarBastones();

    
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

async function eliminarBaston(idBaston) {
  const token = localStorage.getItem('authToken');
  try {
    await apiRequest('/usuarios/me', 'PUT', { $pull: { bastones: { _id: idBaston } } }, token);
    await cargarBastones();
  } catch (e) {
    alert(e.message || 'No se pudo eliminar el bastón');
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
