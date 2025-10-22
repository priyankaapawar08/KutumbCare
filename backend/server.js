const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uncomment these lines:
const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/families');
const memberRoutes = require('./routes/members');
const recordRoutes = require('./routes/records');
const medicationRoutes = require('./routes/medications');
const vitalRoutes = require('./routes/vitals');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/vitals', vitalRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'KutumbCare API is running',
    version: '1.0.0',
    status: 'healthy'
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

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