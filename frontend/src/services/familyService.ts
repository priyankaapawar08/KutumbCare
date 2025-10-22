import api from './api';

export interface FamilyMember {
  _id: string;  // ← Make sure this exists!
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  relation: string;
  bloodGroup?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FamilyMembersResponse {
  success: boolean;
  count: number;
  members: FamilyMember[];
  error?: string;
}

export const getFamilyMembers = async (): Promise<FamilyMembersResponse> => {
  try {
    console.log('🟡 [SERVICE] Fetching family members...');
    const response = await api.get('/members');
    console.log('✅ [SERVICE] Response:', response.data);
    
    return {
      success: true,
      count: response.data.count || 0,
      members: response.data.members || []
    };
  } catch (error: any) {
    console.error('❌ [SERVICE] Error fetching members:', error);
    return {
      success: false,
      count: 0,
      members: [],
      error: error.response?.data?.error || error.message
    };
  }
};

export const addFamilyMember = async (memberData: Partial<FamilyMember>) => {
  try {
    console.log('🟡 [SERVICE] Adding member:', memberData);
    const response = await api.post('/members', memberData);
    console.log('✅ [SERVICE] Member added:', response.data);
    
    return {
      success: true,
      member: response.data.member,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('❌ [SERVICE] Error adding member:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

export const getUserFamily = async () => {
  try {
    const response = await api.get('/families');
    return response.data;
  } catch (error: any) {
    console.error('Get family error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

export const createFamily = async (familyName: string) => {
  try {
    const response = await api.post('/families', { familyName });
    return response.data;
  } catch (error: any) {
    console.error('Create family error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Add delete function here
export const deleteFamilyMember = async (memberId: string) => {
  try {
    console.log('🟡 [SERVICE] Deleting member:', memberId);
    const response = await api.delete(`/members/${memberId}`);
    console.log('✅ [SERVICE] Member deleted:', response.data);
    
    return {
      success: true,
      message: response.data.message || 'Member deleted successfully'
    };
  } catch (error: any) {
    console.error('❌ [SERVICE] Delete error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};