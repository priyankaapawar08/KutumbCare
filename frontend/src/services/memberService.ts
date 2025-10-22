import api from './api';

export interface DeleteMemberResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const deleteFamilyMember = async (memberId: string): Promise<DeleteMemberResponse> => {
  try {
    const response = await api.delete(`/members/${memberId}`);
    return {
      success: true,
      message: response.data.message || 'Member deleted successfully'
    };
  } catch (error: any) {
    console.error('Delete member error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete member'
    };
  }
};