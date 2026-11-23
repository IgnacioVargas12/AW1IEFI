const ENVIO_POR_ZONA = {
    local:   { costo: 0,     provincias: ["cordoba"] },
    cercana: { costo: 4500,  provincias: ["buenos-aires", "santa-fe", "santiago-del-estero", "catamarca", "la-rioja", "san-luis", "la-pampa"] },
    media:   { costo: 7000,  provincias: ["caba", "entre-rios", "tucuman", "san-juan", "mendoza", "salta", "jujuy", 
            "chaco", "corrientes", "formosa", "misiones", "neuquen", "rio-negro"] },
    lejana:  { costo: 10000, provincias: ["chubut", "santa-cruz", "tierra-del-fuego"] }
};

// Devuelve el costo del envío, o null si la provincia no existe
export const calcularEnvio = (provincia) => {
    for (const zona of Object.values(ENVIO_POR_ZONA)) {
        if (zona.provincias.includes(provincia)) {
            return zona.costo;
        }
    }
    return null;
};