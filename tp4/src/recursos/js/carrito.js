const CLAVE_CARRITO = "carrito";
export const CANTIDAD_MAXIMA = 10;

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