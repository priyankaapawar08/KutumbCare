import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const getAppointments = async () => {
  const res = await axios.get(`${API_URL}/appointments`, { headers: getAuthHeaders() });
  return res.data.appointments || [];
};

export const addAppointment = async (data: any) => {
  const res = await axios.post(`${API_URL}/appointments`, data, { headers: getAuthHeaders() });
  return res.data; // 👈 return full response instead of just res.data.appointment
};

export const deleteAppointment = async (id: string) => {
  const res = await axios.delete(`${API_URL}/appointments/${id}`, { headers: getAuthHeaders() });
  return res.data;
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  const res = await axios.patch(`${API_URL}/appointments/${id}/status`, { status }, { headers: getAuthHeaders() });
  return res.data.appointment;
};

export const getAppointmentsByMember = async (memberId: string) => {
  const res = await axios.get(`${API_URL}/appointments/member/${memberId}`, { headers: getAuthHeaders() });
  return res.data.appointments || [];
};