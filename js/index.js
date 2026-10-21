const buscador = document.getElementById("buscador");
const libros = document.querySelectorAll(".libro");
const sinResultados = document.getElementById("sinResultados");

buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase().trim();
    let encontrados = 0;

    libros.forEach(libro => {
        const contenido = libro.dataset.busqueda.toLowerCase();
        const coincide = contenido.includes(texto);

        libro.style.display = coincide ? "" : "none";

        if (coincide) encontrados++;
    });

    sinResultados.hidden = encontrados !== 0;
});



const carrusel = document.getElementById("carrusel");

document.getElementById("anterior").addEventListener("click", () => {
    carrusel.scrollBy({ left: -220, behavior: "smooth" });
});

document.getElementById("siguiente").addEventListener("click", () => {
    carrusel.scrollBy({ left: 220, behavior: "smooth" });
});