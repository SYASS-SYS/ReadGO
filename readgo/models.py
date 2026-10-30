from django.conf import settings
from django.db import models

# Create your models here.

class Categoria(models.TextChoices):
    FANTASIA = "fantasia", "Fantasía"
    ROMANCE = "romance", "Romance"
    MISTERIO = "misterio", "Misterio"
    AVENTURA = "aventura", "Aventura"
    CIENCIA_FICCION = "ciencia_ficcion", "Ciencia ficción"
    TERROR = "terror", "Terror"
    DRAMA = "drama", "Drama"
    POESIA = "poesia", "Poesía"
    EDUCACION = "educacion", "Educación"
    OTROS = "otros", "Otros"

class Libro(models.Model):
    titulo = models.CharField(max_length=120)
    descripcion = models.TextField()
    categoria = models.CharField(
        max_length=100,
        choices=Categoria.choices,
        )
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    portada = models.FileField(
        upload_to='portadas/',
        blank=True,
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="libros_publicados",
    )
    destacado = models.BooleanField(default=False)

    def __str__(self):
        return self.titulo
