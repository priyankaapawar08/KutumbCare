import api from './api';

export interface Medication {
  _id?: string;
  memberId: string;
  userId?: string;
  medicationName: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'thrice_daily' | 'four_times_daily' | 'as_needed' | 'weekly' | 'monthly';
  timing?: string[];
  startDate: Date | string;
  endDate?: Date | string;
  prescribedBy?: string;
  purpose?: string;
  sideEffects?: string[];
  isActive?: boolean;
  reminderEnabled?: boolean;
  instructions?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationsResponse {
  success: boolean;
  count?: number;
  medications?: Medication[];
  medication?: Medication;
  message?: string;
  error?: string;
}

// Get all medications for a member
export const getMedicationsByMember = async (memberId: string): Promise<MedicationsResponse> => {
  try {
    console.log('🟡 [SERVICE] Fetching medications for member:', memberId);
    const response = await api.get(`/medications/member/${memberId}`);
    console.log('✅ [SERVICE] Medications response:', response.data);
    
    return {
      success: true,
      count: response.data.count,
      medications: response.data.medications
    };
  } catch (error: any) {
    console.error('❌ [SERVICE] Get medications error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get active medications
export const getActiveMedications = async (memberId: string): Promise<MedicationsResponse> => {
  try {
    const response = await api.get(`/medications/member/${memberId}/active`);
    
    return {
      success: true,
      count: response.data.count,
      medications: response.data.medications
    };
  } catch (error: any) {
    console.error('❌ Get active medications error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Add new medication
export const addMedication = async (medicationData: Partial<Medication>): Promise<MedicationsResponse> => {
  try {
    console.log('🟡 [SERVICE] Adding medication:', medicationData);
    
    const response = await api.post('/medications', medicationData);
    console.log('✅ [SERVICE] Medication added:', response.data);
    
    return {
      success: true,
      medication: response.data.medication,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('❌ [SERVICE] Add medication error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Update medication
export const updateMedication = async (medicationId: string, medicationData: Partial<Medication>): Promise<MedicationsResponse> => {
  try {
    const response = await api.put(`/medications/${medicationId}`, medicationData);
    
    return {
      success: true,
      medication: response.data.medication,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('❌ Update medication error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Delete medication
export const deleteMedication = async (medicationId: string): Promise<MedicationsResponse> => {
  try {
    const response = await api.delete(`/medications/${medicationId}`);
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('❌ Delete medication error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Toggle medication status
export const toggleMedicationStatus = async (medicationId: string): Promise<MedicationsResponse> => {
  try {
    const response = await api.patch(`/medications/${medicationId}/toggle`);
    
    return {
      success: true,
      medication: response.data.medication,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('❌ Toggle medication error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};