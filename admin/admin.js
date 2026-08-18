import { supabase } from '../js/supabaseClient.js';
import { CONFIG } from '../js/config.js';
import { generarCodigo } from '../js/codigo.js';

const formLogin = document.getElementById('form-login');
const errorMsg = document.getElementById('error-msg');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const btnLogout = document.getElementById('btn-logout');
const formAnimal = document.getElementById('form-animal');
const selectEspecie = document.getElementById('especie');

const adminBuscar = document.getElementById('admin-buscar');
const adminFiltroEspecie = document.getElementById('admin-filtro-especie');
const adminFiltroEdad = document.getElementById('admin-filtro-edad');
const adminFiltroSexo = document.getElementById('admin-filtro-sexo');
const adminFiltroTamano = document.getElementById('admin-filtro-tamano');
const adminFiltroEstado = document.getElementById('admin-filtro-estado');

let todosLosAnimales = [];

// --- LOGIN ---
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      errorMsg.textContent = 'Email o contraseña incorrectos.';
      return;
    }

    window.location.href = 'dashboard.html';
  });
}

// --- DASHBOARD ---
if (cuerpoTabla) {
  verificarSesion();
  cargarOpcionesFiltroEspecie();
  cargarAnimales();

  if (adminBuscar) {
    adminBuscar.addEventListener('input', aplicarFiltros);
    adminFiltroEspecie.addEventListener('change', aplicarFiltros);
    adminFiltroEdad.addEventListener('change', aplicarFiltros);
    adminFiltroSexo.addEventListener('change', aplicarFiltros);
    adminFiltroTamano.addEventListener('change', aplicarFiltros);
    adminFiltroEstado.addEventListener('change', aplicarFiltros);
  }
}

// --- FORM (session guard) ---
if (formAnimal) {
  verificarSesion();
}

// --- AUTH STATE LISTENER (all admin pages) ---
if (cuerpoTabla || formAnimal) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (!session)) {
      window.location.href = 'login.html';
    }
  });
}

async function verificarSesion() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
  }
}

async function cargarAnimales() {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .order('fecha_ingreso', { ascending: false });

  if (error) {
    console.error('Error al cargar animales:', error);
    return;
  }

  todosLosAnimales = data;
  aplicarFiltros();
}

function cargarOpcionesFiltroEspecie() {
  if (!adminFiltroEspecie) return;
  CONFIG.especies.forEach(especie => {
    const option = document.createElement('option');
    option.value = especie;
    option.textContent = especie.charAt(0).toUpperCase() + especie.slice(1);
    adminFiltroEspecie.appendChild(option);
  });
}

function aplicarFiltros() {
  const texto = (adminBuscar.value || '').toLowerCase().trim();
  const especie = adminFiltroEspecie.value;
  const edad = adminFiltroEdad.value;
  const sexo = adminFiltroSexo.value;
  const tamano = adminFiltroTamano.value;
  const estado = adminFiltroEstado.value;

  const filtrados = todosLosAnimales.filter(animal => {
    const codigo = generarCodigo(animal).toLowerCase();
    const coincideTexto = !texto ||
      (animal.nombre || '').toLowerCase().includes(texto) ||
      codigo.includes(texto);
    return coincideTexto &&
      (!especie || animal.especie === especie) &&
      (!edad || animal.edad === edad) &&
      (!sexo || animal.sexo === sexo) &&
      (!tamano || animal.tamano === tamano) &&
      (!estado || animal.estado === estado);
  });

  renderizarTabla(filtrados);
}

