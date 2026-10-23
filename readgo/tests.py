from decimal import Decimal
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import Libro


class LibroPagesTests(TestCase):
    def setUp(self):
        self.media_dir = TemporaryDirectory()
        self.addCleanup(self.media_dir.cleanup)
        media_settings = override_settings(MEDIA_ROOT=self.media_dir.name)
        media_settings.enable()
        self.addCleanup(media_settings.disable)

    def portada_png(self, name='portada.png'):
        return SimpleUploadedFile(
            name,
            b'\x89PNG\r\n\x1a\ncontenido-de-prueba',
            content_type='image/png',
        )

    def test_home_page_loads_at_readgo_root(self):
        response = self.client.get(reverse('inicio'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Tu historia')
        self.assertContains(response, '/static/css/styleI.css')

    def test_book_pages_load(self):
        for route_name in ('crear_libro', 'listar_libros'):
            with self.subTest(route_name=route_name):
                response = self.client.get(reverse(route_name))
                self.assertEqual(response.status_code, 200)
                if route_name == 'crear_libro':
                    self.assertContains(
                        response,
                        'form="formularioLibro"',
                    )

    def test_list_page_links_to_book_actions(self):
        libro = Libro.objects.create(
            titulo='Libro visible',
            descripcion='Descripción del libro.',
            categoria='aventura',
        )

        response = self.client.get(reverse('listar_libros'))

        self.assertContains(
            response,
            reverse('detalle_libro', args=[libro.id]),
        )
        self.assertContains(
            response,
            reverse('editar_libro', args=[libro.id]),
        )
        self.assertContains(
            response,
            reverse('eliminar_libro', args=[libro.id]),
        )

    def test_create_book_accepts_repeated_prices(self):
        payload = {
            'titulo': 'Libro de prueba',
            'descripcion': 'Descripción de prueba.',
            'categoria': 'fantasia',
            'precio': '9500.00',
            'portada': self.portada_png(),
        }

        response = self.client.post(reverse('crear_libro'), payload)

        primer_libro = Libro.objects.get()
        self.assertRedirects(response, reverse('listar_libros'))
        self.assertEqual(Libro.objects.count(), 1)
        self.assertEqual(Libro.objects.get().precio, Decimal('9500.00'))
        self.assertContains(
            self.client.get(reverse('listar_libros')),
            reverse('detalle_libro', args=[primer_libro.id]),
        )

        payload['titulo'] = 'Otro libro al mismo precio'
        payload['portada'] = self.portada_png('otra-portada.png')
        response = self.client.post(reverse('crear_libro'), payload)

        segundo_libro = Libro.objects.order_by('-id').first()
        self.assertRedirects(response, reverse('listar_libros'))
        self.assertEqual(Libro.objects.count(), 2)
        self.assertTrue(Path(segundo_libro.portada.path).is_file())

    def test_create_rejects_non_image_cover(self):
        response = self.client.post(
            reverse('crear_libro'),
            {
                'titulo': 'Libro inválido',
                'descripcion': 'Descripción.',
                'categoria': 'fantasia',
                'precio': '',
                'portada': SimpleUploadedFile(
                    'portada.png',
                    b'no es una imagen',
                    content_type='image/png',
                ),
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Selecciona una imagen JPG o PNG válida.')
        self.assertFalse(Libro.objects.exists())

    def test_edit_and_delete_book(self):
        libro = Libro.objects.create(
            titulo='Libro original',
            descripcion='Descripción original.',
            categoria='fantasia',
            precio=None,
            portada=self.portada_png(),
        )

        response = self.client.get(reverse('detalle_libro', args=[libro.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Descripción original.')
        self.assertContains(response, libro.portada.url)

        portada_anterior = Path(libro.portada.path)
        response = self.client.get(reverse('editar_libro', args=[libro.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Libro original')

        response = self.client.post(
            reverse('editar_libro', args=[libro.id]),
            {
                'titulo': 'Libro actualizado',
                'descripcion': 'Descripción actualizada.',
                'categoria': 'misterio',
                'precio': '',
                'portada': self.portada_png('portada-actualizada.png'),
            },
        )
        self.assertRedirects(
            response,
            reverse('detalle_libro', args=[libro.id]),
        )
        libro.refresh_from_db()
        self.assertEqual(libro.titulo, 'Libro actualizado')
        self.assertIsNone(libro.precio)
        self.assertNotEqual(Path(libro.portada.path), portada_anterior)
        self.assertFalse(portada_anterior.exists())

        response = self.client.get(reverse('eliminar_libro', args=[libro.id]))
        self.assertEqual(response.status_code, 405)
        portada_final = Path(libro.portada.path)
        response = self.client.post(reverse('eliminar_libro', args=[libro.id]))
        self.assertRedirects(response, reverse('listar_libros'))
        self.assertFalse(Libro.objects.filter(id=libro.id).exists())
        self.assertFalse(portada_final.exists())

    def test_delete_book_succeeds_when_cover_is_locked(self):
        libro = Libro.objects.create(
            titulo='Libro con portada bloqueada',
            descripcion='Descripción.',
            categoria='fantasia',
            portada=self.portada_png(),
        )
        storage = libro.portada.storage
        url = reverse('eliminar_libro', args=[libro.id])

        with self.assertLogs('readgo.views', level='WARNING') as logs:
            with patch.object(
                storage,
                'delete',
                side_effect=PermissionError('El archivo está en uso.'),
            ):
                response = self.client.post(url)

        self.assertRedirects(response, reverse('listar_libros'))
        self.assertFalse(Libro.objects.filter(id=libro.id).exists())
        self.assertIn('está siendo utilizada', logs.output[0])
