// Create: frontend/src/services/reminderService.ts

import api from './api';

export interface ReminderLog {
  medicationId: string;
  timing: string;
  takenAt: Date;
  date: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  adherenceRate: number;
  lastTaken?: string;
  totalDoses?: number;
  takenDoses?: number;
}

export interface ReminderResponse {
  success: boolean;
  isTaken?: boolean;
  streak?: Streak;
  message?: string;
  error?: string;
}

// Mark medication as taken
export const markMedicationTaken = async (
  medicationId: string,
  timing: string
): Promise<ReminderResponse> => {
  try {
    const response = await api.post('/reminders/taken', {
      medicationId,
      timing,
      takenAt: new Date()
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error marking medication as taken:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get today's reminders status
export const getTodayReminders = async (
  medicationId: string,
  timing: string
): Promise<ReminderResponse> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/reminders/status/${medicationId}/${timing}/${today}`);

    return {
      success: true,
      isTaken: response.data.isTaken
    };
  } catch (error: any) {
    return {
      success: true,
      isTaken: false
    };
  }
};

// Get medication streak
export const getMedicationStreak = async (
  medicationId: string
): Promise<ReminderResponse> => {
  try {
    const response = await api.get(`/reminders/streak/${medicationId}`);

    return {
      success: true,
      streak: response.data.streak
    };
  } catch (error: any) {
    console.error('Error getting streak:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get reminder history
export const getReminderHistory = async (
  medicationId: string,
  days: number = 30
): Promise<{ success: boolean; history?: ReminderLog[]; error?: string }> => {
  try {
    const response = await api.get(`/reminders/history/${medicationId}?days=${days}`);

    return {
      success: true,
      history: response.data.history
    };
  } catch (error: any) {
    console.error('Error getting reminder history:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};