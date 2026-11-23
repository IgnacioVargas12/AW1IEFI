import { calcularPrecioFinal } from './productos.js';
import { CANTIDAD_MAXIMA } from './carrito.js';
import { formatearPrecio, escaparHTML } from './utilidades.js';

//Función que renderiza todos los productos (catalogo.html)
const renderizarProductos = (contenedor, arregloProductos) => {
    let productosHTML = '';

    arregloProductos.forEach(producto => {
        productosHTML += `
            <article class="tarjeta-producto">
                    <figure>
                        <a href="./detalle_producto.html?id=${producto.id}">
                            <img src= "${producto.imagen}" alt="${producto.nombre}">
                        </a>
                    </figure>
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p><strong>$${calcularPrecioFinal(producto).toLocaleString("es-AR")}</strong></p>
                    <a href="./detalle_producto.html?id=${producto.id}" class="boton-principal">Ver producto</a>
                </article>
        `;
    });

    contenedor.innerHTML = productosHTML;
    return productosHTML;
};


// Función para renderizar todo el detalle usando template literals
const renderizarDetalle = (contenedor, producto) => {
    if (!producto) {
        contenedor.innerHTML = "<h2>Producto no encontrado</h2>";
        return;
    }

    // Recorremos el array de nutrición para armar las filas <tr> de la tabla dinámicamente
    let filasNutricionHTML = "";
    producto.nutricion.forEach(item => {
        filasNutricionHTML += `
            <tr>
                <td><strong>${item.nutriente}</strong></td>
                <td>${item.cantidad}</td>
            </tr>
        `;
    });

    // Cargamos todo el bloque HTML en el contenedor principal
    contenedor.innerHTML = `
        <h1>Detalle del Producto</h1>
        <section class="tarjeta-oferta">
            <figure>
                <img src="${producto.imagen}" alt="${producto.nombre}" height="400">
            </figure>
            <div>
                <h2>${producto.nombre}</h2>
                <p><strong>Marca:</strong> ${producto.marca}</p>
                <p><strong>$${calcularPrecioFinal(producto).toLocaleString("es-AR")}</strong> ${producto.cuotas}</p>
                <p>${producto.descripcion}</p>
                <p><strong>Sabor:</strong> ${producto.sabor}</p>
                <form id="form-agregar-carrito">
                    <div>
                        <label for="id-cantidad"><strong>Cantidad:</strong></label>
                        <input type="number" id="id-cantidad" name="cantidad" min="1" value="1" max="10" required>
                        <button type="submit" class="boton-principal">Agregar al carrito</button>
                    </div>
                </form>
            </div>
        </section>
        
        <section>
            <h3>Información Nutricional</h3>
            <table>
                <caption>Valores nutricionales por porción (${producto.porcion})</caption>
                <thead>
                    <tr>
                        <th scope="col">Nutrientes</th>
                        <th scope="col">Cantidad por porción</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasNutricionHTML}
                </tbody>
            </table>
        </section>
    `;
};


// Función para cargar las Ofertas en la página de Ofertas (ofertas.html)
const renderizarOfertas = (contenedor, arregloProductos) => {
    // Filtramos los productos que están en oferta
    const productosEnOferta = arregloProductos.filter(prod => prod.enOferta === true);

    if (productosEnOferta.length === 0) {
        contenedor.innerHTML = "<p>No hay ofertas disponibles por el momento.</p>";
        return;
    }

    //  Separamos el primer producto como el "Combo imperdible" y el resto como "Otros productos"
    const comboImperdible = productosEnOferta[0];
    const otrosProductos = productosEnOferta.slice(1);

    let htmlOfertas = '<h1>Ofertas</h1>';

    // Generamos la sección de "Combo imperdible"
    if (comboImperdible) {
        htmlOfertas += `
            <section>
                <h2>Combo imperdible</h2>
                <article class="tarjeta-oferta">
                    <figure class="oferta-imagen">
                        <a href="./detalle_producto.html?id=${comboImperdible.id}">
                            <img src="${comboImperdible.imagen}" alt="${comboImperdible.nombre}">
                        </a>
                    </figure>
                    <div class="oferta-contenido">
                        <h3>${comboImperdible.nombre}</h3>
                        <div class="oferta-precio-fila">
                            <span class="etiqueta-descuento">${Math.round(comboImperdible.descuento * 100)}% OFF</span>
                            <span class="precio-final">$${calcularPrecioFinal(comboImperdible).toLocaleString("es-AR")}</span>
                        </div>
                        <p>${comboImperdible.descripcion}</p>
                        <a href="./detalle_producto.html?id=${comboImperdible.id}" class="boton-principal">Ver producto</a>
                    </div>
                </article>
            </section>
        `;
    }

    // Generamos la sección de "Otros productos en oferta" si existen
    if (otrosProductos.length > 0) {
        htmlOfertas += `<section><h2>Otros productos en oferta</h2>`;
        
        otrosProductos.forEach(producto => {
            htmlOfertas += `
                <article class="tarjeta-oferta">
                    <figure class="oferta-imagen">
                        <a href="./detalle_producto.html?id=${producto.id}">
                            <img src="${producto.imagen}" alt="${producto.nombre}">
                        </a>
                    </figure>
                    <div class="oferta-contenido">
                        <h3>${producto.nombre}</h3>
                        <div class="oferta-precio-fila">
                            <span class="etiqueta-descuento">${Math.round(producto.descuento * 100)}% OFF</span>
                            <span class="precio-final">$${calcularPrecioFinal(producto).toLocaleString("es-AR")}</span>
                        </div>
                        <p>${producto.descripcion}</p>
                        <a href="./detalle_producto.html?id=${producto.id}" class="boton-principal">Ver producto</a>
                    </div>
                </article>
            `;
        });

        htmlOfertas += `</section>`;
    }

    // Cargamos todo en el contenedor general
    contenedor.innerHTML = htmlOfertas;
};

