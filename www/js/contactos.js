document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const relacion = document.getElementById('relacion').value;
  const telefono = document.getElementById('telefono').value;

  // Guardar contacto en localStorage PRIMERO
  const contacto = {
    nombre: nombre,
    apellido: apellido,
    relacion: relacion,
    telefono: telefono,
    id: Date.now()
  };
  
  const contactosGuardados = JSON.parse(localStorage.getItem('contactos') || '[]');
  contactosGuardados.push(contacto);
  localStorage.setItem('contactos', JSON.stringify(contactosGuardados));

  // Anunciar con TalkBack
  if (window.talkBack) {
    window.talkBack.announceSuccess(`Contacto ${nombre} agregado correctamente`);
  }

  // Recargar la lista completa (evita duplicados)
  cargarContactosGuardados();

  // Limpiar formulario y cerrar modal
  this.reset();
  document.getElementById('modal-contacto').style.display = 'none';
});

// Función para cargar contactos guardados al iniciar la página
function cargarContactosGuardados() {
  const contactosGuardados = JSON.parse(localStorage.getItem('contactos') || '[]');
  const listaContactos = document.getElementById('listaContactos');
  
  // Limpiar la lista antes de cargar (para evitar duplicados)
  listaContactos.innerHTML = '';
  
  // Si no hay contactos, mostrar mensaje
  if (contactosGuardados.length === 0) {
    const mensajeVacio = document.createElement('div');
    mensajeVacio.className = 'mensaje-vacio';
    mensajeVacio.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #666;">
        <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
        <div style="font-size: 16px; margin-bottom: 8px;">No hay contactos guardados</div>
        <div style="font-size: 14px; color: #999;">Agrega tu primer contacto usando el botón "+" arriba</div>
      </div>
    `;
    listaContactos.appendChild(mensajeVacio);
    return;
  }
  
  console.log(`Cargando ${contactosGuardados.length} contactos`);
  
  contactosGuardados.forEach((contacto, index) => {
    console.log(`Creando contacto ${index + 1}: ${contacto.nombre} ${contacto.apellido || ''}`);
    
    const li = document.createElement('li');
    li.className = 'item-contacto';
    li.setAttribute('data-id', contacto.id);
    
    // Crear elementos individualmente para mejor control
    const contactoContent = document.createElement('div');
    contactoContent.className = 'contacto-content';
    
    // Crear contenedor para nombre con más información
    const infoContainer = document.createElement('div');
    infoContainer.className = 'contacto-info';
    
    const nombreCompleto = document.createElement('div');
    nombreCompleto.className = 'nombre-contacto';
    nombreCompleto.textContent = `${contacto.nombre} ${contacto.apellido || ''}`.trim();
    
    // Agregar relación si existe
    if (contacto.relacion) {
      const relacionSpan = document.createElement('div');
      relacionSpan.className = 'relacion-contacto';
      relacionSpan.textContent = contacto.relacion;
      infoContainer.appendChild(relacionSpan);
    }
    
    // Contenedor para botones
    const botonesContainer = document.createElement('div');
    botonesContainer.className = 'botones-contacto';
    
    const btnLlamar = document.createElement('button');
    btnLlamar.className = 'btn-llamar';
    btnLlamar.textContent = '📞 Llamar';
    btnLlamar.title = `Llamar a ${contacto.nombre}`;
    btnLlamar.onclick = function() {
      if (window.talkBack) {
        window.talkBack.announceAction(`Llamando a ${contacto.nombre}`);
      }
      window.location.href = `tel:${contacto.telefono}`;
    };
    
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-eliminar';
    btnEliminar.textContent = '🗑️';
    btnEliminar.title = `Eliminar contacto ${contacto.nombre}`;
    btnEliminar.onclick = function() {
      confirmarEliminacion(contacto.id);
    };
    
    // Construir la estructura
    infoContainer.appendChild(nombreCompleto);
    botonesContainer.appendChild(btnLlamar);
    botonesContainer.appendChild(btnEliminar);
    
    contactoContent.appendChild(infoContainer);
    contactoContent.appendChild(botonesContainer);
    li.appendChild(contactoContent);
    
    listaContactos.appendChild(li);
  });
  
  console.log(`Se cargaron ${contactosGuardados.length} contactos en la lista`);
}

// Función para confirmar eliminación de contacto
function confirmarEliminacion(contactoId) {
  // Buscar el nombre del contacto
  const contactosGuardados = JSON.parse(localStorage.getItem('contactos') || '[]');
  const contacto = contactosGuardados.find(c => c.id === contactoId);
  
  if (contacto && confirm(`¿Estás seguro que quieres eliminar a ${contacto.nombre}?`)) {
    if (window.talkBack) {
      window.talkBack.announceAction(`Eliminando contacto ${contacto.nombre}`);
    }
    eliminarContacto(contactoId);
  }
}

// Función para eliminar un contacto
function eliminarContacto(contactoId, elemento = null) {
  // Eliminar del localStorage
  const contactosGuardados = JSON.parse(localStorage.getItem('contactos') || '[]');
  const contactosFiltrados = contactosGuardados.filter(contacto => contacto.id !== contactoId);
  localStorage.setItem('contactos', JSON.stringify(contactosFiltrados));
  
  // Recargar la lista
  cargarContactosGuardados();
}

// Cargar contactos cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  cargarContactosGuardados();
  
  
});

// Función opcional para limpiar contactos duplicados
function limpiarContactosDuplicados() {
  const contactosGuardados = JSON.parse(localStorage.getItem('contactos') || '[]');
  const contactosUnicos = [];
  const telefonosVistos = new Set();
  
  contactosGuardados.forEach(contacto => {
    if (!telefonosVistos.has(contacto.telefono)) {
      telefonosVistos.add(contacto.telefono);
      contactosUnicos.push(contacto);
    }
  });
  
  localStorage.setItem('contactos', JSON.stringify(contactosUnicos));
  console.log(`Limpiados ${contactosGuardados.length - contactosUnicos.length} contactos duplicados`);
}

// Función para limpiar todos los contactos (emergencia)
function limpiarTodosLosContactos() {
  if (confirm('¿Estás seguro que quieres eliminar todos los contactos?')) {
    localStorage.removeItem('contactos');
    document.getElementById('listaContactos').innerHTML = '';
    alert('Todos los contactos han sido eliminados');
  }
}
