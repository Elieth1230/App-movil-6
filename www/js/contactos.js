document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const relacion = document.getElementById('relacion').value;
  let telefono = document.getElementById('telefono').value;

  // Validar ANTES de formatear
  const telefonoSoloDigitos = telefono.replace(/[^\d]/g, '');
  if (telefonoSoloDigitos.length < 10) {
    alert('Contacto agregado exitosamente');
    return;
  }
  
  // Limpiar y formatear el número de teléfono después de validar
  telefono = limpiarNumeroTelefono(telefono);

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

// Función para limpiar y formatear número de teléfono
function limpiarNumeroTelefono(numero) {
  // Remover todos los caracteres que no sean dígitos, +, (, ), -, espacios
  let numeroLimpio = numero.replace(/[^\d\+\-\(\)\s]/g, '');
  
  // Si empieza con +52 (México), mantenerlo
  if (numeroLimpio.startsWith('+52')) {
    return numeroLimpio;
  }
  
  // Si solo son dígitos y tiene 10 números, es un número mexicano
  const soloDigitos = numeroLimpio.replace(/[^\d]/g, '');
  if (soloDigitos.length === 10) {
    return `+52${soloDigitos}`;
  }
  
  // Si tiene 12 dígitos y empieza con 52, agregar +
  if (soloDigitos.length === 12 && soloDigitos.startsWith('52')) {
    return `+${soloDigitos}`;
  }
  
  // Para otros casos, devolver el número limpio
  return numeroLimpio;
}

// Función para validar número de teléfono
function validarNumeroTelefono(numero) {
  const soloDigitos = numero.replace(/[^\d]/g, '');
  
  // Mínimo 10 dígitos, máximo 15 (estándar internacional)
  if (soloDigitos.length < 10 || soloDigitos.length > 15) {
    return false;
  }
  
  return true;
}

// Función para preparar el número para la llamada
function prepararNumeroParaLlamada(numeroOriginal) {
  // Remover espacios y caracteres especiales excepto + y dígitos
  let numero = numeroOriginal.replace(/[^\d\+]/g, '');
  
  // Si ya tiene código de país, usarlo tal como está
  if (numero.startsWith('+')) {
    return numero;
  }
  
  // Si empieza con 52 y tiene 12 dígitos, agregar +
  if (numero.startsWith('52') && numero.length === 12) {
    return '+' + numero;
  }
  
  // Si tiene exactamente 10 dígitos, asumir que es México
  if (numero.length === 10) {
    return '+52' + numero;
  }
  
  // Para otros casos, devolver el número tal como está
  return numero;
}

// Función fallback para iniciar llamada
function iniciarLlamadaFallback(numero) {
  try {
    // Intentar con location.href primero
    window.location.href = `tel:${numero}`;
  } catch (error) {
    console.log('Error con location.href, intentando con window.open');
    try {
      // Fallback con window.open
      window.open(`tel:${numero}`, '_system');
    } catch (error2) {
      console.log('Error con window.open:', error2);
      // Último intento con una ventana nueva
      const newWindow = window.open('', '_blank');
      newWindow.location.href = `tel:${numero}`;
    }
  }
}

// Función para cargar contactos guardados al iniciar la página
function cargarContactosGuardados() {
  const contactosGuardados = JSON.parse(localStorage.getItem('contactos') || '[]');
  const listaContactos = document.getElementById('listaContactos');
  
  // Limpiar la lista antes de cargar (para evitar duplicados)
  listaContactos.innerHTML = '';
  
  contactosGuardados.forEach((contacto, index) => {
    const li = document.createElement('li');
    li.className = 'item-contacto';
    li.setAttribute('data-id', contacto.id);
    
    // Crear elementos individualmente para mejor control
    const contactoContent = document.createElement('div');
    contactoContent.className = 'contacto-content swipe-container';
    
    const nombreSpan = document.createElement('span');
    nombreSpan.className = 'nombre-contacto';
    nombreSpan.textContent = `${contacto.nombre} ${contacto.apellido}`;
    nombreSpan.style.display = 'block';
    nombreSpan.style.fontWeight = 'bold';
    nombreSpan.style.fontSize = '16px';
    nombreSpan.style.color = '#333';
    nombreSpan.style.flex = '1';
    
    const telefonoSpan = document.createElement('span');
    telefonoSpan.className = 'telefono-contacto';
    telefonoSpan.textContent = contacto.telefono;
    telefonoSpan.style.display = 'block';
    telefonoSpan.style.fontSize = '14px';
    telefonoSpan.style.color = '#666';
    telefonoSpan.style.marginTop = '4px';
    
    const btnLlamar = document.createElement('button');
    btnLlamar.className = 'btn-llamar';
    btnLlamar.textContent = '📞 Llamar';
    btnLlamar.title = `Llamar a ${contacto.nombre}`;
    btnLlamar.onclick = function() {
      if (window.talkBack) {
        window.talkBack.announceAction(`Llamando a ${contacto.nombre}`);
      }
      
      // Preparar el número para la llamada
      const numeroParaLlamar = prepararNumeroParaLlamada(contacto.telefono);
      console.log('Número original:', contacto.telefono);
      console.log('Número para llamar:', numeroParaLlamar);
      
      // Usar el plugin de Cordova para llamar directamente
      if (typeof cordova !== 'undefined' && window.plugins && window.plugins.CallNumber) {
        window.plugins.CallNumber.callNumber(
          function(success) {
            console.log('Llamada iniciada exitosamente:', success);
          },
          function(error) {
            console.log('Error al iniciar llamada con plugin:', error);
            // Fallback al método tradicional
            iniciarLlamadaFallback(numeroParaLlamar);
          },
          numeroParaLlamar,
          true // bypassAppChooser
        );
      } else {
        // Fallback para navegador o si el plugin no está disponible
        iniciarLlamadaFallback(numeroParaLlamar);
      }
    };
    
    // Crear botón de eliminar oculto para swipe
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-eliminar-hidden';
    btnEliminar.textContent = '🗑️ Eliminar';
    btnEliminar.onclick = function() {
      confirmarEliminacion(contacto.id);
    };
    
    contactoContent.appendChild(nombreSpan);
    contactoContent.appendChild(telefonoSpan);
    contactoContent.appendChild(btnLlamar);
    contactoContent.appendChild(btnEliminar);
    
    // Agregar funcionalidad de swipe
    agregarFuncionalidadSwipe(contactoContent, contacto.id);
    
    li.appendChild(contactoContent);
    listaContactos.appendChild(li);
  });
}

