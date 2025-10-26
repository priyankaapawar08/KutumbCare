import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`
  };
};

export const uploadDocument = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${API_URL}/documents/upload`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw error.response?.data || error;
  }
};

export const getDocumentsByMember = async (memberId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/documents/member/${memberId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Fetch error:', error);
    throw error.response?.data || error;
  }
};

export const getAllFamilyDocuments = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/documents/family`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Fetch error:', error);
    throw error.response?.data || error;
  }
};

export const deleteDocument = async (documentId: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/documents/${documentId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Delete error:', error);
    throw error.response?.data || error;
  }
};