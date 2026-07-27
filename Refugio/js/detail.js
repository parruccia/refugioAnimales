import { supabase } from './supabaseClient.js';
import { CONFIG } from './config.js';

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
}

function obtenerLinkContacto() {
    if (CONFIG.contacto.tipo === 'whatsapp') {
        return `https://wa.me/${CONFIG.contacto.whatsappNumero}`;
    }
    return `https://instagram.com/${CONFIG.contacto.instagramUser}`;
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
        <a href="${obtenerLinkContacto()}" target="_blank" class="btn-instagram">
          📷 Contactar
        </a>
      </div>
    </div>
  `;
}

cargarAnimal();