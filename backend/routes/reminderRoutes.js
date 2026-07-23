// Create: backend/routes/reminderRoutes.js

const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const Medication = require('../models/Medication');
const { protect }  = require('../middleware/auth');

// Mark medication as taken
router.post('/taken', protect, async (req, res) => {
  try {
    const { medicationId, timing, takenAt } = req.body;

    // Get medication details
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    // Check if already marked for today
    const today = new Date(takenAt).toISOString().split('T')[0];
    const existing = await Reminder.findOne({
      medicationId,
      timing,
      date: new Date(today)
    });

    if (existing) {
      return res.status(400).json({ error: 'Already marked as taken' });
    }

    // Create reminder log
    const reminder = new Reminder({
      userId: req.user.id,
      medicationId,
      memberId: medication.memberId,
      timing,
      date: new Date(today),
      takenAt: new Date(takenAt)
    });

    await reminder.save();

    res.json({
      success: true,
      message: 'Medication marked as taken! 🔥 Streak maintained!'
    });
  } catch (error) {
    console.error('Error marking medication as taken:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reminder status for specific date/time
router.get('/status/:medicationId/:timing/:date', protect, async (req, res) => {
  try {
    const { medicationId, timing, date } = req.params;

    const reminder = await Reminder.findOne({
      medicationId,
      timing,
      date: new Date(date)
    });

    res.json({
      isTaken: reminder ? true : false
    });
  } catch (error) {
    console.error('Error getting reminder status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get medication streak
router.get('/streak/:medicationId', protect, async (req, res) => {
  try {
    const { medicationId } = req.params;

    // Get medication details
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    const startDate = new Date(medication.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all reminder logs
    const reminders = await Reminder.find({
      medicationId,
      date: { $gte: startDate, $lte: today }
    }).sort({ date: -1 });

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalDoses = 0;
    let takenDoses = reminders.length;

    // Expected doses per day
    const dosesPerDay = medication.timing ? medication.timing.length : 1;

    // Calculate days between start and today
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    totalDoses = daysDiff * dosesPerDay;

    // Group reminders by date
    const remindersByDate = {};
    reminders.forEach(r => {
      const dateKey = r.date.toISOString().split('T')[0];
      if (!remindersByDate[dateKey]) {
        remindersByDate[dateKey] = 0;
      }
      remindersByDate[dateKey]++;
    });

    // Calculate current streak (from today backwards)
    let checkDate = new Date(today);
    while (checkDate >= startDate) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const takenCount = remindersByDate[dateKey] || 0;
      
      if (takenCount >= dosesPerDay) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    checkDate = new Date(startDate);
    while (checkDate <= today) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const takenCount = remindersByDate[dateKey] || 0;
      
      if (takenCount >= dosesPerDay) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      
      checkDate.setDate(checkDate.getDate() + 1);
    }

    const adherenceRate = totalDoses > 0 
      ? Math.round((takenDoses / totalDoses) * 100) 
      : 0;

    const lastTaken = reminders.length > 0 
      ? reminders[0].takenAt 
      : null;

    res.json({
      streak: {
        currentStreak,
        longestStreak,
        adherenceRate,
        lastTaken,
        totalDoses,
        takenDoses
      }
    });
  } catch (error) {
    console.error('Error calculating streak:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reminder history
router.get('/history/:medicationId', protect, async (req, res) => {
  try {
    const { medicationId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reminders = await Reminder.find({
      medicationId,
      date: { $gte: startDate }
    }).sort({ date: -1, timing: 1 });

    res.json({
      history: reminders
    });
  } catch (error) {
    console.error('Error getting reminder history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;