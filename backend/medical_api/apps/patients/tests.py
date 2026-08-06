from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from medical_api.apps.patients.models import Patient

User = get_user_model()


class PatientAPITests(APITestCase):
    def setUp(self):
        self.doctor = User.objects.create_user(
            username='dr_test', email='dr.test@medireport.org', password='Pass12345!',
            role='doctor', first_name='Test', last_name='Doctor',
        )
        self.other = User.objects.create_user(
            username='dr_other', email='dr.other@medireport.org', password='Pass12345!',
            role='doctor', first_name='Other', last_name='Doctor',
        )
        self.login_url = '/api/v1/auth/login/'
        self.patients_url = '/api/v1/patients/'
        self.valid_payload = {
            'full_name': 'Eleanor Vance',
            'date_of_birth': '1978-04-12',
            'gender': 'Female',
            'phone': '+1 555 234 5678',
            'email': 'eleanor.vance@example.com',
            'address': '742 Evergreen Terrace',
            'emergency_contact': 'Thomas Vance',
            'blood_group': 'A+',
        }

    def _auth(self, user, password='Pass12345!'):
        res = self.client.post(self.login_url, {'username': user.username, 'password': password})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    def test_anonymous_cannot_access_patients(self):
        self.assertEqual(self.client.get(self.patients_url).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_patient_assigns_doctor_and_mrn(self):
        self._auth(self.doctor)
        res = self.client.post(self.patients_url, self.valid_payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        patient = Patient.objects.get(pk=res.data['id'])
        self.assertEqual(patient.doctor, self.doctor)
        self.assertTrue(patient.medical_record_number.startswith('MRN-'))
        self.assertEqual(patient.first_name, 'Eleanor')
        self.assertEqual(patient.last_name, 'Vance')

    def test_create_patient_requires_name(self):
        self._auth(self.doctor)
        payload = dict(self.valid_payload)
        del payload['full_name']
        res = self.client.post(self.patients_url, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_patients_scoped_to_doctor(self):
        self._auth(self.doctor)
        self.client.post(self.patients_url, self.valid_payload)
        self._auth(self.other)
        res = self.client.get(self.patients_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_doctor_cannot_access_others_patient(self):
        self._auth(self.doctor)
        created = self.client.post(self.patients_url, self.valid_payload).data
        self._auth(self.other)
        self.assertEqual(self.client.get(f'{self.patients_url}{created["id"]}/').status_code, status.HTTP_404_NOT_FOUND)

    def test_update_patient(self):
        self._auth(self.doctor)
        created = self.client.post(self.patients_url, self.valid_payload).data
        res = self.client.patch(
            f'{self.patients_url}{created["id"]}/', {'blood_group': 'B-'}, format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['blood_group'], 'B-')

    def test_delete_patient(self):
        self._auth(self.doctor)
        created = self.client.post(self.patients_url, self.valid_payload).data
        res = self.client.delete(f'{self.patients_url}{created["id"]}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Patient.objects.count(), 0)

    def test_patient_reports_endpoint(self):
        self._auth(self.doctor)
        created = self.client.post(self.patients_url, self.valid_payload).data
        res = self.client.get(f'{self.patients_url}{created["id"]}/reports/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, [])
