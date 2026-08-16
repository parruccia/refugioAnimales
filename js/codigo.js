// js/codigo.js
// Código legible autogenerado a partir del id (UUID) del animal.

const PREFIJO = 'CC';

export function generarCodigo(animal) {
    const id = String(animal?.id || '');
    const corto = id.replace(/-/g, '').slice(-5).toUpperCase() || '00000';
    return `${PREFIJO}-${corto}`;
}

export function generarMensajeInstagram(animal) {
    const codigo = generarCodigo(animal);
    return `Hola! Me interesa adoptar a ${animal.nombre} (código ${codigo}) que vi en su página. ¿Sigue disponible? Muchas gracias.`;
}
