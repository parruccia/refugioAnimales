// js/aplicarTema.js
import { supabase } from './supabaseClient.js';

const esAdmin = document.body.hasAttribute('data-admin');

function aplicarValores(data) {
  if (!esAdmin) {
    const root = document.documentElement;
    if (data.color_header) root.style.setProperty('--verde-pino', data.color_header);
    if (data.color_body) root.style.setProperty('--arena', data.color_body);
  }

  document.querySelectorAll('[data-nombre-refugio]').forEach(el => {
    el.textContent = data.nombre_refugio;
  });

  document.querySelectorAll('[data-logo-refugio]').forEach(el => {
    if (data.logo_url) {
      el.src = data.logo_url;
      el.style.display = 'block';
    }
  });

  const linkInstagram = document.querySelector('[data-instagram-header]');
  if (linkInstagram) {
    if (data.instagram_user) {
      linkInstagram.href = `https://instagram.com/${data.instagram_user}`;
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

  if (data.nombre_refugio) {
    document.title = `${data.nombre_refugio} - ${document.title}`;
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
    console.error('No se pudieron cargar los ajustes desde Supabase.');
    return;
  }

  aplicarValores(data);
  localStorage.setItem('temaRefugio', JSON.stringify(data));
}

aplicarTema();