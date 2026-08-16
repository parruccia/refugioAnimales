// js/aplicarTema.js
import { supabase } from './supabaseClient.js';
import { CONFIG } from './config.js';

const esAdmin = document.body.hasAttribute('data-admin');

const NOMBRE_DEFAULT_DB = 'Mi Refugio';
const INSTAGRAM_LEGACY = 'nachoparruccia';

function nombreRefugioValido(nombre) {
  return Boolean(nombre) && nombre !== NOMBRE_DEFAULT_DB;
}

function instagramValido(usuario) {
  return Boolean(usuario) && usuario !== INSTAGRAM_LEGACY;
}

function aplicarValores(data) {
  if (!esAdmin) {
    const root = document.documentElement;
    if (data.color_header) root.style.setProperty('--verde-pino', data.color_header);
    if (data.color_body) root.style.setProperty('--arena', data.color_body);
  }

  document.querySelectorAll('[data-nombre-refugio]').forEach(el => {
    el.textContent = nombreRefugioValido(data.nombre_refugio) ? data.nombre_refugio : CONFIG.nombreRefugio;
  });

  document.querySelectorAll('[data-logo-refugio]').forEach(el => {
    if (data.logo_url) {
      el.src = data.logo_url;
      el.style.display = 'block';
    }
  });

  const linkInstagram = document.querySelector('[data-instagram-header]');
  if (linkInstagram) {
    const usuario = instagramValido(data.instagram_user) ? data.instagram_user : CONFIG.contacto.instagramUser;
    if (usuario) {
      linkInstagram.href = `https://www.instagram.com/${usuario}/`;
      linkInstagram.style.display = 'inline-block';
    } else {
      linkInstagram.style.display = 'none';
    }
  }

  const linkWhatsapp = document.querySelector('[data-whatsapp-header]');
  if (linkWhatsapp) {
    if (data.whatsapp_numero) {
      linkWhatsapp.href = `https://wa.me/${data.whatsapp_numero}`;
      linkWhatsapp.style.display = 'inline-block';
    } else {
      linkWhatsapp.style.display = 'none';
    }
  }

  const nombre = nombreRefugioValido(data.nombre_refugio) ? data.nombre_refugio : CONFIG.nombreRefugio;
  if (nombre) {
    document.title = `${nombre} - ${document.title}`;
  }
}

async function aplicarTema() {
  const cacheado = localStorage.getItem('temaRefugio');
  if (cacheado) {
    aplicarValores(JSON.parse(cacheado));
  }

  const { data, error } = await supabase
    .from('configuracion')
    .select('color_header, color_body, nombre_refugio, logo_url, instagram_user, whatsapp_numero')
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.error('No se pudieron cargar los datos del refugio desde Supabase.');
    return;
  }

  aplicarValores(data);
  localStorage.setItem('temaRefugio', JSON.stringify(data));
}

aplicarTema();