// Función para agregar funcionalidad de swipe a los contactos
function agregarFuncionalidadSwipe(elemento, contactoId) {
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;
  let isSwipeOpen = false;
  
  // Touch events para móviles
  elemento.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    isSwiping = true;
  });
  
  elemento.addEventListener('touchmove', function(e) {
    if (!isSwiping) return;
    
    currentX = e.touches[0].clientX;
    const diffX = startX - currentX;
    
    // Solo permitir swipe hacia la izquierda (diffX > 0)
    if (diffX > 0 && diffX < 100) {
      elemento.style.transform = `translateX(-${diffX}px)`;
      e.preventDefault();
    }
  });
  
  elemento.addEventListener('touchend', function(e) {
    if (!isSwiping) return;
    
    const diffX = startX - currentX;
    
    if (diffX > 50) { // Umbral para activar el swipe
      // Mostrar botón de eliminar
      elemento.style.transform = 'translateX(-80px)';
      elemento.classList.add('swipe-open');
      isSwipeOpen = true;
      
      // Anunciar con TalkBack
      if (window.talkBack) {
        window.talkBack.announceAction('Deslizar completado. Botón eliminar visible.');
      }
    } else {
      // Volver a la posición original
      elemento.style.transform = 'translateX(0)';
      elemento.classList.remove('swipe-open');
      isSwipeOpen = false;
    }
    
    isSwiping = false;
  });
  
  // Mouse events para escritorio (opcional)
  let isMouseDown = false;
  
  elemento.addEventListener('mousedown', function(e) {
    startX = e.clientX;
    isMouseDown = true;
  });
  
  elemento.addEventListener('mousemove', function(e) {
    if (!isMouseDown) return;
    
    currentX = e.clientX;
    const diffX = startX - currentX;
    
    if (diffX > 0 && diffX < 100) {
      elemento.style.transform = `translateX(-${diffX}px)`;
    }
  });
  
  elemento.addEventListener('mouseup', function(e) {
    if (!isMouseDown) return;
    
    const diffX = startX - currentX;
    
    if (diffX > 50) {
      elemento.style.transform = 'translateX(-80px)';
      elemento.classList.add('swipe-open');
      isSwipeOpen = true;
    } else {
      elemento.style.transform = 'translateX(0)';
      elemento.classList.remove('swipe-open');
      isSwipeOpen = false;
    }
    
    isMouseDown = false;
  });
  
  // Cerrar swipe al hacer clic en otra parte
  document.addEventListener('click', function(e) {
    if (isSwipeOpen && !elemento.contains(e.target)) {
      elemento.style.transform = 'translateX(0)';
      elemento.classList.remove('swipe-open');
      isSwipeOpen = false;
    }
  });
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
  
  // Agregar validación en tiempo real al campo de teléfono
  const telefonoInput = document.getElementById('telefono');
  if (telefonoInput) {
    telefonoInput.addEventListener('input', function() {
      // Permitir solo números, +, -, (, ), espacios
      this.value = this.value.replace(/[^\d\+\-\(\)\s]/g, '');
    });
    
    telefonoInput.addEventListener('blur', function() {
      const numero = this.value.trim();
      if (numero && !validarNumeroTelefono(numero)) {
        this.setCustomValidity('El número debe tener entre 10 y 15 dígitos');
      } else {
        this.setCustomValidity('');
      }
    });
  }
  
  // Función para limpiar contactos duplicados (opcional)
  // Descomenta la siguiente línea si quieres limpiar duplicados automáticamente
  // limpiarContactosDuplicados();
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