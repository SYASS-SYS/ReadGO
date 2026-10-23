const NOMBRE_BASE_DATOS = "readgo";
const ALMACEN_LIBROS = "libros";

function abrirBaseDatos() {
    return new Promise((resolve, reject) => {
        const solicitud = indexedDB.open(NOMBRE_BASE_DATOS, 1);

        solicitud.onupgradeneeded = () => {
            solicitud.result.createObjectStore(ALMACEN_LIBROS, {
                keyPath: "id",
                autoIncrement: true
            });
        };
        solicitud.onsuccess = () => resolve(solicitud.result);
        solicitud.onerror = () => reject(solicitud.error);
    });
}

async function usarAlmacen(modo, accion) {
    const baseDatos = await abrirBaseDatos();

    return new Promise((resolve, reject) => {
        const transaccion = baseDatos.transaction(ALMACEN_LIBROS, modo);
        const solicitud = accion(transaccion.objectStore(ALMACEN_LIBROS));
        let resultado;

        solicitud.onsuccess = () => {
            resultado = solicitud.result;
        };
        transaccion.oncomplete = () => {
            baseDatos.close();
            resolve(resultado);
        };
        transaccion.onerror = transaccion.onabort = () => {
            baseDatos.close();
            reject(transaccion.error || solicitud.error);
        };
    });
}

export const guardarLibro = (libro) =>
    usarAlmacen("readwrite", (almacen) => almacen.add(libro));

export const obtenerLibros = () =>
    usarAlmacen("readonly", (almacen) => almacen.getAll());
