//  Importaciones
import {productos} from './productos.js'
import {renderizarProductos, filtrarPorCategoria, ordenarProductos, obtenerProductoPorId, renderizarDetalle, renderizarOfertas} from './funciones.js'

// ---Vista de catálogo (catalogo.html) ---
//  Referencias DOM
const contenedorProductos = document.getElementById("contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const selectOrdenar = document.getElementById("id-ordenar");

//  Funciones
//Estado actual (para mantener el filtro activo si luego ordenamos, o viceversa)
let productosActuales = productos.filter(producto => producto.enOferta === false);
if (contenedorProductos) {
    //Función que carga todos los productos
    renderizarProductos(contenedorProductos, productosActuales);

    //  Eventos
    //  Evento para el filtrado de categorías (Usando 'click' y un bucle para cada <a>)
    botonesCategorias.forEach(boton => {
    boton.addEventListener("click", () => {
        // Usamos el data-categoria en vez del texto visible
        const categoriaElegida = boton.dataset.categoria;

        // Misma función genérica que ya tenías
        productosActuales = filtrarPorCategoria(categoriaElegida);

        // Marcamos visualmente el botón activo
        botonesCategorias.forEach(b => b.classList.remove("activo"));
        boton.classList.add("activo");

        // Volvemos a renderizar con el resultado filtrado
        renderizarProductos(contenedorProductos, productosActuales);
    });
});

    //Evento para el filtrado según un orden(Usando 'change')
    selectOrdenar.addEventListener("change", (e) => {
        const criterioElegido = e.target.value; // Captura el value ('precio-bajo', 'nombre', etc.)
        
        // Ordenamos sobre los productos que ya están filtrados actualmente
        const productosOrdenados = ordenarProductos(criterioElegido, productosActuales);
        
        renderizarProductos(contenedorProductos, productosOrdenados);
    });
}



// ---Vista de detalle (detalle_producto.html) ---
// Referencias DOM
const contenedorDetalle = document.getElementById('contenedor-detalle');

//  Funciones
if (contenedorDetalle) {
    // Si estamos en la página de detalle, leemos la URL y renderizamos
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = parseInt(urlParams.get('id'));
    
    const productoSeleccionado = obtenerProductoPorId(idProducto, productos);
    renderizarDetalle(contenedorDetalle, productoSeleccionado);
}



// ---Vista de ofertas (ofertas.html) ---
//  Referencias DOM
const contenedorOfertas = document.getElementById('contenedor-ofertas');

//  Funciones
if (contenedorOfertas) {
    // Ejecutamos la función de renderizado de ofertas pasándole los datos
    renderizarOfertas(contenedorOfertas, productos);
}