const inputPortada = document.getElementById("portada");
const zonaPortada = document.getElementById("zonaPortada");
const vistaPortada = document.getElementById("vistaPortada");
const contenidoPortada = document.getElementById("contenidoPortada");

const descripcion = document.getElementById("descripcion");
const contador = document.getElementById("contador");

const formulario = document.getElementById("formularioLibro");
const mensaje = document.getElementById("mensaje");

let archivoPortada = null;
let urlPortada = null;

function limpiarPortada() {
    archivoPortada = null;
    if (urlPortada) {
        URL.revokeObjectURL(urlPortada);
        urlPortada = null;
    }

    vistaPortada.removeAttribute("src");
    vistaPortada.hidden = true;
    contenidoPortada.hidden = false;
}

// Vista previa de la portada
function mostrarPortada(archivo) {
    if (!archivo) return;

    const formatosPermitidos = [
        "image/jpeg",
        "image/png"
    ];

    if (!formatosPermitidos.includes(archivo.type) || archivo.size > 5 * 1024 * 1024) {
        limpiarPortada();
        mensaje.textContent = formatosPermitidos.includes(archivo.type)
            ? "La imagen no puede superar los 5 MB."
            : "Selecciona una imagen JPG o PNG.";
        mensaje.className = "mensaje error";
        inputPortada.value = "";
        return;
    }

    if (urlPortada) {
        URL.revokeObjectURL(urlPortada);
    }

    archivoPortada = archivo;
    urlPortada = URL.createObjectURL(archivo);

    vistaPortada.src = urlPortada;
    vistaPortada.hidden = false;
    contenidoPortada.hidden = true;

    mensaje.textContent = "";
    mensaje.className = "mensaje";
}

inputPortada.addEventListener("change", function () {
    mostrarPortada(this.files[0]);
});

// Permitir arrastrar imágenes
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

// Contador de caracteres
contador.textContent = `${descripcion.value.length}/2000`;
descripcion.addEventListener("input", function () {
    contador.textContent = `${this.value.length}/2000`;
});

// Validar el formulario
formulario.addEventListener("submit", function (evento) {
    const titulo = document.getElementById("titulo").value.trim();
    const textoDescripcion = descripcion.value.trim();
    const selectorCategoria = document.getElementById("categoria");
    const categoria = selectorCategoria.value;
    const precioValor = document.getElementById("precio").value;
    const precio = precioValor === "" ? null : Number(precioValor);

    if (!titulo || !textoDescripcion || !categoria) {
        evento.preventDefault();
        mensaje.textContent = "Completa todos los campos obligatorios.";
        mensaje.className = "mensaje error";
        return;
    }

    if (!archivoPortada && formulario.dataset.editar !== "true") {
        evento.preventDefault();
        mensaje.textContent = "Debes seleccionar la portada de tu libro.";
        mensaje.className = "mensaje error";
        return;
    }

    if (precio !== null && (!Number.isFinite(precio) || precio < 0)) {
        evento.preventDefault();
        mensaje.textContent = "El precio debe ser un número válido mayor o igual a cero.";
        mensaje.className = "mensaje error";
        return;
    }
});