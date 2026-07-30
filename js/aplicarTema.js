// js/aplicarTema.js
import { supabase } from './supabaseClient.js';

async function aplicarTema() {
  const { data, error } = await supabase
    .from('configuracion')
    .select('color_header, color_body')
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.error('No se pudieron cargar los colores desde Supabase.');
    return;
  }

  const root = document.documentElement;
  if (data.color_header) root.style.setProperty('--verde-pino', data.color_header);
  if (data.color_body) root.style.setProperty('--arena', data.color_body);
}

aplicarTema();