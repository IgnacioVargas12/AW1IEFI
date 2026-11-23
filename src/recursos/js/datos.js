export async function obtenerDatos(url) {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status} al pedir ${url}`);
    }

    return await respuesta.json();
}