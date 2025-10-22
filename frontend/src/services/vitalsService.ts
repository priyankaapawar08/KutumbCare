import api from './api';

export interface VitalSign {
  _id?: string;
  memberId: string;
  userId?: string;
  vitalType: 'blood_pressure' | 'blood_sugar' | 'temperature' | 'weight' | 'height' | 'heart_rate' | 'oxygen_level' | 'bmi' | 'respiratory_rate';
  value: {
    systolic?: number;
    diastolic?: number;
    measurement?: number;
    unit: string;
  };
  date: Date | string;
  time: string;
  notes?: string;
  recordedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VitalsResponse {
  success: boolean;
  count?: number;
  vitals?: VitalSign[];
  vital?: VitalSign;
  message?: string;
  error?: string;
}

// Get all vitals for a member
export const getVitalsByMember = async (memberId: string): Promise<VitalsResponse> => {
  try {
    console.log('🟡 [SERVICE] Fetching vitals for member:', memberId);
    const response = await api.get(`/vitals/member/${memberId}`);
    console.log('✅ [SERVICE] Vitals response:', response.data);
    
    return {
      success: true,
      count: response.data.count,
      vitals: response.data.vitals
    };
  } catch (error: any) {
    console.error('❌ [SERVICE] Get vitals error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get vitals by type
export const getVitalsByType = async (memberId: string, vitalType: string): Promise<VitalsResponse> => {
  try {
    const response = await api.get(`/vitals/member/${memberId}/type/${vitalType}`);
    
    return {
      success: true,
      count: response.data.count,
      vitals: response.data.vitals
    };
  } catch (error: any) {
    console.error('❌ Get vitals by type error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Add new vital sign
export const addVitalSign = async (vitalData: Partial<VitalSign>): Promise<VitalsResponse> => {
  try {
    console.log('🟡 [SERVICE] Adding vital sign:', vitalData);
    
    // Format the data properly
    const formattedData = {
      memberId: vitalData.memberId,
      vitalType: vitalData.vitalType,
      value: vitalData.value,
      date: vitalData.date || new Date().toISOString(),
      time: vitalData.time || new Date().toTimeString().slice(0, 5),
      notes: vitalData.notes || ''
    };

    console.log('🟡 [SERVICE] Formatted data:', formattedData);
    
    const response = await api.post('/vitals', formattedData);
    console.log('✅ [SERVICE] Vital added:', response.data);
    
    return {
      success: true,
      vital: response.data.vital,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('❌ [SERVICE] Add vital error:', error);
    console.error('❌ [SERVICE] Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Update vital sign
export const updateVitalSign = async (vitalId: string, vitalData: Partial<VitalSign>): Promise<VitalsResponse> => {
  try {
    const response = await api.put(`/vitals/${vitalId}`, vitalData);
    
    return {
      success: true,
      vital: response.data.vital,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('❌ Update vital error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Delete vital sign
export const deleteVitalSign = async (vitalId: string): Promise<VitalsResponse> => {
  try {
    const response = await api.delete(`/vitals/${vitalId}`);
    
    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('❌ Delete vital error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get vital trends
export const getVitalTrends = async (memberId: string, vitalType: string, days: number = 30): Promise<VitalsResponse> => {
  try {
    const response = await api.get(`/vitals/trends/${memberId}/${vitalType}?days=${days}`);
    
    return {
      success: true,
      count: response.data.count,
      vitals: response.data.trends
    };
  } catch (error: any) {
    console.error('❌ Get trends error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};