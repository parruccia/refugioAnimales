import { supabase } from './supabaseClient.js';
import { CONFIG } from './config.js';

const POR_PAGINA = 8;

const contenedor = document.getElementById('catalogo');
const filtroEspecie = document.getElementById('filtro-especie');
const filtroEdad = document.getElementById('filtro-edad');
const filtroSexo = document.getElementById('filtro-sexo');
const filtroTamano = document.getElementById('filtro-tamano');

let todosLosAnimales = [];
let animalesFiltrados = [];
let paginaCatalogo = 1;

let todosAdoptados = [];
let paginaAdoptados = 1;

function cargarOpcionesEspecie() {
    CONFIG.especies.forEach(especie => {
        const option = document.createElement('option');
        option.value = especie;
        option.textContent = especie.charAt(0).toUpperCase() + especie.slice(1);
        filtroEspecie.appendChild(option);
    });
}

function mostrarSkeleton() {
    contenedor.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const skel = document.createElement('div');
        skel.className = 'skeleton-tarjeta';
        skel.setAttribute('aria-hidden', 'true');
        skel.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-info">
        <div class="skeleton-linea skeleton-linea-titulo"></div>
        <div class="skeleton-linea skeleton-linea-badges"></div>
        <div class="skeleton-linea skeleton-linea-badge"></div>
      </div>
    `;
        contenedor.appendChild(skel);
    }
}

async function cargarAnimales() {
    mostrarSkeleton();

    const [disponibles, adoptados] = await Promise.all([
        supabase.from('animals').select('*').eq('estado', 'disponible').order('fecha_ingreso', { ascending: false }),
        supabase.from('animals').select('*').eq('estado', 'adoptado').order('fecha_ingreso', { ascending: false })
    ]);

    if (disponibles.error) {
        console.error('Error al cargar animales:', disponibles.error);
        contenedor.innerHTML = '<p class="sin-resultados">Hubo un error al cargar los animales.</p>';
        return;
    }

    todosLosAnimales = disponibles.data || [];
    animalesFiltrados = todosLosAnimales;
    paginaCatalogo = 1;
    renderizarCatalogo();

    todosAdoptados = adoptados.data || [];
    paginaAdoptados = 1;
    if (todosAdoptados.length > 0) {
        renderizarAdoptados();
    }
}

function crearTarjetaAnimal(animal) {
    const tarjeta = document.createElement('a');
    tarjeta.href = `animal.html?id=${animal.id}`;
    tarjeta.className = 'tarjeta';

    tarjeta.innerHTML = `
      <img loading="lazy" src="${animal.foto_url || 'img/placeholder.png'}" alt="${animal.nombre}">
      <div class="tarjeta-info">
        <h3>${animal.nombre}</h3>
        <div class="badges">
        <span class="badge">${animal.especie}</span>
        <span class="badge">${animal.edad}</span>
        <span class="badge">${animal.sexo}</span>
        <span class="badge">${animal.tamano}</span>
    </div>
      </div>
    `;
    return tarjeta;
}

function renderizarCatalogo() {
    contenedor.innerHTML = '';

    if (animalesFiltrados.length === 0) {
        contenedor.innerHTML = '<p class="sin-resultados">No hay animales que coincidan con la búsqueda.</p>';
        removerBoton('btn-ver-mas-catalogo');
        return;
    }

    const hasta = paginaCatalogo * POR_PAGINA;
    const visibles = animalesFiltrados.slice(0, hasta);

    visibles.forEach(animal => {
        contenedor.appendChild(crearTarjetaAnimal(animal));
    });

    gestionarBoton('btn-ver-mas-catalogo', hasta < animalesFiltrados.length, contenedor, () => {
        paginaCatalogo++;
        renderizarCatalogo();
    });
}

function renderizarAdoptados() {
    let seccion = document.getElementById('adoptados-seccion');
    if (!seccion) {
        seccion = document.createElement('section');
        seccion.id = 'adoptados-seccion';
        seccion.className = 'adoptados-seccion';
        seccion.innerHTML = `
      <div class="adoptados-header">
        <h2 class="adoptados-titulo">Ya encontraron hogar</h2>
        <p class="adoptados-sub">Estas mascotas ya fueron adoptadas gracias a personas como vos</p>
      </div>
      <div class="adoptados-grid" id="adoptados-grid"></div>
    `;
        contenedor.parentNode.insertBefore(seccion, contenedor.nextSibling);
    }

    const grid = document.getElementById('adoptados-grid');
    grid.innerHTML = '';

    const hasta = paginaAdoptados * POR_PAGINA;
    const visibles = todosAdoptados.slice(0, hasta);

    visibles.forEach(animal => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta tarjeta-adoptada';
        tarjeta.innerHTML = `
      <div class="adoptada-img-wrap">
        <img loading="lazy" src="${animal.foto_url || 'img/placeholder.png'}" alt="${animal.nombre}">
        <span class="adoptada-badge">Encontró hogar 🏠</span>
      </div>
      <div class="tarjeta-info">
        <h3>${animal.nombre}</h3>
        <div class="badges">
        <span class="badge badge-adoptado">${animal.especie}</span>
        <span class="badge badge-adoptado">${animal.sexo}</span>
        </div>
      </div>
    `;
        grid.appendChild(tarjeta);
    });

    gestionarBoton('btn-ver-mas-adoptados', hasta < todosAdoptados.length, grid, () => {
        paginaAdoptados++;
        renderizarAdoptados();
    });
}

function gestionarBoton(id, mostrar, contenedorBoton, onClick) {
    let btn = document.getElementById(id);
    if (mostrar) {
        if (!btn) {
            btn = document.createElement('button');
            btn.id = id;
            btn.type = 'button';
            btn.className = 'btn-ver-mas';
            btn.textContent = 'Ver más';
            btn.addEventListener('click', onClick);
            contenedorBoton.appendChild(btn);
        }
    } else if (btn) {
        btn.remove();
    }
}

function removerBoton(id) {
    const btn = document.getElementById(id);
    if (btn) btn.remove();
}

function aplicarFiltros() {
    const especie = filtroEspecie.value;
    const edad = filtroEdad.value;
    const sexo = filtroSexo.value;
    const tamano = filtroTamano.value;

    animalesFiltrados = todosLosAnimales.filter(animal => {
        return (!especie || animal.especie === especie) &&
            (!edad || animal.edad === edad) &&
            (!sexo || animal.sexo === sexo) &&
            (!tamano || animal.tamano === tamano);
    });

    paginaCatalogo = 1;
    renderizarCatalogo();
}

filtroEspecie.addEventListener('change', aplicarFiltros);
filtroEdad.addEventListener('change', aplicarFiltros);
filtroSexo.addEventListener('change', aplicarFiltros);
filtroTamano.addEventListener('change', aplicarFiltros);

cargarOpcionesEspecie();
cargarAnimales();
