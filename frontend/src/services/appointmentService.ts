// src/services/appointmentService.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export interface Appointment {
  _id?: string;
  memberId: string;
  title: string;
  doctor: string;
  date: Date;
  time: string;
  location?: string;
  notes?: string;
}

export async function addAppointment(appointmentData: Omit<Appointment, '_id'>) {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to add appointment");
  }
}