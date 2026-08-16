import { supabase } from './supabaseClient.js';
import { CONFIG } from './config.js';
import { generarMensajeInstagram } from './codigo.js';

const INSTAGRAM_LEGACY = 'nachoparruccia';

const contenedor = document.getElementById('detalle');
let animalActual = null;

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
        .select('instagram_user')
        .eq('id', 1)
        .single();

    if (error || !data) {
        console.error('No se pudieron cargar los datos de contacto.');
        return { instagramUser: null };
    }

    return {
        instagramUser: data.instagram_user && data.instagram_user !== INSTAGRAM_LEGACY
            ? data.instagram_user
            : CONFIG.contacto.instagramUser,
    };
}

async function renderizarContacto() {
    const { instagramUser } = await obtenerDatosContacto();
    const contenedorContacto = document.getElementById('contacto');
    if (!contenedorContacto) return;

    contenedorContacto.innerHTML = '';

    if (!instagramUser) return;

    const mensaje = generarMensajeInstagram(animalActual);
    const linkDM = `https://ig.me/m/${instagramUser}`;

    contenedorContacto.innerHTML = `
    <div class="contacto-dm">
      <button type="button" class="btn-dm">📷 Copiar mensaje y abrir Instagram</button>
      <p class="mensaje-sugerido"></p>
      <p class="contacto-ayuda">Se abre el chat de Instagram del refugio. Tu mensaje ya quedó copiado: solo pegá y enviá.</p>
    </div>
  `;

    const btnDM = contenedorContacto.querySelector('.btn-dm');
    const parrafoMensaje = contenedorContacto.querySelector('.mensaje-sugerido');
    parrafoMensaje.textContent = mensaje;

    btnDM.addEventListener('click', () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(mensaje).catch(() => {});
        }
        btnDM.textContent = 'Mensaje copiado ✓ — pegá y enviá en Instagram';
        setTimeout(() => {
            btnDM.textContent = '📷 Copiar mensaje y abrir Instagram';
        }, 4000);
        window.open(linkDM, '_blank');
    });
}

function renderizarAnimal(animal) {
    animalActual = animal;

    contenedor.innerHTML = `
    <div class="detalle-tarjeta">
      <div class="detalle-imagen">
        <img src="${animal.foto_url || 'img/placeholder.png'}" alt="${animal.nombre}">
      </div>
      <div class="detalle-info">
        <span class="detalle-etiqueta">Disponible para adopción</span>
        <h2>${animal.nombre}</h2>
        <div class="badges">
        <span class="badge">${animal.especie}</span>
        <span class="badge">${animal.edad}</span>
        <span class="badge">${animal.sexo}</span>
        <span class="badge">${animal.tamano}</span>
        </div>
        <div class="hero-separador" aria-hidden="true"></div>
        <p class="detalle-sub">Sobre ${animal.nombre}</p>
        <p class="descripcion">${animal.descripcion || ''}</p>
        <div id="contacto"></div>
      </div>
    </div>
  `;
}

cargarAnimal();