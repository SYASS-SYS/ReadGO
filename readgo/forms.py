from pathlib import Path

from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import Libro


class RegistroForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        label="Correo electrónico",
    )

    class Meta(UserCreationForm.Meta):
        fields = ("username", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"].label = "Usuario"
        self.fields["username"].help_text = (
            "Requerido. 150 caracteres o menos. Letras, dígitos y @/./+/-/_ solamente."
        )
        self.fields["email"].help_text = "Usaremos este correo para avisos y recuperación de tu cuenta."
        self.fields["password1"].label = "Contraseña"
        self.fields["password1"].help_text = (
            "<ul>"
            "<li>Tu contraseña no puede ser demasiado similar a tu otra información personal.</li>"
            "<li>Debe contener al menos 8 caracteres.</li>"
            "<li>No puede ser una contraseña común.</li>"
            "<li>No puede consistir únicamente en números.</li>"
            "</ul>"
        )
        self.fields["password2"].label = "Confirmación de contraseña"
        self.fields["password2"].help_text = "Ingrese la misma contraseña que antes, para verificación."

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if email:
            return email.lower()
        return email


class LibroForm(forms.ModelForm):
    class Meta:
        model = Libro
        fields = ('titulo', 'descripcion', 'categoria', 'precio', 'portada')
        widgets = {
            'titulo': forms.TextInput(attrs={
                'id': 'titulo',
                'placeholder': 'Escribe el título de tu libro...',
                'maxlength': 80,
            }),
            'descripcion': forms.Textarea(attrs={
                'id': 'descripcion',
                'placeholder': 'Escribe la sinopsis o la historia completa de tu libro...',
                'maxlength': 20000,
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

        if len(portada.name) > 255:
            raise forms.ValidationError(
                'El nombre de la portada es demasiado largo. Cambia el nombre del archivo e inténtalo de nuevo.'
            )

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
