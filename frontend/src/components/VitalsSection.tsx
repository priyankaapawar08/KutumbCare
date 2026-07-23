// Create this as a NEW FILE: src/components/VitalsSection.tsx

import { useState } from 'react';
import { getVitalsByMember, deleteVitalSign } from '../services/vitalsService';

interface VitalsSectionProps {
  familyMembers: any[];
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export default function VitalsSection({ 
  familyMembers, 
  showAddForm, 
  setShowAddForm, 
  setActiveTab 
}: VitalsSectionProps) {
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [loadingVitals, setLoadingVitals] = useState(false);

  const loadVitals = async (memberId: string) => {
    try {
      setLoadingVitals(true);
      console.log('🟡 Loading vitals for member:', memberId);
      const response = await getVitalsByMember(memberId);
      console.log('✅ Vitals response:', response);
      if (response.success) {
        setVitalsData(response.vitals || []);
      } else {
        console.error('❌ Failed to load vitals:', response.error);
        setVitalsData([]);
      }
    } catch (error) {
      console.error('❌ Error loading vitals:', error);
      setVitalsData([]);
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    console.log("✅ Selected member ID:", memberId);

    const member = familyMembers.find((m: any) => m._id === memberId);
    const memberName = member?.name || '';
    
    console.log("✅ Selected member name:", memberName);

    setSelectedMember(memberId);
    setSelectedMemberName(memberName);

    if (memberId) {
      loadVitals(memberId);
    } else {
      setVitalsData([]);
    }
  };

  const handleDeleteVital = async (vitalId: string) => {
    const confirmed = window.confirm('⚠️ Are you sure you want to delete this vital record?\n\nThis action cannot be undone.');
    if (!confirmed) return;

    try {
      const result = await deleteVitalSign(vitalId);
      if (result.success) {
        alert('✅ Vital record deleted successfully');
        if (selectedMember) {
          loadVitals(selectedMember);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      alert('❌ Failed to delete: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {familyMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">❤️</div>
          <p className="text-gray-500 text-lg">Add family members first to record vital signs</p>
          <button
            onClick={() => setActiveTab("members")}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Family Members
          </button>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Vital Signs Tracking</h2>
            <p className="text-gray-600 text-sm">Monitor health metrics for your family members</p>
          </div>

          {/* Member Selection */}
          {!showAddForm && (
            <div className="mb-6 bg-gray-50 p-4 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📊 Select Family Member
              </label>
              <select
                value={selectedMember}
                onChange={handleMemberSelect}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none transition-colors bg-white cursor-pointer"
              >
                <option value="">-- Choose a family member to view vitals --</option>
                {familyMembers.map((member: any) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Vitals List */}
          {selectedMember && !showAddForm ? (
            <div>
              <div className="flex justify-between items-center mb-4 bg-red-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Vital Signs for {selectedMemberName}
                  </h3>
                  <p className="text-sm text-gray-600">{vitalsData.length} record(s) found</p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Add Vital</span>
                </button>
              </div>

              {loadingVitals ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading vitals...</p>
                </div>
              ) : vitalsData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4 opacity-30">📊</div>
                  <p className="text-gray-500 text-lg font-medium mb-2">No vital signs recorded yet</p>
                  <p className="text-gray-400 text-sm mb-6">Start tracking health metrics for {selectedMemberName}</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold inline-flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Add First Vital</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {vitalsData.map((vital: any) => (
                    <div key={vital._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-red-300 transition-all bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                              {vital.vitalType === 'blood_pressure' ? '💓' :
                               vital.vitalType === 'temperature' ? '🌡️' :
                               vital.vitalType === 'weight' ? '⚖️' :
                               vital.vitalType === 'heart_rate' ? '💗' :
                               vital.vitalType === 'blood_sugar' ? '🩸' :
                               vital.vitalType === 'oxygen_level' ? '🫁' :
                               vital.vitalType === 'height' ? '📏' :
                               vital.vitalType === 'bmi' ? '📊' : '📈'}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg capitalize">
                                {vital.vitalType.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-sm text-gray-500 flex items-center space-x-2">
                                <span>📅 {new Date(vital.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}</span>
                                <span>•</span>
                                <span>🕐 {vital.time}</span>
                              </p>
                            </div>
                          </div>
                          <div className="ml-14 bg-gray-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">
                              {vital.value.systolic && vital.value.diastolic
                                ? `${vital.value.systolic}/${vital.value.diastolic} ${vital.value.unit}`
                                : `${vital.value.measurement} ${vital.value.unit}`
                              }
                            </p>
                            {vital.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                📝 {vital.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteVital(vital._id)}
                          className="text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-lg transition-all ml-4 border-2 border-red-200 hover:border-red-600"
                          title="Delete vital record"
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
            <div className="text-center py-16 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
              <div className="text-7xl mb-4 opacity-40">❤️</div>
              <p className="text-gray-600 text-xl font-medium mb-2">Ready to Track Health</p>
              <p className="text-gray-500">Select a family member above to view or add vital signs</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}