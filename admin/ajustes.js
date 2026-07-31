// admin/ajustes.js
import { supabase } from '../js/supabaseClient.js';

const form = document.getElementById('form-ajustes');
const mensaje = document.getElementById('mensaje-estado');
const inputNombre = document.getElementById('nombreRefugio');
const inputLogoArchivo = document.getElementById('logoArchivo');
const imgLogoActual = document.getElementById('logo-actual');
const inputHeader = document.getElementById('colorHeader');
const inputBody = document.getElementById('colorBody');
const inputInstagram = document.getElementById('instagramUser');
const inputWhatsapp = document.getElementById('whatsappNumero');

async function cargarValoresActuales() {
  const { data, error } = await supabase
    .from('configuracion')
    .select('nombre_refugio, logo_url, color_header, color_body, instagram_user, whatsapp_numero')
    .eq('id', 1)
    .single();

  if (error) {
    mensaje.textContent = 'Error al cargar los ajustes actuales.';
    return;
  }

  inputNombre.value = data.nombre_refugio || '';
  inputHeader.value = data.color_header || '#2C4A3E';
  inputBody.value = data.color_body || '#F5EFE6';
  inputInstagram.value = data.instagram_user || '';
  inputWhatsapp.value = data.whatsapp_numero || '';

  if (data.logo_url) {
    imgLogoActual.src = data.logo_url;
    imgLogoActual.style.display = 'block';
  }
}

async function subirLogo(archivo) {
  const nombreArchivo = `logo-${Date.now()}-${archivo.name}`;

  const { error: errorSubida } = await supabase.storage
    .from('fotos-animales')
    .upload(nombreArchivo, archivo);

  if (errorSubida) {
    throw new Error('Error al subir el logo.');
  }

  const { data } = supabase.storage
    .from('fotos-animales')
    .getPublicUrl(nombreArchivo);

  return data.publicUrl;
}

async function guardarCambios(evento) {
  evento.preventDefault();
  mensaje.textContent = 'Guardando...';

  try {
    const cambios = {
      nombre_refugio: inputNombre.value,
      color_header: inputHeader.value,
      color_body: inputBody.value,
      instagram_user: inputInstagram.value,
      whatsapp_numero: inputWhatsapp.value,
    };

    const archivo = inputLogoArchivo.files[0];
    if (archivo) {
      cambios.logo_url = await subirLogo(archivo);
    }

    const { error } = await supabase
      .from('configuracion')
      .update(cambios)
      .eq('id', 1);

    if (error) throw error;

    mensaje.textContent = 'Ajustes guardados correctamente.';
  } catch (err) {
    mensaje.textContent = 'Error al guardar los cambios.';
  }
}

form.addEventListener('submit', guardarCambios);
cargarValoresActuales();