const inputPortada = document.getElementById("portada");
const zonaPortada = document.getElementById("zonaPortada");
const vistaPortada = document.getElementById("vistaPortada");
const contenidoPortada = document.getElementById("contenidoPortada");
const portadaOriginal = vistaPortada.getAttribute("src");

const campoTitulo = document.getElementById("titulo");
const campoDescripcion = document.getElementById("descripcion");
const campoCategoria = document.getElementById("categoria");
const campoPrecio = document.getElementById("precio");
const contador = document.getElementById("contador");

const formulario = document.getElementById("formularioLibro");
const mensaje = document.getElementById("mensaje");

let archivoPortada = null;
let urlPortada = null;

zonaPortada.tabIndex = -1;

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = tipo === "error" ? "mensaje error" : "mensaje";
    mensaje.dataset.tipo = tipo;
}

function limpiarMensaje(tipo) {
    if (mensaje.dataset.tipo === tipo) {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
        delete mensaje.dataset.tipo;
    }
}

function marcarInvalido(campo, texto, tipo, enfocar = true) {
    campo.setAttribute("aria-invalid", "true");
    mostrarMensaje(texto, tipo);
    if (enfocar) {
        campo.focus();
    }
}

function limpiarInvalido(campo, tipo) {
    campo.removeAttribute("aria-invalid");
    limpiarMensaje(tipo);
}

function restaurarPortada() {
    archivoPortada = null;

    if (urlPortada) {
        URL.revokeObjectURL(urlPortada);
        urlPortada = null;
    }

    inputPortada.value = "";

    if (portadaOriginal) {
        vistaPortada.src = portadaOriginal;
        vistaPortada.hidden = false;
        contenidoPortada.hidden = true;
    } else {
        vistaPortada.removeAttribute("src");
        vistaPortada.hidden = true;
        contenidoPortada.hidden = false;
    }
}

function rechazarPortada(texto) {
    restaurarPortada();
    marcarInvalido(inputPortada, texto, "portada", false);
    zonaPortada.focus();
}

function mostrarPortada(archivo) {
    if (!archivo) return;

    const formatosPermitidos = ["image/jpeg", "image/png"];
    if (!formatosPermitidos.includes(archivo.type)) {
        rechazarPortada("Selecciona una imagen JPG o PNG.");
        return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
        rechazarPortada("La imagen no puede superar los 5 MB.");
        return;
    }

    if (urlPortada) {
        URL.revokeObjectURL(urlPortada);
    }

    archivoPortada = null;
    const nuevaUrl = URL.createObjectURL(archivo);
    urlPortada = nuevaUrl;

    const imagen = new Image();
    imagen.onload = function () {
        if (urlPortada !== nuevaUrl) return;

        if (imagen.naturalWidth === 0 || imagen.naturalHeight === 0) {
            rechazarPortada("No se pudo leer la imagen. Prueba con otra portada.");
            return;
        }

        archivoPortada = archivo;
        vistaPortada.src = nuevaUrl;
        vistaPortada.hidden = false;
        contenidoPortada.hidden = true;
        limpiarInvalido(inputPortada, "portada");
        mostrarMensaje(
            `Portada cargada: ${imagen.naturalWidth} × ${imagen.naturalHeight} px.`,
            "info",
        );
    };
    imagen.onerror = function () {
        if (urlPortada === nuevaUrl) {
            rechazarPortada("No se pudo leer la imagen. Prueba con otra portada.");
        }
    };
    imagen.src = nuevaUrl;
}

inputPortada.addEventListener("change", function () {
    mostrarPortada(this.files[0]);
});

zonaPortada.addEventListener("dragover", function (evento) {
    evento.preventDefault();
    zonaPortada.classList.add("arrastrando");
});

zonaPortada.addEventListener("dragleave", function () {
    zonaPortada.classList.remove("arrastrando");
});

