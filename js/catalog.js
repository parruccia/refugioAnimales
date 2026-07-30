import { supabase } from './supabaseClient.js';
import { CONFIG } from './config.js';

const contenedor = document.getElementById('catalogo');
const filtroEspecie = document.getElementById('filtro-especie');
const filtroEdad = document.getElementById('filtro-edad');
const filtroSexo = document.getElementById('filtro-sexo');
const filtroTamano = document.getElementById('filtro-tamano');

let todosLosAnimales = [];

function cargarOpcionesEspecie() {
    CONFIG.especies.forEach(especie => {
        const option = document.createElement('option');
        option.value = especie;
        option.textContent = especie.charAt(0).toUpperCase() + especie.slice(1);
        filtroEspecie.appendChild(option);
    });
}

async function cargarAnimales() {
    const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('estado', 'disponible')
        .order('fecha_ingreso', { ascending: false });

    if (error) {
        console.error('Error al cargar animales:', error);
        contenedor.innerHTML = '<p class="sin-resultados">Hubo un error al cargar los animales.</p>';
        return;
    }

    todosLosAnimales = data;
    renderizarAnimales(todosLosAnimales);
}

function renderizarAnimales(animales) {
    contenedor.innerHTML = '';

    if (animales.length === 0) {
        contenedor.innerHTML = '<p class="sin-resultados">No hay animales que coincidan con la búsqueda.</p>';
        return;
    }

    animales.forEach(animal => {
        const tarjeta = document.createElement('a');
        tarjeta.href = `animal.html?id=${animal.id}`;
        tarjeta.className = 'tarjeta';

        tarjeta.innerHTML = `
      <img src="${animal.foto_url || 'img/placeholder.png'}" alt="${animal.nombre}">
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

        contenedor.appendChild(tarjeta);
    });
}

function aplicarFiltros() {
    const especie = filtroEspecie.value;
    const edad = filtroEdad.value;
    const sexo = filtroSexo.value;
    const tamano = filtroTamano.value;

    const filtrados = todosLosAnimales.filter(animal => {
        return (!especie || animal.especie === especie) &&
            (!edad || animal.edad === edad) &&
            (!sexo || animal.sexo === sexo) &&
            (!tamano || animal.tamano === tamano);
    });

    renderizarAnimales(filtrados);
}

filtroEspecie.addEventListener('change', aplicarFiltros);
filtroEdad.addEventListener('change', aplicarFiltros);
filtroSexo.addEventListener('change', aplicarFiltros);
filtroTamano.addEventListener('change', aplicarFiltros);

cargarOpcionesEspecie();
cargarAnimales();