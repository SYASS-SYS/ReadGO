import logging

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponseNotAllowed
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import LibroForm, RegistroForm
from .models import Libro

logger = logging.getLogger(__name__)

def es_admin(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)


def inicio(request):
    destacados = Libro.objects.filter(destacado=True).order_by('-id')
    nuevos_libros = Libro.objects.order_by('-id')[:5]
    return render(request, 'libros/index.html', {
        'destacados': destacados,
        'nuevos_libros': nuevos_libros,
    })


def iniciar_sesion(request):
    if request.user.is_authenticated:
        return redirect('panel_admin' if es_admin(request.user) else 'inicio')
    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('panel_admin' if es_admin(user) else 'inicio')
        error = 'Usuario o contraseña incorrectos.'
    return render(request, 'libros/login.html', {'error': error})


def registro(request):
    if request.user.is_authenticated:
        return redirect('inicio')
    form = RegistroForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, 'Tu cuenta se creó correctamente.')
        return redirect('inicio')
    return render(request, 'libros/registro.html', {'form': form})


@login_required
def cerrar_sesion(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    logout(request)
    return redirect('login')


@login_required
def crear_libro(request):
    form = LibroForm(request.POST or None, request.FILES or None)
    if request.method == 'POST' and form.is_valid():
        libro = form.save(commit=False)
        libro.usuario = request.user
        libro.save()
        return redirect('listar_libros')
    return render(request, 'libros/publicar.html', {'form': form})


@login_required
def listar_libros(request):
    if es_admin(request.user):
        libros = Libro.objects.all().order_by('-id')
    else:
        libros = Libro.objects.filter(usuario=request.user).order_by('-id')
    return render(request, 'libros/mis-libros.html', {'libros': libros})


def detalle_libro(request, libro_id):
    # Las historias publicadas se pueden leer sin iniciar sesión.
    libro = get_object_or_404(Libro, pk=libro_id)
    return render(request, 'libros/detalle-libro.html', {'libro': libro})


def _eliminar_portada_si_disponible(portada):
    if not portada:
        return
    nombre = portada.name
    try:
        portada.delete(save=False)
    except PermissionError as error:
        logger.warning('No se pudo borrar la portada %s: %s', nombre, error)


@login_required
@require_POST
def eliminar_libro(request, libro_id):
    libro = get_object_or_404(Libro, id=libro_id)
    if not es_admin(request.user) and libro.usuario_id != request.user.id:
        messages.error(request, 'No tienes permiso para eliminar ese libro.')
        return redirect('listar_libros')
    _eliminar_portada_si_disponible(libro.portada)
    libro.delete()
    messages.success(request, 'El libro se eliminó correctamente.')
    return redirect('panel_admin' if es_admin(request.user) else 'listar_libros')


@login_required
def editar_libro(request, libro_id):
    libro = get_object_or_404(Libro, id=libro_id)
    if not es_admin(request.user) and libro.usuario_id != request.user.id:
        messages.error(request, 'No tienes permiso para editar ese libro.')
        return redirect('listar_libros')
    portada_anterior = libro.portada
    form = LibroForm(request.POST or None, request.FILES or None, instance=libro)
    if request.method == 'POST' and form.is_valid():
        libro = form.save()
        if portada_anterior and portada_anterior != libro.portada:
            _eliminar_portada_si_disponible(portada_anterior)
        return redirect('detalle_libro', libro_id=libro.pk)
    return render(request, 'libros/publicar.html', {'form': form, 'libro': libro})


@login_required
@user_passes_test(es_admin, login_url='login')
def panel_admin(request):
    libros = Libro.objects.select_related('usuario').order_by('-id')
    return render(request, 'libros/panel-admin.html', {
        'libros': libros, 'total_libros': libros.count(),
        'total_usuarios': __import__('django.contrib.auth', fromlist=['get_user_model']).get_user_model().objects.filter(is_staff=False, is_superuser=False).count(),
        'total_destacados': Libro.objects.filter(destacado=True).count(),
    })


@login_required
@user_passes_test(es_admin, login_url='login')
@require_POST
def alternar_destacado(request, libro_id):
    libro = get_object_or_404(Libro, id=libro_id)
    libro.destacado = not libro.destacado
    libro.save(update_fields=['destacado'])
    messages.success(request, 'El libro se agregó a destacados.' if libro.destacado else 'El libro se quitó de destacados.')
    return redirect('panel_admin')
