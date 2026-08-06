from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    mrn = serializers.CharField(
        source='medical_record_number', required=False, allow_blank=True, allow_null=True
    )
    doctor_name = serializers.CharField(source='doctor.username', read_only=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'mrn', 'full_name', 'first_name', 'last_name', 'date_of_birth',
            'gender', 'phone', 'email', 'address', 'emergency_contact', 'blood_group',
            'doctor', 'doctor_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'doctor', 'doctor_name', 'created_at', 'updated_at']

    @staticmethod
    def _apply_full_name(validated_data):
        full_name = validated_data.pop('full_name', None)
        if full_name:
            parts = full_name.strip().split(None, 1)
            validated_data['first_name'] = parts[0]
            validated_data['last_name'] = parts[1] if len(parts) > 1 else ''
        return validated_data

    @staticmethod
    def _generate_unique_mrn():
        import random

        while True:
            candidate = f'MRN-{random.randint(10000, 99999)}'
            if not Patient.objects.filter(medical_record_number=candidate).exists():
                return candidate

    def validate(self, attrs):
        if not self.partial and not attrs.get('full_name') and not attrs.get('first_name'):
            raise serializers.ValidationError({'full_name': 'Patient name is required.'})
        return attrs

    def create(self, validated_data):
        validated_data = self._apply_full_name(validated_data)
        mrn = validated_data.get('medical_record_number')
        if not mrn or Patient.objects.filter(medical_record_number=mrn).exists():
            validated_data['medical_record_number'] = self._generate_unique_mrn()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._apply_full_name(validated_data)
        mrn = validated_data.get('medical_record_number')
        if mrn and Patient.objects.filter(medical_record_number=mrn).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError({'mrn': 'A patient with this MRN already exists.'})
        return super().update(instance, validated_data)