// Función para mostrar notificaciones temporales en la página
const mostrarNotificacion = (mensaje, tipo = "exito") => {
    let notificacion = document.getElementById("notificacion");

    if (!notificacion) {
        notificacion = document.createElement("div");
        notificacion.id = "notificacion";
        notificacion.setAttribute("role", "status");
        notificacion.setAttribute("aria-live", "polite");
        document.body.append(notificacion);
    }

    notificacion.textContent = mensaje;
    notificacion.className = `notificacion notificacion-${tipo}`;

    clearTimeout(notificacion.temporizador);
    notificacion.temporizador = setTimeout(() => {
        notificacion.classList.add("oculta");
    }, 3000);
};

// Función para renderizar un mensaje de error en cualquier contenedor
const renderizarError = (contenedor, mensaje) => {
    contenedor.innerHTML = `<p class="mensaje-error">${mensaje}</p>`;
};


// Dibuja los productos del carrito (items = [{ producto, cantidad }])
const renderizarCarrito = (contenedor, items) => {
    if (items.length === 0) {
        contenedor.innerHTML = `
            <p>Tu carrito está vacío.</p>
            <a href="./catalogo.html" class="boton-principal">Ir al catálogo</a>
        `;
        return;
    }

    contenedor.innerHTML = items.map(({ producto, cantidad }) => `
        <article class="producto-carrito">
            <img src="${producto.imagen}" alt="${producto.nombre}" width="100">
            <div class="info-producto-carrito">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p><strong>${formatearPrecio(calcularPrecioFinal(producto))}</strong> c/u</p>
            </div>
            <div class="cantidad-carrito">
                <div class="campo-form">
                    <label for="cantidad-${producto.id}">Cantidad</label>
                    <input type="number" id="cantidad-${producto.id}" min="1" max="${CANTIDAD_MAXIMA}"
                           value="${cantidad}" required data-accion="cantidad" data-id="${producto.id}">
                </div>
                <button type="button" class="boton-secundario" data-accion="quitar" data-id="${producto.id}"
                        aria-label="Quitar ${producto.nombre} del carrito">
                    Quitar
                </button>
            </div>
        </article>
    `).join("");
};

// costoEnvio: null = sin calcular, 0 = gratis, número = costo
const renderizarResumen = (subtotal, costoEnvio) => {
    document.getElementById("resumen-subtotal").textContent = formatearPrecio(subtotal);

    let textoEnvio = "A calcular";
    if (costoEnvio === 0) {
        textoEnvio = "Gratis";
    } else if (costoEnvio !== null) {
        textoEnvio = formatearPrecio(costoEnvio);
    }
    document.getElementById("resumen-envio").textContent = textoEnvio;

    document.getElementById("resumen-total").textContent = formatearPrecio(subtotal + (costoEnvio ?? 0));
};

// Pantalla de éxito: reemplaza el contenido del carrito
const renderizarConfirmacion = (contenedor, { numero, nombre, email, total }) => {
    contenedor.innerHTML = `
        <h1>¡Gracias por tu compra, ${escaparHTML(nombre)}!</h1>
        <section class="contenedor-formulario">
            <p>Tu pedido <strong>${numero}</strong> fue registrado por un total de
               <strong>${formatearPrecio(total)}</strong>.</p>
            <p>Te enviamos un email de confirmación a <strong>${escaparHTML(email)}</strong>.</p>
            <a href="./catalogo.html" class="boton-principal">Seguir comprando</a>
        </section>
    `;
};

export { renderizarProductos, renderizarDetalle, renderizarOfertas, renderizarError, 
    mostrarNotificacion, renderizarCarrito, renderizarResumen, renderizarConfirmacion };