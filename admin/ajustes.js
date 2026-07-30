// admin/ajustes.js
import { supabase } from '../js/supabaseClient.js';

const inputHeader = document.getElementById('colorHeader');
const inputBody = document.getElementById('colorBody');
const form = document.getElementById('formAjustes');
const mensaje = document.getElementById('mensajeEstado');

async function cargarValoresActuales() {
  const { data, error } = await supabase
    .from('configuracion')
    .select('color_header, color_body')
    .eq('id', 1)
    .single();

  if (error) {
    mensaje.textContent = 'Error al cargar los colores actuales.';
    return;
  }

  inputHeader.value = data.color_header;
  inputBody.value = data.color_body;
}

async function guardarCambios(evento) {
  evento.preventDefault();

  const { error } = await supabase
    .from('configuracion')
    .update({
      color_header: inputHeader.value,
      color_body: inputBody.value,
    })
    .eq('id', 1);

  mensaje.textContent = error
    ? 'Error al guardar los cambios.'
    : 'Colores guardados correctamente.';
}

form.addEventListener('submit', guardarCambios);
cargarValoresActuales();