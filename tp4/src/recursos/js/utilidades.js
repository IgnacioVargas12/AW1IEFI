export const formatearPrecio = (valor) => `$${valor.toLocaleString("es-AR")}`;

// Evita que texto escrito por el usuario se interprete como HTML
export const escaparHTML = (texto) => {
    const reemplazos = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return texto.replace(/[&<>"']/g, (caracter) => reemplazos[caracter]);
};

export const urlAbsoluta = (ruta) => new URL(ruta, window.location.href).href;