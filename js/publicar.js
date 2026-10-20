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

// Vista previa de la portada
function mostrarPortada(archivo) {
    if (!archivo) return;

    const formatosPermitidos = [
        "image/jpeg",
        "image/png"
    ];

    if (!formatosPermitidos.includes(archivo.type)) {
        mensaje.textContent = "Selecciona una imagen JPG o PNG.";
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
        mostrarPortada(archivo);
    }
});

// Contador de caracteres
descripcion.addEventListener("input", function () {
    contador.textContent = `${this.value.length}/2000`;
});

// Validar el formulario
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const textoDescripcion = descripcion.value.trim();
    const categoria = document.getElementById("categoria").value;

    if (!archivoPortada) {
        mensaje.textContent = "Debes seleccionar la portada de tu libro.";
        mensaje.className = "mensaje error";
        return;
    }

    if (!titulo || !textoDescripcion || !categoria) {
        mensaje.textContent = "Completa todos los campos obligatorios.";
        mensaje.className = "mensaje error";
        return;
    }

    mensaje.textContent = "¡Formulario validado! Para publicar el libro de forma permanente, debes conectar un servidor o una base de datos.";
    mensaje.className = "mensaje exito";
});