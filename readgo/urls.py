from django.urls import path
from . import views

urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('crear/', views.crear_libro, name='crear_libro'),
    path('listar/', views.listar_libros, name='listar_libros'),
    path('libro/<int:libro_id>/', views.detalle_libro, name='detalle_libro'),
    path('eliminar/<int:libro_id>/', views.eliminar_libro,
    name='eliminar_libro'),
    path('editar/<int:libro_id>/', views.editar_libro, name='editar_libro'),
]