zonaPortada.addEventListener("drop", function (evento) {
    evento.preventDefault();
    zonaPortada.classList.remove("arrastrando");

    const archivo = evento.dataTransfer.files[0];
    if (archivo) {
        const archivos = new DataTransfer();
        archivos.items.add(archivo);
        inputPortada.files = archivos.files;
        mostrarPortada(archivo);
    }
});

contador.textContent = `${campoDescripcion.value.length}/20000`;
campoDescripcion.addEventListener("input", function () {
    contador.textContent = `${this.value.length}/20000`;
});

const mensajeErrorPrecio =
    "El precio debe ser un número válido mayor o igual a cero.";

function validarPrecio(enfocar = false) {
    const valor = campoPrecio.value.trim();
    const estaVacio = valor === "" && !campoPrecio.validity.badInput;
    const precio = campoPrecio.valueAsNumber;
    const esValido =
        estaVacio ||
        (!campoPrecio.validity.badInput &&
            campoPrecio.validity.valid &&
            Number.isFinite(precio) &&
            precio >= 0);

    if (!esValido) {
        const texto = campoPrecio.validity.stepMismatch
            ? "El precio puede tener máximo dos decimales."
            : mensajeErrorPrecio;
        marcarInvalido(campoPrecio, texto, "precio", enfocar);
        return false;
    }

    limpiarInvalido(campoPrecio, "precio");
    return true;
}

campoPrecio.addEventListener("input", function () {
    validarPrecio();
});
campoPrecio.addEventListener("blur", function () {
    validarPrecio();
});

for (const [campo, tipo] of [
    [campoTitulo, "titulo"],
    [campoDescripcion, "descripcion"],
]) {
    campo.addEventListener("input", function () {
        if (campo.validity.valid && campo.value.trim()) {
            limpiarInvalido(campo, tipo);
        }
    });
}

campoCategoria.addEventListener("change", function () {
    if (campoCategoria.validity.valid && campoCategoria.value.trim()) {
        limpiarInvalido(campoCategoria, "categoria");
    }
});

formulario.addEventListener(
    "invalid",
    function (evento) {
        const campo = evento.target;
        let texto = "Revisa este campo.";

        if (campo === campoTitulo) {
            texto = "Escribe el título de tu libro.";
        } else if (campo === campoDescripcion) {
            texto = "Escribe la descripción de tu libro.";
        } else if (campo === campoCategoria) {
            texto = "Selecciona una categoría.";
        } else if (campo === campoPrecio) {
            texto = campoPrecio.validity.stepMismatch
                ? "El precio puede tener máximo dos decimales."
                : mensajeErrorPrecio;
        } else if (campo === inputPortada) {
            texto = "Debes seleccionar una portada válida para tu libro.";
        }

        campo.setAttribute("aria-invalid", "true");
        mostrarMensaje(texto, "error");

        if (campo === inputPortada) {
            zonaPortada.focus();
        }
    },
    true,
);

formulario.addEventListener("submit", function (evento) {
    const camposObligatorios = [
        [campoTitulo, "Escribe el título de tu libro.", "titulo"],
        [campoDescripcion, "Escribe la descripción de tu libro.", "descripcion"],
        [campoCategoria, "Selecciona una categoría.", "categoria"],
    ];

    for (const [campo, texto, tipo] of camposObligatorios) {
        if (!campo.value.trim()) {
            evento.preventDefault();
            marcarInvalido(campo, texto, tipo);
            return;
        }
        limpiarInvalido(campo, tipo);
    }

    if (!archivoPortada && formulario.dataset.editar !== "true") {
        evento.preventDefault();
        marcarInvalido(
            inputPortada,
            "Debes seleccionar una portada válida para tu libro.",
            "portada",
            false,
        );
        zonaPortada.focus();
        return;
    }
    limpiarInvalido(inputPortada, "portada");

    if (!validarPrecio(true)) {
        evento.preventDefault();
    }
});
