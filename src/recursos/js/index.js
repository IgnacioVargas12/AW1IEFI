//  Importaciones
import { URL_PRODUCTOS, EMAILJS_TEMPLATE_CONTACTO_ID } from './config.js';
import { obtenerDatos } from './datos.js';
import { filtrarPorCategoria, ordenarProductos, obtenerProductoPorId } from './productos.js';
import { renderizarProductos, renderizarDetalle, renderizarOfertas, renderizarError,
     mostrarNotificacion, renderizarCarrito, renderizarResumen, renderizarConfirmacion} from './render.js';
import { agregarAlCarrito, CANTIDAD_MAXIMA,  actualizarCantidad, quitarDelCarrito, obtenerCarrito, detallarCarrito,
         calcularSubtotal, obtenerEnvio, guardarEnvio, vaciarCarrito } from './carrito.js';
import { calcularEnvio } from './envio.js';
import { construirPedido, validarCliente } from './pedido.js';
import { enviarEmail } from './email.js';
import { validarConsulta, construirParametrosConsulta } from './contacto.js';
import { REGEX_EMAIL } from './utilidades.js';

//  Referencias DOM de las vistas
const contenedorProductos = document.getElementById("contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const selectOrdenar = document.getElementById("id-ordenar");
const contenedorDetalle = document.getElementById('contenedor-detalle');
const contenedorOfertas = document.getElementById('contenedor-ofertas');
const contenedorCarrito = document.getElementById('lista-carrito');
const formContacto = document.getElementById('form-contacto');
const formLogin = document.getElementById('form-login');

//  Carga de datos (con manejo de errores)
let productos = null;

try {
    productos = await obtenerDatos(URL_PRODUCTOS);
} catch (error) {
    console.error("No se pudieron cargar los productos:", error);

    // Mostramos el error en el contenedor de la página que estemos viendo
    [contenedorProductos, contenedorDetalle, contenedorOfertas, contenedorCarrito]
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

    // --- Vista de carrito (carrito.html) ---
    if (contenedorCarrito) {
        const formEnvio = document.getElementById("form-envio");

        // Redibuja lista y resumen desde localStorage
        const refrescarCarrito = () => {
            const items = detallarCarrito(obtenerCarrito(), productos);
            const envio = obtenerEnvio();

            renderizarCarrito(contenedorCarrito, items);
            renderizarResumen(calcularSubtotal(items), envio ? envio.costo : null);
        };

        // Restauramos la provincia elegida antes (si hay)
        const envioGuardado = obtenerEnvio();
        if (envioGuardado) {
            formEnvio.elements["provincia"].value = envioGuardado.provincia;
        }

        refrescarCarrito();

        // Delegación de eventos: un solo listener sobre el contenedor,
        // porque los botones se vuelven a crear en cada render
        contenedorCarrito.addEventListener("click", (e) => {
            const boton = e.target.closest("[data-accion='quitar']");
            if (!boton) return;

            quitarDelCarrito(parseInt(boton.dataset.id));
            mostrarNotificacion("Producto quitado del carrito.");
            refrescarCarrito();
        });

        contenedorCarrito.addEventListener("change", (e) => {
            const input = e.target.closest("[data-accion='cantidad']");
            if (!input) return;

            const cantidad = parseInt(input.value);

            if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > CANTIDAD_MAXIMA) {
                mostrarNotificacion(`La cantidad debe estar entre 1 y ${CANTIDAD_MAXIMA}.`, "error");
                refrescarCarrito(); // vuelve al valor guardado
                return;
            }

            actualizarCantidad(parseInt(input.dataset.id), cantidad);
            refrescarCarrito();
        });

        // Cálculo de envío
        formEnvio.addEventListener("submit", (e) => {
            e.preventDefault();

            const provincia = formEnvio.elements["provincia"].value;
            const codigoPostal = formEnvio.elements["codigo-postal"].value.trim();

            // Validación con JS (además del required y el pattern del HTML)
            if (codigoPostal !== "" && !/^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/.test(codigoPostal)) {
                mostrarNotificacion("El código postal no es válido.", "error");
                return;
            }

            const costo = calcularEnvio(provincia);

            if (costo === null) {
                mostrarNotificacion("Elegí una provincia válida.", "error");
                return;
            }

            guardarEnvio({ provincia, costo });
            refrescarCarrito();
            mostrarNotificacion(costo === 0 ? "¡Envío gratis a Córdoba!" : "Envío calculado.");
        });

        // Finalizar compra
        const formPedido = document.getElementById("form-pedido");
        const botonFinalizar = document.getElementById("boton-finalizar");
        const seccionCarrito = document.querySelector(".seccion-carrito");

        formPedido.addEventListener("submit", async (e) => {
            e.preventDefault();

            const items = detallarCarrito(obtenerCarrito(), productos);
            const envio = obtenerEnvio();

            if (items.length === 0) {
                mostrarNotificacion("Tu carrito está vacío.", "error");
                return;
            }
            if (!envio) {
                mostrarNotificacion("Calculá el envío antes de finalizar la compra.", "error");
                return;
            }

            const cliente = {
                nombre: formPedido.elements["nombre"].value.trim(),
                email: formPedido.elements["email"].value.trim(),
                nota: formPedido.elements["nota"].value.trim()
            };

            const errores = validarCliente(cliente);
            if (errores.length > 0) {
                mostrarNotificacion(errores[0], "error");
                return;
            }

            // Nombre legible de la provincia (en el storage solo guardamos el valor, ej: "cordoba")
            const opcion = formEnvio.querySelector(`option[value="${envio.provincia}"]`);
            const nombreProvincia = opcion ? opcion.textContent : envio.provincia;

            const pedido = construirPedido(items, envio.costo, nombreProvincia, cliente);

            // Evitamos envíos dobles mientras se espera la respuesta
            botonFinalizar.disabled = true;
            botonFinalizar.textContent = "Enviando pedido...";

            try {
                await enviarEmail(pedido.parametrosEmail);
                vaciarCarrito();
                renderizarConfirmacion(seccionCarrito, pedido);
                mostrarNotificacion("¡Pedido enviado con éxito!");
            } catch (error) {
                console.error("No se pudo enviar el pedido:", error);
                mostrarNotificacion("No pudimos enviar el pedido. Intentá de nuevo en unos minutos.", "error");
                botonFinalizar.disabled = false;
                botonFinalizar.textContent = "Finalizar compra";
            }
        });

    }
}   


