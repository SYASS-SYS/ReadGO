import { obtenerLibros } from "./almacen-libros.js";

const buscador = document.getElementById("buscador");
const lista = document.getElementById("listaMisLibros");
const estado = document.getElementById("estadoLibros");
const sinResultados = document.getElementById("sinResultados");
const cantidad = document.getElementById("cantidadLibros");
const resumen = document.getElementById("resumenCantidad");
let libros = [];
const urlsPortadas = [];

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    elemento.textContent = texto;
    return elemento;
}

function crearTarjeta(libro) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "libro";

    const portada = crearElemento("div", "libro-portada mis-libro-portada", "");
    const imagen = document.createElement("img");
    imagen.src = libro.portadaUrl;
    imagen.alt = `Portada de ${libro.titulo}`;
    portada.append(imagen, crearElemento("span", "genero", libro.categoria));

    const precio = libro.precio === null
        ? "Gratis"
        : new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 2
        }).format(libro.precio);
    const informacion = crearElemento("div", "libro-info", "");
    informacion.append(
        crearElemento("h3", "", libro.titulo),
        crearElemento("p", "", precio),
        crearElemento("p", "mis-libro-descripcion", libro.descripcion)
    );
    tarjeta.append(portada, informacion);
    return tarjeta;
}

function mostrarLibros() {
    const consulta = buscador.value.trim().toLocaleLowerCase("es");
    const filtrados = libros.filter((libro) =>
        `${libro.titulo} ${libro.descripcion} ${libro.categoria}`
            .toLocaleLowerCase("es").includes(consulta)
    );

    lista.replaceChildren(...filtrados.map(crearTarjeta));
    sinResultados.hidden = !libros.length || !!filtrados.length;
    estado.hidden = libros.length > 0;
}

buscador.addEventListener("input", mostrarLibros);
window.addEventListener("beforeunload", () =>
    urlsPortadas.forEach((url) => URL.revokeObjectURL(url))
);

try {
    libros = (await obtenerLibros()).sort((a, b) => b.fecha - a.fecha);
    libros.forEach((libro) => {
        libro.portadaUrl = URL.createObjectURL(libro.portada);
        urlsPortadas.push(libro.portadaUrl);
    });

    cantidad.textContent = `${libros.length} ${libros.length === 1 ? "libro" : "libros"}`;
    resumen.textContent = libros.length;
    mostrarLibros();

    if (new URLSearchParams(location.search).has("publicado")) {
        estado.textContent = "¡Tu libro se publicó y ya está en tu biblioteca!";
        estado.hidden = false;
        history.replaceState({}, "", location.pathname);
    } else if (!libros.length) {
        estado.innerHTML = 'Aún no has publicado libros. <a href="./publicar.html">Publica tu primera historia</a>';
    }
} catch (error) {
    console.error("No se pudieron cargar los libros.", error);
    estado.textContent = "No se pudieron cargar tus libros. Revisa el almacenamiento del navegador e inténtalo de nuevo.";
    estado.classList.add("error");
    estado.hidden = false;
}
