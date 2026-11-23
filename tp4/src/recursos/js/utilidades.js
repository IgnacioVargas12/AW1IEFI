export const formatearPrecio = (valor) => `$${valor.toLocaleString("es-AR")}`;

// Evita que texto escrito por el usuario se interprete como HTML
export const escaparHTML = (texto) => {
    const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return texto.replace(/[&<>"']/g, (caracter) => reemplazos[caracter]);
};

export const urlAbsoluta = (ruta) => new URL(ruta, window.location.href).href;

//Validaciones de datos de contacto y carrito
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REGEX_NOMBRE = /^[\p{L}' ]{2,60}$/u;
export const REGEX_TELEFONO = /^\+?[0-9 -]{8,18}$/;