function renderizarTabla(animales) {
  cuerpoTabla.innerHTML = '';

  if (animales.length === 0) {
    cuerpoTabla.innerHTML = '<tr><td colspan="6" class="sin-resultados">No hay animales que coincidan con la búsqueda.</td></tr>';
    return;
  }

  animales.forEach(animal => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><img src="${animal.foto_url || '../img/placeholder.png'}" class="foto-mini"></td>
      <td data-label="Nombre">${animal.nombre}</td>
      <td><span class="admin-badges"><span class="celda-codigo" data-label="Código">${generarCodigo(animal)}</span><span class="badge-admin-especie" data-label="Especie">${animal.especie}</span></span></td>
      <td data-label="Estado">
        <select class="select-estado" data-id="${animal.id}">
          <option value="disponible" ${animal.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
          <option value="adoptado" ${animal.estado === 'adoptado' ? 'selected' : ''}>Adoptado</option>
        </select>
      </td>
      <td data-label="Acciones">
        <a href="form.html?id=${animal.id}">Editar</a>
        <button class="btn-eliminar" data-id="${animal.id}">Eliminar</button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });

  agregarListenersBotones();
}

function agregarListenersBotones() {
  document.querySelectorAll('.select-estado').forEach(select => {
    select.addEventListener('change', async () => {
      const id = select.dataset.id;
      const { error } = await supabase
        .from('animals')
        .update({ estado: select.value })
        .eq('id', id);

      if (error) {
        alert('Error al actualizar el estado.');
      }
      cargarAnimales();
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const confirmar = confirm('¿Seguro que querés eliminar este animal? Esta acción no se puede deshacer.');
      if (!confirmar) return;

      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error al eliminar.');
        return;
      }
      cargarAnimales();
    });
  });
}

if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
  });
}

// --- FORMULARIO (alta/edición) ---
function cargarOpcionesEspecie() {
  selectEspecie.innerHTML = '';
  CONFIG.especies.forEach(especie => {
    const option = document.createElement('option');
    option.value = especie;
    option.textContent = especie.charAt(0).toUpperCase() + especie.slice(1);
    selectEspecie.appendChild(option);
  });
}

async function precargarAnimal(id) {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error al cargar animal para editar:', error);
    return;
  }

  document.getElementById('nombre').value = data.nombre;
  document.getElementById('especie').value = data.especie;
  document.getElementById('edad').value = data.edad;
  document.getElementById('sexo').value = data.sexo;
  document.getElementById('tamano').value = data.tamano;
  document.getElementById('descripcion').value = data.descripcion || '';

  if (data.foto_url) {
    const preview = document.getElementById('preview-foto');
    preview.src = data.foto_url;
    preview.style.display = 'block';
  }
}

async function subirFoto(archivo) {
  const nombreArchivo = `${Date.now()}_${archivo.name}`;

  const { error } = await supabase.storage
    .from('fotos-animales')
    .upload(nombreArchivo, archivo);

  if (error) {
    console.error('Error al subir la foto:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('fotos-animales')
    .getPublicUrl(nombreArchivo);

  return data.publicUrl;
}

if (formAnimal) {
  cargarOpcionesEspecie();

  const params = new URLSearchParams(window.location.search);
  const idEditar = params.get('id');

  if (idEditar) {
    document.getElementById('titulo-form').textContent = 'Editar animal';
    precargarAnimal(idEditar);
  }

  formAnimal.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputFoto = document.getElementById('foto');
    let fotoUrl = null;

    if (inputFoto.files.length > 0) {
      fotoUrl = await subirFoto(inputFoto.files[0]);
      if (!fotoUrl) {
        document.getElementById('form-error-msg').textContent = 'Error al subir la foto.';
        return;
      }
    }

    const datosAnimal = {
      nombre: document.getElementById('nombre').value,
      especie: document.getElementById('especie').value,
      edad: document.getElementById('edad').value,
      sexo: document.getElementById('sexo').value,
      tamano: document.getElementById('tamano').value,
      descripcion: document.getElementById('descripcion').value
    };

    if (fotoUrl) {
      datosAnimal.foto_url = fotoUrl;
    }

    let error;

    if (idEditar) {
      ({ error } = await supabase
        .from('animals')
        .update(datosAnimal)
        .eq('id', idEditar));
    } else {
      ({ error } = await supabase
        .from('animals')
        .insert(datosAnimal));
    }

    if (error) {
      console.error('Error al guardar:', error);
      document.getElementById('form-error-msg').textContent = 'Error al guardar el animal.';
      return;
    }

    window.location.href = 'dashboard.html';
  });
}