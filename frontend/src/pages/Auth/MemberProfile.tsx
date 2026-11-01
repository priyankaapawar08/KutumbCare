import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFamilyMembers, FamilyMember, deleteFamilyMember } from "../../services/familyService";
import { getVitalsByMember, deleteVitalSign, VitalSign } from "../../services/vitalsService";
import { getMedicationsByMember, deleteMedication } from "../../services/medicationService";
import { getAppointmentsByMember } from "../../services/appointmentService";

export default function MemberProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'medications' | 'appointments' | 'documents'>('overview');

  useEffect(() => {
    loadMemberData();
  }, [memberId]);

  const loadMemberData = async () => {
    try {
      const membersData = await getFamilyMembers();
      if (membersData.success && membersData.members) {
        const foundMember = membersData.members.find((m: FamilyMember) => m._id === memberId);
        setMember(foundMember || null);
        if (foundMember) {
          loadVitals();
          loadMedications();
          loadAppointments();
          loadDocuments();
        }
      }
    } catch (error) {
      console.error("Failed to load member:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadVitals = async () => {
    if (!memberId) return;
    try {
      setLoadingVitals(true);
      const vitalsData = await getVitalsByMember(memberId);
      if (vitalsData.success && vitalsData.vitals) setVitals(vitalsData.vitals);
    } catch (error) {
      console.error("Failed to load vitals:", error);
    } finally {
      setLoadingVitals(false);
    }
  };

  const loadMedications = async () => {
    if (!memberId) return;
    try {
      setLoadingMedications(true);
      const medsData = await getMedicationsByMember(memberId);
      if (medsData.success && medsData.medications) setMedications(medsData.medications);
    } catch (error) {
      console.error("Failed to load medications:", error);
    } finally {
      setLoadingMedications(false);
    }
  };

  const loadAppointments = async () => {
    if (!memberId) return;
    try {
      setLoadingAppointments(true);
      const data = await getAppointmentsByMember(memberId);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadDocuments = async () => {
    if (!memberId) return;
    try {
      setLoadingDocuments(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/documents/member/${memberId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDelete = async () => {
    if (!member) return;
    const confirmed = window.confirm(`⚠️ Are you sure you want to delete ${member.name}?\n\nThis action cannot be undone.`);
    if (!confirmed) return;
    try {
      setLoading(true);
      const result = await deleteFamilyMember(member._id);
      if (result.success) {
        alert(`✅ ${member.name} has been deleted successfully`);
        navigate("/dashboard");
      } else {
        throw new Error(result.error || 'Failed to delete member');
      }
    } catch (error: any) {
      alert('❌ Failed to delete member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVital = async (vitalId: string) => {
    const confirmed = window.confirm('⚠️ Are you sure you want to delete this vital record?');
    if (!confirmed) return;
    try {
      const result = await deleteVitalSign(vitalId);
      if (result.success) { alert('✅ Vital record deleted successfully'); loadVitals(); }
      else throw new Error(result.error);
    } catch (error: any) {
      alert('❌ Failed to delete: ' + error.message);
    }
  };

  const handleDeleteMedication = async (medicationId: string, medName: string) => {
    const confirmed = window.confirm(`⚠️ Are you sure you want to delete "${medName}"?`);
    if (!confirmed) return;
    try {
      const result = await deleteMedication(medicationId);
      if (result.success) { alert('✅ Medication deleted successfully'); loadMedications(); }
      else throw new Error(result.error);
    } catch (error: any) {
      alert('❌ Failed to delete: ' + error.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'lab_report': 'Lab Report', 'prescription': 'Prescription',
      'xray': 'X-Ray', 'scan': 'Scan (CT/MRI)',
      'insurance': 'Insurance', 'bill': 'Bill/Receipt', 'other': 'Other'
    };
    return labels[type] || type;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('doc')) return '📝';
    return '📎';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Member Not Found</h2>
          <p className="text-gray-600 mb-6">The requested member profile could not be found.</p>
          <button onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-800">📄 {previewTitle}</h3>
              <button
                onClick={() => { setPreviewUrl(null); setPreviewType(''); setPreviewTitle(''); }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >✕</button>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-2xl">
              {previewType === 'application/pdf' ? (
                <iframe
                  src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(previewUrl)}`}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              ) : (
                <img src={previewUrl} alt="Document" className="w-full h-full object-contain p-4" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-gray-700 transition-colors font-medium">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Member Profile</h1>
              <p className="text-sm text-gray-500">View and manage health information</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{member.name}</h1>
                <p className="text-blue-100 text-lg capitalize">{member.relation}</p>
                <div className="flex items-center space-x-4 mt-2 text-blue-100">
                  <span>{member.age} years</span>
                  <span>•</span>
                  <span className="capitalize">{member.gender}</span>
                  {member.bloodGroup && member.bloodGroup !== 'unknown' && (
                    <><span>•</span><span>Blood: {member.bloodGroup}</span></>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex space-x-6 px-8 overflow-x-auto">
              <button onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                📋 Overview
              </button>
              <button onClick={() => setActiveTab('vitals')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'vitals' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                ❤️ Vitals ({vitals.length})
              </button>
              <button onClick={() => setActiveTab('medications')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'medications' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                💊 Medications ({medications.length})
              </button>
              <button onClick={() => setActiveTab('appointments')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'appointments' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                📅 Appointments ({appointments.length})
              </button>
              <button onClick={() => setActiveTab('documents')}
                className={`py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                📄 Documents ({documents.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-600">Full Name</label><p className="mt-1 text-lg text-gray-900">{member.name}</p></div>
                    <div><label className="block text-sm font-medium text-gray-600">Relationship</label><p className="mt-1 text-lg text-gray-900 capitalize">{member.relation}</p></div>
                    <div><label className="block text-sm font-medium text-gray-600">Age</label><p className="mt-1 text-lg text-gray-900">{member.age} years</p></div>
                    <div><label className="block text-sm font-medium text-gray-600">Gender</label><p className="mt-1 text-lg text-gray-900 capitalize">{member.gender}</p></div>
                    {member.bloodGroup && member.bloodGroup !== 'unknown' && (
                      <div><label className="block text-sm font-medium text-gray-600">Blood Group</label><p className="mt-1 text-lg text-gray-900">{member.bloodGroup}</p></div>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Health Summary</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm text-gray-600">Vital Signs</p><p className="text-2xl font-bold text-gray-900">{vitals.length}</p></div>
                        <span className="text-3xl">❤️</span>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm text-gray-600">Medications</p><p className="text-2xl font-bold text-gray-900">{medications.length}</p></div>
                        <span className="text-3xl">💊</span>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm text-gray-600">Appointments</p><p className="text-2xl font-bold text-gray-900">{appointments.length}</p></div>
                        <span className="text-3xl">📅</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div><p className="text-sm text-gray-600">Documents</p><p className="text-2xl font-bold text-gray-900">{documents.length}</p></div>
                        <span className="text-3xl">📄</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Vital Signs History</h3>
                  <button onClick={() => navigate("/dashboard")} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">➕ Add Vital</button>
                </div>
                {loadingVitals ? (
                  <div className="text-center py-12"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-gray-600">Loading vitals...</p></div>
                ) : vitals.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4 opacity-30">📊</div>
                    <p className="text-gray-500 text-lg">No vital signs recorded yet</p>
                    <button onClick={() => navigate("/dashboard")} className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">Add First Vital</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {vitals.map((vital: any) => (
                      <div key={vital._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-red-300 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                                {vital.vitalType === 'blood_pressure' ? '💓' : vital.vitalType === 'temperature' ? '🌡️' : vital.vitalType === 'weight' ? '⚖️' : vital.vitalType === 'heart_rate' ? '💗' : vital.vitalType === 'blood_sugar' ? '🩸' : vital.vitalType === 'oxygen_level' ? '🫁' : '📊'}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg capitalize">{vital.vitalType.replace(/_/g, ' ')}</h4>
                                <p className="text-sm text-gray-500">📅 {new Date(vital.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • 🕐 {vital.time}</p>
                              </div>
                            </div>
                            <div className="ml-14 bg-gray-50 p-3 rounded-lg">
                              <p className="text-2xl font-bold text-gray-900">
                                {vital.value.systolic && vital.value.diastolic ? `${vital.value.systolic}/${vital.value.diastolic} ${vital.value.unit}` : `${vital.value.measurement} ${vital.value.unit}`}
                              </p>
                              {vital.notes && <p className="text-sm text-gray-600 mt-2 italic">📝 {vital.notes}</p>}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteVital(vital._id)} className="text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-lg transition-all border-2 border-red-200 hover:border-red-600">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === 'medications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Medications</h3>
                  <button onClick={() => navigate("/dashboard")} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">➕ Add Medication</button>
                </div>
                {loadingMedications ? (
                  <div className="text-center py-12"><div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-gray-600">Loading medications...</p></div>
                ) : medications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4 opacity-30">💊</div>
                    <p className="text-gray-500 text-lg">No medications recorded yet</p>
                    <button onClick={() => navigate("/dashboard")} className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">Add First Medication</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {medications.map((med: any) => (
                      <div key={med._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">💊</div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">{med.medicationName}</h4>
                                <p className="text-sm text-gray-500">{med.dosage} • {med.frequency.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                              </div>
                              {med.isActive && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">Active</span>}
                            </div>
                            <div className="ml-14 space-y-2 text-sm">
                              <p><span className="text-gray-600">📅 Start:</span> <span className="font-medium">{new Date(med.startDate).toLocaleDateString()}</span></p>
                              {med.endDate && <p><span className="text-gray-600">📅 End:</span> <span className="font-medium">{new Date(med.endDate).toLocaleDateString()}</span></p>}
                              {med.prescribedBy && <p><span className="text-gray-600">👨‍⚕️ Doctor:</span> <span className="font-medium">{med.prescribedBy}</span></p>}
                              {med.purpose && <p><span className="text-gray-600">💡 Purpose:</span> <span className="font-medium">{med.purpose}</span></p>}
                              {med.notes && <p className="italic text-gray-600 mt-2">📝 {med.notes}</p>}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteMedication(med._id, med.medicationName)} className="text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-lg transition-all border-2 border-red-200 hover:border-red-600">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Appointments</h3>
                  <button onClick={() => navigate("/dashboard")} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">➕ Schedule Appointment</button>
                </div>
                {loadingAppointments ? (
                  <div className="text-center py-12"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-gray-600">Loading appointments...</p></div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4 opacity-30">📅</div>
                    <p className="text-gray-500 text-lg">No appointments scheduled yet</p>
                    <button onClick={() => navigate("/dashboard")} className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">Schedule First Appointment</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {appointments.map((apt: any) => (
                      <div key={apt._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">📅</div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">{apt.title}</h4>
                                {apt.doctor && <p className="text-sm text-gray-500">👨‍⚕️ Dr. {apt.doctor}</p>}
                              </div>
                            </div>
                            <div className="ml-14 space-y-1 text-sm">
                              <p><span className="text-gray-600">📅 Date:</span> <span className="font-medium">{new Date(apt.date).toLocaleDateString()}</span></p>
                              <p><span className="text-gray-600">🕐 Time:</span> <span className="font-medium">{apt.time}</span></p>
                              {apt.location && <p><span className="text-gray-600">📍 Location:</span> <span className="font-medium">{apt.location}</span></p>}
                              {apt.notes && <p><span className="text-gray-600">📝 Notes:</span> <span className="font-medium">{apt.notes}</span></p>}
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : apt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Documents</h3>
                  <button onClick={() => navigate("/dashboard")} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">➕ Upload Document</button>
                </div>
                {loadingDocuments ? (
                  <div className="text-center py-12"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-gray-600">Loading documents...</p></div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4 opacity-30">📄</div>
                    <p className="text-gray-500 text-lg">No documents uploaded yet</p>
                    <button onClick={() => navigate("/dashboard")} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Upload First Document</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc: any) => (
                      <div key={doc._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="text-4xl">{getFileIcon(doc.fileType)}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{doc.title}</h4>
                            <p className="text-xs text-gray-500">{getDocumentTypeLabel(doc.documentType)}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                          <p><span className="font-medium">📅 Date:</span> {new Date(doc.documentDate).toLocaleDateString()}</p>
                          <p><span className="font-medium">📦 Size:</span> {formatFileSize(doc.fileSize)}</p>
                          {doc.description && <p className="text-xs italic">{doc.description}</p>}
                        </div>
                        <button
                          onClick={() => {
                            setPreviewUrl(doc.fileUrl);
                            setPreviewType(doc.fileType);
                            setPreviewTitle(doc.title);
                          }}
                          className="w-full bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                        >
                          <span>👁️</span><span>View Document</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Quick Actions Footer */}
          <div className="bg-gray-50 p-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate("/dashboard")} className="p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-center">
                <div className="text-2xl mb-2">❤️</div><p className="text-sm font-medium">Add Vital</p>
              </button>
              <button onClick={() => navigate("/dashboard")} className="p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center">
                <div className="text-2xl mb-2">💊</div><p className="text-sm font-medium">Add Medication</p>
              </button>
              <button onClick={() => navigate("/dashboard")} className="p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-center">
                <div className="text-2xl mb-2">📅</div><p className="text-sm font-medium">Schedule Appointment</p>
              </button>
              <button onClick={handleDelete} disabled={loading} className="p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="text-2xl mb-2">🗑️</div><p className="text-sm font-medium">{loading ? 'Deleting...' : 'Delete Member'}</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}