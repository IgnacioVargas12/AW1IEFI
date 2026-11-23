import { REGEX_EMAIL, REGEX_NOMBRE, REGEX_TELEFONO } from './utilidades.js';

// Validación con JS (además de required, type="email" y pattern del HTML)
export const validarConsulta = ({ nombre, apellido, correo, telefono, comentario }) => {
    const errores = [];

    if (!REGEX_NOMBRE.test(nombre)) {
        errores.push("Ingresá un nombre válido (solo letras).");
    }
    if (!REGEX_NOMBRE.test(apellido)) {
        errores.push("Ingresá un apellido válido (solo letras).");
    }
    if (!REGEX_EMAIL.test(correo)) {
        errores.push("Ingresá un email válido.");
    }
    // El teléfono es opcional: solo se valida si lo completaron
    if (telefono !== "" && !REGEX_TELEFONO.test(telefono)) {
        errores.push("El teléfono solo puede tener números, espacios y guiones (8 a 18 caracteres).");
    }
    if (comentario.length < 10 || comentario.length > 1000) {
        errores.push("El mensaje debe tener entre 10 y 1000 caracteres.");
    }
    return errores;
};

// Nombres de variables = los de la plantilla de EmailJS
export const construirParametrosConsulta = ({ nombre, apellido, correo, telefono, comentario }) => ({
    nombre,
    apellido,
    correo,
    telefono: telefono || "No informado",
    mensaje: comentario
});