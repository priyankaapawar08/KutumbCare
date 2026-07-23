// Create this file: frontend/src/components/MedicationsSection.tsx

import { useState } from 'react';
import { getMedicationsByMember, deleteMedication } from '../services/medicationService';

interface FamilyMember {
  _id: string;
  name: string;
  relation: string;
  age: number;
}

interface MedicationsSectionProps {
  familyMembers: FamilyMember[];
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export default function MedicationsSection({ 
  familyMembers, 
  showAddForm, 
  setShowAddForm, 
  setActiveTab 
}: MedicationsSectionProps) {
  const [medicationsData, setMedicationsData] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [loadingMeds, setLoadingMeds] = useState(false);

  const loadMedications = async (memberId: string) => {
    try {
      setLoadingMeds(true);
      console.log('🟡 [DASHBOARD] Loading medications for member:', memberId);
      const response = await getMedicationsByMember(memberId);
      console.log('✅ [DASHBOARD] Medications response:', response);
      if (response.success) {
        setMedicationsData(response.medications || []);
      } else {
        console.error('❌ Failed to load medications:', response.error);
        setMedicationsData([]);
      }
    } catch (error) {
      console.error('❌ Error loading medications:', error);
      setMedicationsData([]);
    } finally {
      setLoadingMeds(false);
    }
  };

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    console.log('🟡 Selected member:', memberId);
    
    if (!memberId) {
      setSelectedMember('');
      setSelectedMemberName('');
      setMedicationsData([]);
      return;
    }

    setSelectedMember(memberId);
    const member = familyMembers.find((m: FamilyMember) => m._id === memberId);
    if (member) {
      setSelectedMemberName(member.name);
    }
    
    loadMedications(memberId);
  };

  const handleDeleteMedication = async (medicationId: string, medName: string) => {
    const confirmed = window.confirm(`⚠️ Are you sure you want to delete "${medName}"?`);
    if (!confirmed) return;

    try {
      const result = await deleteMedication(medicationId);
      if (result.success) {
        alert('✅ Medication deleted successfully');
        if (selectedMember) {
          loadMedications(selectedMember);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      alert('❌ Failed to delete: ' + error.message);
    }
  };

  const formatFrequency = (freq: string) => {
    return freq.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTiming = (timing: string[]) => {
    if (!timing || timing.length === 0) return 'Not specified';
    return timing.map(t => t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {familyMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">💊</div>
          <p className="text-gray-500 text-lg">Add family members first to manage medications</p>
          <button
            onClick={() => setActiveTab("members")}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Family Members
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Medication Management</h2>
            <p className="text-gray-600 text-sm">Track medications for your family members</p>
          </div>

          {!showAddForm && (
            <div className="mb-6 bg-gray-50 p-4 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                💊 Select Family Member
              </label>
              <select
                value={selectedMember}
                onChange={handleMemberSelect}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 font-medium cursor-pointer hover:border-green-300 transition-colors"
              >
                <option value="">-- Choose a family member --</option>
                {familyMembers.map((member: FamilyMember) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.relation}, {member.age} years old)
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedMember && !showAddForm ? (
            <div>
              <div className="flex justify-between items-center mb-4 bg-green-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Medications for {selectedMemberName}
                  </h3>
                  <p className="text-sm text-gray-600">{medicationsData.length} medication(s)</p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Add Medication</span>
                </button>
              </div>

              {loadingMeds ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading medications...</p>
                </div>
              ) : medicationsData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4 opacity-30">💊</div>
                  <p className="text-gray-500 text-lg font-medium mb-2">No medications recorded yet</p>
                  <p className="text-gray-400 text-sm mb-6">Start tracking medications for {selectedMemberName}</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Add First Medication
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {medicationsData.map((med: any) => (
                    <div key={med._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                              💊
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{med.medicationName}</h4>
                              <p className="text-sm text-gray-500">{med.dosage} • {formatFrequency(med.frequency)}</p>
                            </div>
                            {med.isActive && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="ml-14 space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">📅 Start:</span>
                                <span className="ml-2 font-medium">{new Date(med.startDate).toLocaleDateString()}</span>
                              </div>
                              {med.endDate && (
                                <div>
                                  <span className="text-gray-600">📅 End:</span>
                                  <span className="ml-2 font-medium">{new Date(med.endDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {med.timing && med.timing.length > 0 && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">🕐 Timing:</span>
                                  <span className="ml-2 font-medium">{formatTiming(med.timing)}</span>
                                </div>
                              )}
                              {med.prescribedBy && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">👨‍⚕️ Doctor:</span>
                                  <span className="ml-2 font-medium">{med.prescribedBy}</span>
                                </div>
                              )}
                              {med.purpose && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">💡 Purpose:</span>
                                  <span className="ml-2 font-medium">{med.purpose}</span>
                                </div>
                              )}
                            </div>
                            {med.instructions && (
                              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">📋 Instructions:</span> {med.instructions}
                                </p>
                              </div>
                            )}
                            {med.notes && (
                              <p className="text-sm text-gray-600 italic mt-2">📝 {med.notes}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMedication(med._id, med.medicationName)}
                          className="text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-lg transition-all ml-4 border-2 border-red-200 hover:border-red-600"
                          title="Delete medication"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !showAddForm ? (
            <div className="text-center py-16 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
              <div className="text-7xl mb-4 opacity-40">💊</div>
              <p className="text-gray-600 text-xl font-medium mb-2">Ready to Track Medications</p>
              <p className="text-gray-500">Select a family member above to view or add medications</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}