import logging

from django.http import HttpResponseNotAllowed
from django.shortcuts import get_object_or_404, redirect, render

from .forms import LibroForm
from .models import Libro

logger = logging.getLogger(__name__)


def inicio(request):
    return render(request, 'libros/index.html')


def crear_libro(request):
    form = LibroForm(request.POST or None, request.FILES or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('listar_libros')

    return render(request, 'libros/publicar.html', {'form': form})


def listar_libros(request):
    libros = Libro.objects.order_by('-id')
    return render(request, 'libros/mis-libros.html', {'libros': libros})


def detalle_libro(request, libro_id):
    libro = get_object_or_404(Libro, pk=libro_id)
    return render(request, 'libros/detalle-libro.html', {'libro': libro})


def _eliminar_portada_si_disponible(portada):
    if not portada:
        return

    nombre = portada.name
    try:
        portada.delete(save=False)
    except PermissionError as error:
        logger.warning(
            'No se pudo borrar la portada %s porque está siendo utilizada: %s',
            nombre,
            error,
        )


def eliminar_libro(request, libro_id):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

    libro = get_object_or_404(Libro, id=libro_id)
    _eliminar_portada_si_disponible(libro.portada)
    libro.delete()
    return redirect('listar_libros')


def editar_libro(request, libro_id):
    libro = get_object_or_404(Libro, id=libro_id)
    portada_anterior = libro.portada

    form = LibroForm(
        request.POST or None,
        request.FILES or None,
        instance=libro,
    )
    if request.method == 'POST' and form.is_valid():
        libro = form.save()
        if portada_anterior and portada_anterior != libro.portada:
            _eliminar_portada_si_disponible(portada_anterior)
        return redirect('detalle_libro', libro_id=libro.pk)

    return render(
        request,
        'libros/publicar.html',
        {'form': form, 'libro': libro},
    )
