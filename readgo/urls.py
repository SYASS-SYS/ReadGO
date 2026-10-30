from django.urls import path
from . import views

urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('login/', views.iniciar_sesion, name='login'),
    path('registro/', views.registro, name='registro'),
    path('logout/', views.cerrar_sesion, name='logout'),
    path('administracion/', views.panel_admin, name='panel_admin'),
    path('administracion/destacado/<int:libro_id>/', views.alternar_destacado, name='alternar_destacado'),
    path('crear/', views.crear_libro, name='crear_libro'),
    path('listar/', views.listar_libros, name='listar_libros'),
    path('libro/<int:libro_id>/', views.detalle_libro, name='detalle_libro'),
    path('eliminar/<int:libro_id>/', views.eliminar_libro, name='eliminar_libro'),
    path('editar/<int:libro_id>/', views.editar_libro, name='editar_libro'),
]
