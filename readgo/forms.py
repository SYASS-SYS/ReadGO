from pathlib import Path

from django import forms

from .models import Libro


class LibroForm(forms.ModelForm):
    class Meta:
        model = Libro
        fields = ('titulo', 'descripcion', 'categoria', 'precio', 'portada')
        widgets = {
            'titulo': forms.TextInput(attrs={
                'id': 'titulo',
                'placeholder': 'Escribe el título de tu libro...',
                'maxlength': 120,
            }),
            'descripcion': forms.Textarea(attrs={
                'id': 'descripcion',
                'placeholder': 'Cuéntanos de qué trata tu libro...',
                'maxlength': 2000,
            }),
            'categoria': forms.Select(attrs={'id': 'categoria'}),
            'precio': forms.NumberInput(attrs={
                'id': 'precio',
                'placeholder': 'Ej. 9500.00',
                'min': 0,
                'step': '0.01',
            }),
            'portada': forms.FileInput(attrs={
                'id': 'portada',
                'accept': 'image/png,image/jpeg',
                'hidden': True,
                'form': 'formularioLibro',
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['portada'].required = not bool(self.instance.pk)

    def clean_portada(self):
        portada = self.cleaned_data.get('portada')
        if not portada or not hasattr(portada, 'read'):
            return portada

        if portada.size > 5 * 1024 * 1024:
            raise forms.ValidationError('La imagen no puede superar los 5 MB.')

        extension = Path(portada.name).suffix.lower()
        encabezado = portada.read(8)
        portada.seek(0)
        es_png = extension == '.png' and encabezado.startswith(b'\x89PNG\r\n\x1a\n')
        es_jpeg = extension in {'.jpg', '.jpeg'} and encabezado.startswith(b'\xff\xd8\xff')
        if not (es_png or es_jpeg):
            raise forms.ValidationError('Selecciona una imagen JPG o PNG válida.')

        return portada
