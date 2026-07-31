import { supabase } from './supabaseClient.js';

const contenedor = document.getElementById('detalle');

async function cargarAnimal() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        contenedor.innerHTML = '<p class="sin-resultados">No se especificó ningún animal.</p>';
        return;
    }

    const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error al cargar animal:', error);
        contenedor.innerHTML = '<p class="sin-resultados">No se encontró este animal.</p>';
        return;
    }

    renderizarAnimal(data);
    renderizarContacto();
}

async function obtenerDatosContacto() {
    const { data, error } = await supabase
        .from('configuracion')
        .select('instagram_user, whatsapp_numero')
        .eq('id', 1)
        .single();

    if (error || !data) {
        console.error('No se pudieron cargar los datos de contacto.');
        return { instagram: null, whatsapp: null };
    }

    return {
        instagram: data.instagram_user ? `https://instagram.com/${data.instagram_user}` : null,
        whatsapp: data.whatsapp_numero ? `https://wa.me/${data.whatsapp_numero}` : null,
    };
}

async function renderizarContacto() {
    const { instagram, whatsapp } = await obtenerDatosContacto();
    const contenedorContacto = document.getElementById('contacto');
    if (!contenedorContacto) return;

    contenedorContacto.innerHTML = '';

    if (instagram) {
        contenedorContacto.innerHTML += `<a href="${instagram}" target="_blank" class="btn-instagram">📷 Instagram</a>`;
    }
    if (whatsapp) {
        contenedorContacto.innerHTML += `<a href="${whatsapp}" target="_blank" class="btn-whatsapp">💬 WhatsApp</a>`;
    }
}

function renderizarAnimal(animal) {
    contenedor.innerHTML = `
    <div class="detalle-tarjeta">
      <img src="${animal.foto_url || 'img/placeholder.png'}" alt="${animal.nombre}">
      <div class="detalle-info">
        <h2>${animal.nombre}</h2>
        <div class="badges">
        <span class="badge">${animal.especie}</span>
        <span class="badge">${animal.edad}</span>
        <span class="badge">${animal.sexo}</span>
        <span class="badge">${animal.tamano}</span>
        </div>
        <p class="descripcion">${animal.descripcion || ''}</p>
        <div id="contacto"></div>
      </div>
    </div>
  `;
}

cargarAnimal();