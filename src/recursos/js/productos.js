export const calcularPrecioFinal = (producto) => {
    return Math.round(producto.precio * (1 - producto.descuento));
};

// Catálogo = productos que NO están en oferta
export const filtrarPorCategoria = (categoriaSeleccionada, productos) => {
    const catalogo = productos.filter(prod => prod.enOferta === false);

    if (categoriaSeleccionada === "Todas") {
        return catalogo;
    }
    return catalogo.filter(prod => prod.categoria === categoriaSeleccionada);
};

export const ordenarProductos = (criterio, arregloAOrdenar) => {
    const arregloCopia = [...arregloAOrdenar];

    if (criterio === "precio-bajo") {
        return arregloCopia.sort((a, b) => a.precio - b.precio);
    } else if (criterio === "precio-alto") {
        return arregloCopia.sort((a, b) => b.precio - a.precio);
    } else if (criterio === "nombre") {
        return arregloCopia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    return arregloCopia;
};

export const obtenerProductoPorId = (id, productos) => {
    return productos.find(producto => producto.id === id);
};