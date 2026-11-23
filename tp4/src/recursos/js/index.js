//  Importaciones
import { URL_PRODUCTOS } from './config.js';
import { obtenerDatos } from './datos.js';
import { filtrarPorCategoria, ordenarProductos, obtenerProductoPorId } from './productos.js';
import { renderizarProductos, renderizarDetalle, renderizarOfertas, renderizarError, mostrarNotificacion} from './render.js';
import { agregarAlCarrito, CANTIDAD_MAXIMA } from './carrito.js';

//  Referencias DOM de las tres vistas
const contenedorProductos = document.getElementById("contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const selectOrdenar = document.getElementById("id-ordenar");
const contenedorDetalle = document.getElementById('contenedor-detalle');
const contenedorOfertas = document.getElementById('contenedor-ofertas');

//  Carga de datos (con manejo de errores)
let productos = null;

try {
    productos = await obtenerDatos(URL_PRODUCTOS);
} catch (error) {
    console.error("No se pudieron cargar los productos:", error);

    // Mostramos el error en el contenedor de la página que estemos viendo
    [contenedorProductos, contenedorDetalle, contenedorOfertas]
        .filter(Boolean)
        .forEach(contenedor =>
            renderizarError(contenedor, "No pudimos cargar los productos. Intentá de nuevo más tarde.")
        );
}

//  Solo arrancamos las vistas si los datos se cargaron
if (productos) {

    // --- Vista de catálogo (catalogo.html) ---
    if (contenedorProductos) {
        let productosActuales = filtrarPorCategoria("Todas", productos);
        renderizarProductos(contenedorProductos, productosActuales);

        botonesCategorias.forEach(boton => {
            boton.addEventListener("click", () => {
                const categoriaElegida = boton.dataset.categoria;
                productosActuales = filtrarPorCategoria(categoriaElegida, productos);

                botonesCategorias.forEach(b => b.classList.remove("activo"));
                boton.classList.add("activo");

                renderizarProductos(contenedorProductos, productosActuales);
            });
        });

        selectOrdenar.addEventListener("change", (e) => {
            const productosOrdenados = ordenarProductos(e.target.value, productosActuales);
            renderizarProductos(contenedorProductos, productosOrdenados);
        });
    }

       // --- Vista de detalle (detalle_producto.html) ---
    if (contenedorDetalle) {
        const urlParams = new URLSearchParams(window.location.search);
        const idProducto = parseInt(urlParams.get('id'));

        const productoSeleccionado = obtenerProductoPorId(idProducto, productos);
        renderizarDetalle(contenedorDetalle, productoSeleccionado);

        const formAgregar = document.getElementById("form-agregar-carrito");

        if (formAgregar && productoSeleccionado) {
            formAgregar.addEventListener("submit", (e) => {
                e.preventDefault();

                const cantidad = parseInt(formAgregar.elements["cantidad"].value);

                if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > CANTIDAD_MAXIMA) {
                    mostrarNotificacion(`Elegí una cantidad entre 1 y ${CANTIDAD_MAXIMA}.`, "error");
                    return;
                }

                agregarAlCarrito(productoSeleccionado.id, cantidad);
                mostrarNotificacion(`Agregaste ${cantidad} × ${productoSeleccionado.nombre} al carrito.`);
            });
        }
    }   

    // --- Vista de ofertas (ofertas.html) ---
    if (contenedorOfertas) {
        renderizarOfertas(contenedorOfertas, productos);
    }
}   

