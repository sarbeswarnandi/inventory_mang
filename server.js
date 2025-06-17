const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');

// Import route modules
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

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for any non-API route (for single-page apps)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
