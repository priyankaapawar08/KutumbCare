const express = require('express');

const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
connectDB();
app.use(express.json()); // Needed to parse JSON body
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Routes
const lifestyleRoutes = require('./routes/lifestyle');
const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/families');
const memberRoutes = require('./routes/members');
const recordRoutes = require('./routes/records');
const medicationRoutes = require('./routes/medications');
const vitalRoutes = require('./routes/vitals');
const documentRoutes = require('./routes/documents');
const appointmentRoutes = require('./routes/appointments');
const reminderRoutes = require('./routes/reminderRoutes');
app.use('/api/reminders', reminderRoutes);
// Mount routes - KEEP ONLY ONE documents route
app.use('/api/auth', authRoutes);
//app.use('/api/families', familyRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/documents', documentRoutes);  // ✅ KEEP THIS ONE
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lifestyle', lifestyleRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'KutumbCare API is running',
    version: '1.0.0',
    status: 'healthy'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  
});
