import { calcularPrecioFinal } from './productos.js';
import { calcularSubtotal } from './carrito.js';
import { formatearPrecio, urlAbsoluta, REGEX_EMAIL, REGEX_NOMBRE } from './utilidades.js';


// Validación con JS (además de required, type="email" y minlength del HTML)
export const validarCliente = ({ nombre, email, nota }) => {
    const errores = [];

    if (!REGEX_NOMBRE.test(nombre)) {
        errores.push("Ingresá un nombre válido (solo letras, entre 3 y 60 caracteres).");
    }
    if (!REGEX_EMAIL.test(email)) {
        errores.push("Ingresá un email válido.");
    }
    if (nota.length > 300) {
        errores.push("La nota no puede superar los 300 caracteres.");
    }
    return errores;
};

const generarNumeroPedido = () => `PED-${Date.now().toString(36).toUpperCase()}`;

// Arma el pedido y los parámetros que usa la plantilla de EmailJS
export const construirPedido = (items, costoEnvio, provincia, cliente) => {
    const subtotal = calcularSubtotal(items);
    const total = subtotal + costoEnvio;
    const numero = generarNumeroPedido();

    const orders = items.map(({ producto, cantidad }) => ({
    name: producto.nombre,
    units: cantidad,
    price: formatearPrecio(calcularPrecioFinal(producto) * cantidad),
    image_url: urlAbsoluta(producto.imagen)
    }));

    return {
        numero,
        nombre: cliente.nombre,
        email: cliente.email,
        total,
        parametrosEmail: {
            numero_pedido: numero,
            nombre: cliente.nombre,
            to_email: cliente.email,
            orders,
            subtotal: formatearPrecio(subtotal),
            provincia,
            envio: costoEnvio === 0 ? "Gratis" : formatearPrecio(costoEnvio),
            total: formatearPrecio(total),
            nota: cliente.nota || "Sin nota"
        }
    };
};