// --- Vista de contacto (contacto.html) ---
// Va fuera de if (productos): el formulario no depende del catálogo,
// así que tiene que funcionar aunque falle la carga del JSON
if (formContacto) {
    const botonEnviarConsulta = document.getElementById("boton-enviar-consulta");

    formContacto.addEventListener("submit", async (e) => {
        e.preventDefault();

        const consulta = {
            nombre: formContacto.elements["nombre"].value.trim(),
            apellido: formContacto.elements["apellido"].value.trim(),
            correo: formContacto.elements["correo"].value.trim(),
            telefono: formContacto.elements["telefono"].value.trim(),
            comentario: formContacto.elements["comentario"].value.trim()
        };

        const errores = validarConsulta(consulta);
        if (errores.length > 0) {
            mostrarNotificacion(errores[0], "error");
            return;
        }

        botonEnviarConsulta.disabled = true;
        botonEnviarConsulta.textContent = "Enviando...";

        try {
            await enviarEmail(construirParametrosConsulta(consulta), EMAILJS_TEMPLATE_CONTACTO_ID);
            formContacto.reset();
            mostrarNotificacion("¡Consulta enviada! Te responderemos a la brevedad.");
        } catch (error) {
            console.error("No se pudo enviar la consulta:", error);
            mostrarNotificacion("No pudimos enviar tu consulta. Intentá de nuevo en unos minutos.", "error");
        } finally {
            // Se ejecuta siempre, haya salido bien o mal
            botonEnviarConsulta.disabled = false;
            botonEnviarConsulta.textContent = "Enviar";
        }
    });
}


// --- Vista de login (login.html) ---
// Simulado: no hay backend, así que solo validamos y mostramos el mensaje de éxito
if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = formLogin.elements["email_usuario"].value.trim();
        const contrasenia = formLogin.elements["contraseña_usuario"].value;

        // Validación con JS (además del required, type="email" y minlength del HTML)
        if (!REGEX_EMAIL.test(email)) {
            mostrarNotificacion("Ingresá un email válido.", "error");
            return;
        }
        if (contrasenia.length < 6) {
            mostrarNotificacion("La contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }

        mostrarNotificacion("¡Inicio de sesión exitoso! Bienvenido a Apex Fit.");
        formLogin.reset();
    });
}