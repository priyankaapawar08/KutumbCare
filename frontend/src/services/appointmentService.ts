import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const addAppointment = async (appointmentData: any) => {
  try {
    console.log('🟡 [APPOINTMENT SERVICE] Sending data:', appointmentData);
    
    const response = await axios.post(
      `${API_URL}/appointments`,
      appointmentData,
      { headers: getAuthHeaders() }
    );
    
    console.log('✅ [APPOINTMENT SERVICE] Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [APPOINTMENT SERVICE] Error:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// ADD THIS FUNCTION
export const getAppointments = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/appointments`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    throw error.response?.data || error;
  }
};

// ADD THIS FUNCTION (optional - for getting appointments by member)
export const getAppointmentsByMember = async (memberId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/appointments/member/${memberId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    throw error.response?.data || error;
  }
};

// ADD THIS FUNCTION (optional - for deleting appointments)
export const deleteAppointment = async (appointmentId: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/appointments/${appointmentId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    throw error.response?.data || error;
  }
};

// ADD THIS FUNCTION (optional - for updating appointment status)
export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  try {
    const response = await axios.patch(
      `${API_URL}/appointments/${appointmentId}/status`,
      { status },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    throw error.response?.data || error;
  }
};