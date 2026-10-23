const buscador = document.getElementById("buscador");
const libros = document.querySelectorAll(".mis-libros-grid > .libro");
const sinResultados = document.getElementById("sinResultados");

buscador.addEventListener("input", () => {
    const consulta = buscador.value.trim().toLocaleLowerCase("es");
    let visibles = 0;

    libros.forEach((libro) => {
        const coincide = libro.textContent.toLocaleLowerCase("es").includes(consulta);
        libro.hidden = !coincide;
        if (coincide) visibles += 1;
    });

    sinResultados.hidden = !consulta || visibles > 0;
});
