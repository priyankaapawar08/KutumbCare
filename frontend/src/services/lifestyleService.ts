import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`
  };
};

export const predictLifestyle = async (data: {
  sex: string;
  diet: string;
  activity: string;
  addiction: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/lifestyle/predict`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Prediction error:', error);
    throw error.response?.data || error;
  }
};