const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edupatashala';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected to', MONGO_URI))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic Routes
const apiRouter = require('./routes/api');

app.use('/api', apiRouter);

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
