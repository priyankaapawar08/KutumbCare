// Create: frontend/src/components/MedicationReminders.tsx

import { useState, useEffect } from 'react';
import { getMedicationsByMember } from '../services/medicationService';
import { 
  markMedicationTaken, 
  getTodayReminders, 
  getMedicationStreak 
} from '../services/reminderService';

interface Reminder {
  medicationId: string;
  medicationName: string;
  dosage: string;
  timing: string;
  timeInMinutes: number;
  isTaken: boolean;
  memberId: string;
  memberName: string;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  adherenceRate: number;
  lastTaken?: string;
}

export default function MedicationReminders({ familyMembers }: any) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [streaks, setStreaks] = useState<{ [key: string]: Streak }>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Load reminders and streaks
  useEffect(() => {
    loadReminders();
    const interval = setInterval(loadReminders, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [familyMembers]);

  // Check for notifications
  useEffect(() => {
    checkAndNotify();
  }, [currentTime, reminders]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const allReminders: Reminder[] = [];
      const allStreaks: { [key: string]: Streak } = {};

      // Load for each family member
      for (const member of familyMembers) {
        const medResponse = await getMedicationsByMember(member._id);
        
        if (medResponse.success && medResponse.medications) {
          const activeMeds = medResponse.medications.filter((med: any) => med.isActive);
          
          // Create reminders for today
          for (const med of activeMeds) {
            if (med.timing && med.timing.length > 0) {
              for (const time of med.timing) {
                const timeInMinutes = convertTimeToMinutes(time);
                const currentMinutes = getCurrentMinutes();
                
                // ✅ SHOW ONLY IF: 
                // 1. Within 3 hours before the time
                // 2. Not past the time yet
                const threeHoursBefore = timeInMinutes - 180; // 180 minutes = 3 hours
                const shouldShow = currentMinutes >= threeHoursBefore && currentMinutes <= timeInMinutes;
                
                if (shouldShow) {
                  const todayReminders = await getTodayReminders(med._id!, time);
                  
                  // Only show if not already taken today
                  if (!todayReminders.isTaken) {
                    allReminders.push({
                      medicationId: med._id!,
                      medicationName: med.medicationName,
                      dosage: med.dosage,
                      timing: time,
                      timeInMinutes,
                      isTaken: false,
                      memberId: member._id,
                      memberName: member.name
                    });
                  }
                }
              }
            }

            // Load streak data
            const streakData = await getMedicationStreak(med._id!);
            if (streakData.success) {
              allStreaks[med._id!] = streakData.streak!;
            }
          }
        }
      }

      // Sort by time
      allReminders.sort((a, b) => a.timeInMinutes - b.timeInMinutes);
      
      setReminders(allReminders);
      setStreaks(allStreaks);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentMinutes = (): number => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  };

  const checkAndNotify = () => {
    const now = getCurrentMinutes();

    reminders.forEach(reminder => {
      // Notify exactly at the time
      if (reminder.timeInMinutes === now && !reminder.isTaken) {
        sendNotification(reminder);
      }
    });
  };

  const sendNotification = (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('💊 Medication Reminder', {
        body: `Time to take ${reminder.medicationName} (${reminder.dosage}) for ${reminder.memberName}`,
        icon: '/medication-icon.png',
        badge: '/badge-icon.png',
        tag: reminder.medicationId + reminder.timing,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        handleMarkTaken(reminder);
        notification.close();
      };
    }
  };

  const handleMarkTaken = async (reminder: Reminder) => {
    try {
      const result = await markMedicationTaken(
        reminder.medicationId,
        reminder.timing
      );

      if (result.success) {
        // ✅ IMMEDIATELY REMOVE FROM LIST
        setReminders(prev => 
          prev.filter(r => 
            !(r.medicationId === reminder.medicationId && r.timing === reminder.timing)
          )
        );

        // Reload streak data
        const streakData = await getMedicationStreak(reminder.medicationId);
        if (streakData.success) {
          setStreaks(prev => ({
            ...prev,
            [reminder.medicationId]: streakData.streak!
          }));
        }

        // Show success message
        alert(`✅ ${reminder.medicationName} marked as taken! 🔥 Streak maintained!`);
      }
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      alert('❌ Failed to mark as taken');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert('✅ Notifications enabled! You will receive medication reminders.');
      }
    }
  };

  const getStatusColor = (reminder: Reminder): string => {
    if (reminder.isTaken) return 'bg-green-50 border-green-300';
    const now = getCurrentMinutes();
    if (reminder.timeInMinutes < now) return 'bg-red-50 border-red-300';
    if (reminder.timeInMinutes - now <= 30) return 'bg-yellow-50 border-yellow-300';
    return 'bg-blue-50 border-blue-300';
  };

  const getStatusIcon = (reminder: Reminder): string => {
    if (reminder.isTaken) return '✅';
    const now = getCurrentMinutes();
    if (reminder.timeInMinutes < now) return '❌';
    if (reminder.timeInMinutes - now <= 30) return '⏰';
    return '⏳';
  };

  const getTimeUntil = (reminder: Reminder): string => {
    const now = getCurrentMinutes();
    const diff = reminder.timeInMinutes - now;
    
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Now!';
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  };

  const todayReminders = reminders.filter(r => {
    const now = getCurrentMinutes();
    return r.timeInMinutes >= now - 60; // Show for 1 hour after due time
  });

  const upcomingCount = todayReminders.filter(r => !r.isTaken).length;
  const takenCount = todayReminders.filter(r => r.isTaken).length;
  const totalCount = todayReminders.length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            💊 Today's Medications
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {upcomingCount} pending • {takenCount}/{totalCount} taken
          </p>
        </div>
        
        {Notification.permission !== 'granted' && (
          <button
            onClick={requestNotificationPermission}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
          >
            🔔 Enable Notifications
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(takenCount / totalCount) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">
            {Math.round((takenCount / totalCount) * 100)}% completed today
          </p>
        </div>
      )}

      {/* Reminders List */}
      {todayReminders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-600 text-lg font-medium">No medications scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayReminders.map((reminder, index) => (
            <div
              key={`${reminder.medicationId}-${reminder.timing}-${index}`}
              className={`border-2 rounded-xl p-4 transition-all ${getStatusColor(reminder)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-3xl">{getStatusIcon(reminder)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{reminder.medicationName}</h3>
                      {streaks[reminder.medicationId] && (
                        <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
                          <span className="text-lg">🔥</span>
                          <span className="text-sm font-bold text-orange-700">
                            {streaks[reminder.medicationId].currentStreak}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {reminder.dosage} • {reminder.memberName}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-700">
                        🕐 {reminder.timing}
                      </span>
                      {!reminder.isTaken && (
                        <span className="text-purple-700 font-medium">
                          {getTimeUntil(reminder)}
                        </span>
                      )}
                    </div>
                    
                    {/* Streak Info */}
                    {streaks[reminder.medicationId] && (
                      <div className="mt-2 flex gap-4 text-xs text-gray-600">
                        <span>🏆 Best: {streaks[reminder.medicationId].longestStreak} days</span>
                        <span>📊 {streaks[reminder.medicationId].adherenceRate}% adherence</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {!reminder.isTaken && (
                  <button
                    onClick={() => handleMarkTaken(reminder)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ml-3"
                  >
                    <span>✓</span>
                    <span>Take Now</span>
                  </button>
                )}
                {reminder.isTaken && (
                  <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap ml-3">
                    <span>✓</span>
                    <span>Taken</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {totalCount > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-purple-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{takenCount}</div>
              <div className="text-xs text-gray-600">Taken</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{upcomingCount}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(streaks).reduce((max, s) => Math.max(max, s.currentStreak), 0)}
              </div>
              <div className="text-xs text-gray-600">Best Streak</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}