import { calcularPrecioFinal, obtenerProductoPorId } from './productos.js';

const CLAVE_CARRITO = "carrito";
export const CANTIDAD_MAXIMA = 10;

//Persistencia del carrito con Local Storage
// Lee el carrito guardado. Si no hay nada, o el JSON está dañado, devuelve []
export const obtenerCarrito = () => {
    try {
        const guardado = localStorage.getItem(CLAVE_CARRITO);
        return guardado ? JSON.parse(guardado) : [];
    } catch (error) {
        console.error("No se pudo leer el carrito:", error);
        return [];
    }
};

const guardarCarrito = (carrito) => {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
    }
};

// Si el producto ya está, suma la cantidad (sin pasar del máximo). Si no, lo agrega.
export const agregarAlCarrito = (idProducto, cantidad) => {
    const carrito = obtenerCarrito();
    const itemExistente = carrito.find(item => item.id === idProducto);

    if (itemExistente) {
        itemExistente.cantidad = Math.min(itemExistente.cantidad + cantidad, CANTIDAD_MAXIMA);
    } else {
        carrito.push({ id: idProducto, cantidad });
    }

    guardarCarrito(carrito);
    return carrito;
};

// Total de unidades (sirve para un contador en el encabezado)
export const contarItems = () => {
    return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
};


//-----------------------------------------------------------------------------------------------//
//Carga de datos del carrito
export const actualizarCantidad = (idProducto, cantidad) => {
    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.id === idProducto);

    if (item) {
        item.cantidad = cantidad;
        guardarCarrito(carrito);
    }
};

export const quitarDelCarrito = (idProducto) => {
    guardarCarrito(obtenerCarrito().filter(item => item.id !== idProducto));
};

// Cruza el carrito (id + cantidad) con los datos del JSON.
// Si un producto ya no existe en el JSON, se descarta.
export const detallarCarrito = (carrito, productos) => {
    return carrito
        .map(item => {
            const producto = obtenerProductoPorId(item.id, productos);
            return producto ? { producto, cantidad: item.cantidad } : null;
        })
        .filter(Boolean);
};

export const calcularSubtotal = (items) => {
    return items.reduce(
        (total, { producto, cantidad }) => total + calcularPrecioFinal(producto) * cantidad,
        0
    );
};

// Envío elegido (se guarda para recordarlo al recargar y usarlo en el pedido)
const CLAVE_ENVIO = "envio";

export const guardarEnvio = (envio) => {
    try {
        localStorage.setItem(CLAVE_ENVIO, JSON.stringify(envio));
    } catch (error) {
        console.error("No se pudo guardar el envío:", error);
    }
};

export const obtenerEnvio = () => {
    try {
        const guardado = localStorage.getItem(CLAVE_ENVIO);
        return guardado ? JSON.parse(guardado) : null;
    } catch (error) {
        console.error("No se pudo leer el envío:", error);
        return null;
    }
};

// Se usa después de una compra exitosa
export const vaciarCarrito = () => {
    guardarCarrito([]);
    try {
        localStorage.removeItem(CLAVE_ENVIO);
    } catch (error) {
        console.error("No se pudo borrar el envío:", error);
    }
};