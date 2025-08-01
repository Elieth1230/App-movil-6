
function mostrarDetalleBaston(nombre, bateria, componentes) {
  document.getElementById('detalle-nombre').textContent = nombre;
  document.getElementById('detalle-bateria').textContent = bateria + '%';
  var ul = document.getElementById('detalle-componentes');
  ul.innerHTML = '';
  componentes.forEach(function(comp) {
    var li = document.createElement('li');
    li.textContent = comp;
    ul.appendChild(li);
  });
  document.getElementById('detalle-baston').style.display = 'block';
}
