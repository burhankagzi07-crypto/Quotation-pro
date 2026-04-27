require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const quotationRoutes = require('./routes/quotationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(frontendPath));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotations', quotationRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing in .env');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing in .env');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
