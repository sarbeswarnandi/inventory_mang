const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');

// Route modules
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Optional fallback for unknown routes (SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
