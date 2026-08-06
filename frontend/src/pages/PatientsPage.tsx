import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Patient } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  FileText,
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Patient Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('1985-04-12');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [patients, searchTerm, genderFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const openAddModal = () => {
    setEditingPatient(null);
    setFullName('');
    setDob('1990-05-20');
    setGender('Female');
    setPhone('+1 (555) 321-9876');
    setEmail('');
    setAddress('123 Medical Center Way');
    setEmergencyContact('Spouse - +1 (555) 888-7777');
    setBloodGroup('O+');
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setFullName(patient.full_name);
    setDob(patient.date_of_birth);
    setGender(patient.gender);
    setPhone(patient.phone);
    setEmail(patient.email);
    setAddress(patient.address);
    setEmergencyContact(patient.emergency_contact);
    setBloodGroup(patient.blood_group);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showError('Patient Full Name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, {
          full_name: fullName,
          date_of_birth: dob,
          gender,
          phone,
          email,
          address,
          emergency_contact: emergencyContact,
          blood_group: bloodGroup,
        });
        showSuccess(`Updated patient profile for ${fullName}`);
      } else {
        const created = await addPatient({
          full_name: fullName,
          date_of_birth: dob,
          gender,
          phone,
          email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          address,
          emergency_contact: emergencyContact,
          blood_group: bloodGroup,
        });
        showSuccess(`Added new patient ${created.full_name} (${created.mrn})`);
      }
      setIsModalOpen(false);
    } catch {
      showError('Failed to save patient record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;
    try {
      await deletePatient(deleteModalId);
      showSuccess('Patient record deleted successfully');
      setDeleteModalId(null);
    } catch {
      showError('Failed to delete patient');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#2F5496]" />
            <span>Patients Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, manage, and view clinical history of registered patients
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold"
        >
          Add Patient
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, MRN, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#2F5496] focus:ring-2 focus:ring-[#2F5496]/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Gender:</span>
          </div>
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#2F5496]"
          >
            <option value="ALL">All Genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 w-12">#</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">MRN</th>
                <th className="px-5 py-3.5">Gender</th>
                <th className="px-5 py-3.5">Date of Birth</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((p, idx) => {
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4 text-xs font-medium text-slate-400">{rowNumber}</td>
                      <td
                        onClick={() => navigate(`/patients/${p.id}`)}
                        className="px-5 py-4 font-bold text-slate-900 group-hover:text-[#2F5496]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2F5496] font-extrabold text-xs flex items-center justify-center shrink-0">
                            {p.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="leading-tight">{p.full_name}</p>
                            <p className="text-[11px] font-normal text-slate-400">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                        {p.mrn}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.gender === 'Female'
                              ? 'bg-purple-50 text-purple-700'
                              : p.gender === 'Male'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.gender}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{p.date_of_birth}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{p.phone}</td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/patients/${p.id}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#2F5496] transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(p);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition-colors"
                          title="Edit Patient"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModalId(p.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserPlus className="w-10 h-10 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">No Patients Found</p>
                      <p className="text-xs">Try adjusting your search query or gender filter.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openAddModal}
                        className="mt-2"
                      >
                        Create New Patient
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredPatients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} patients
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="font-bold text-slate-800 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? 'Edit Patient Record' : 'Register New Patient'}
        subtitle={editingPatient ? `Updating MRN: ${editingPatient.mrn}` : 'Enter patient clinical demographic information'}
        maxWidth="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Eleanor Vance"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#2F5496] focus:ring-2 focus:ring-[#2F5496]/20 focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#2F5496] focus:ring-2 focus:ring-[#2F5496]/20 focus:outline-none"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+1 (555) 234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Input
            label="Residential Address"
            placeholder="Street address, City, State, ZIP"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Emergency Contact"
            placeholder="Name (Relationship) - Phone number"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              {editingPatient ? 'Save Changes' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        title="Delete Patient Record?"
        subtitle="This action cannot be undone."
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to permanently remove this patient record? Associated report history will remain archived for compliance.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Yes, Delete Record
          </Button>
        </div>
      </Modal>
    </div>
  );
};
