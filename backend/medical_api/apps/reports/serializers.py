from rest_framework import serializers
from .models import Transcription, MedicalReport


class SOAPSerializer(serializers.Serializer):
    subjective = serializers.CharField(required=False, allow_blank=True)
    objective = serializers.CharField(required=False, allow_blank=True)
    assessment = serializers.CharField(required=False, allow_blank=True)
    plan = serializers.CharField(required=False, allow_blank=True)


class TranscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transcription
        fields = '__all__'
        read_only_fields = ['id', 'transcript', 'language', 'duration_seconds', 'segments', 'model_used', 'created_at']


class TranscriptionCreateSerializer(serializers.ModelSerializer):
    model_size = serializers.CharField(write_only=True, required=False, default='base')

    class Meta:
        model = Transcription
        fields = ['patient', 'audio_file', 'language', 'model_size']

    def create(self, validated_data):
        validated_data['model_used'] = validated_data.pop('model_size', 'base')
        return super().create(validated_data)


class MedicalReportSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.full_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.username')
    patient_id = serializers.ReadOnlyField(source='patient.id')
    patient_mrn = serializers.ReadOnlyField(source='patient.medical_record_number')
    doctor_id = serializers.ReadOnlyField(source='doctor.id')

    class Meta:
        model = MedicalReport
        fields = '__all__'
        read_only_fields = ['id', 'raw_transcript', 'transcript_segments', 'excel_file', 'created_at', 'updated_at']


class MedicalReportCreateSerializer(serializers.ModelSerializer):
    doctor_name = serializers.ReadOnlyField(source='doctor.username')
    soap = SOAPSerializer(required=False)

    class Meta:
        model = MedicalReport
        fields = ['patient', 'consultation_date', 'report_type', 'subjective', 'objective', 'assessment', 'plan', 'raw_transcript', 'doctor_name', 'soap']

    def create(self, validated_data):
        soap_data = validated_data.pop('soap', None)
        if soap_data:
            validated_data.update(soap_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        soap_data = validated_data.pop('soap', None)
        if soap_data:
            validated_data.update(soap_data)
        return super().update(instance, validated_data)