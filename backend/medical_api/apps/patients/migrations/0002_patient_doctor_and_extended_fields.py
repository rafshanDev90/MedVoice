from django.conf import settings
from django.db import migrations, models


def assign_existing_patients(apps, schema_editor):
    Patient = apps.get_model('patients', 'Patient')
    User = apps.get_model('accounts', 'User')
    doctor = User.objects.order_by('id').first()
    if doctor is not None:
        Patient.objects.filter(doctor_id__isnull=True).update(doctor_id=doctor.id)


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='doctor',
            field=models.ForeignKey(
                null=True,
                on_delete=models.CASCADE,
                related_name='patients',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='patient',
            name='emergency_contact',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='patient',
            name='blood_group',
            field=models.CharField(blank=True, default='', max_length=10),
        ),
        migrations.RunPython(assign_existing_patients, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='patient',
            name='doctor',
            field=models.ForeignKey(
                on_delete=models.CASCADE,
                related_name='patients',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RemoveIndex(
            model_name='patient',
            name='patients_pa_medical_ff50e5_idx',
        ),
        migrations.RemoveIndex(
            model_name='patient',
            name='patients_pa_first_n_a142c0_idx',
        ),
        migrations.AddIndex(
            model_name='patient',
            index=models.Index(
                fields=['doctor', 'medical_record_number'],
                name='patients_pa_doctor_mrn_idx',
            ),
        ),
        migrations.AddIndex(
            model_name='patient',
            index=models.Index(
                fields=['doctor', 'first_name', 'last_name'],
                name='patients_pa_doctor_name_idx',
            ),
        ),
    ]
