
document.addEventListener("DOMContentLoaded", function () {
    const imagen = document.getElementById("imagen");
    const vistaPrevia = document.getElementById("vistaPrevia");
    const contenidoSubir = document.getElementById("contenidoSubir");
    const zonaSubir = document.getElementById("zonaSubir");
    const descripcion = document.getElementById("descripcion");
    const contador = document.getElementById("contador");
    const formulario = document.getElementById("formularioLibro");
    const mensaje = document.getElementById("mensaje");

    if (!imagen || !vistaPrevia || !contenidoSubir || !zonaSubir) {
        console.error("No se encontraron los elementos de la portada.");
        return;
    }

    function mostrarImagen(archivo) {
        if (!archivo) {
            return;
        }

        const formatos = ["image/jpeg", "image/png", "image/webp"];

        if (!formatos.includes(archivo.type)) {
            alert("Selecciona una imagen JPG, PNG o WEBP.");
            return;
        }

        const lector = new FileReader();

        lector.onload = function () {
            vistaPrevia.src = lector.result;
            vistaPrevia.style.display = "block";
            contenidoSubir.style.display = "none";
        };

        lector.onerror = function () {
            alert("No se pudo leer la imagen.");
        };

        lector.readAsDataURL(archivo);
    }

    imagen.addEventListener("change", function () {
        mostrarImagen(imagen.files[0]);
    });

    zonaSubir.addEventListener("dragover", function (evento) {
        evento.preventDefault();
        zonaSubir.classList.add("arrastrando");
    });

    zonaSubir.addEventListener("dragleave", function () {
        zonaSubir.classList.remove("arrastrando");
    });

    zonaSubir.addEventListener("drop", function (evento) {
        evento.preventDefault();
        zonaSubir.classList.remove("arrastrando");

        const archivo = evento.dataTransfer.files[0];

        if (archivo) {
            mostrarImagen(archivo);
        }
    });

    if (descripcion && contador) {
        descripcion.addEventListener("input", function () {
            contador.textContent = descripcion.value.length + "/2000";
        });
    }

    if (formulario) {
        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();

            if (!imagen.files.length) {
                mensaje.textContent = "Selecciona la portada de tu libro.";
                return;
            }

            mensaje.textContent = "Formulario completo. Para guardar el libro necesitas conectar una base de datos.";
        });
    }
});