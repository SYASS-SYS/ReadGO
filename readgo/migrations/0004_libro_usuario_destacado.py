from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('readgo', '0003_libro_portada'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.AddField(
            model_name='libro', name='usuario',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='libros_publicados', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='libro', name='destacado', field=models.BooleanField(default=False),
        ),
    ]
