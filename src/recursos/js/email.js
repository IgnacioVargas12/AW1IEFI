import { URL_EMAILJS, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from './config.js';

export async function enviarEmail(parametros, templateId = EMAILJS_TEMPLATE_ID) {
    const respuesta = await fetch(URL_EMAILJS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: templateId,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: parametros
        })
    });

    if (!respuesta.ok) {
        const detalle = await respuesta.text();
        throw new Error(`EmailJS respondió ${respuesta.status}: ${detalle}`);
    }
}