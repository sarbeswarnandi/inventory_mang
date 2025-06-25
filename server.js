const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route for SPA (index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server on local network (e.g. 192.168.x.x:5000)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Allow access from all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌐 Access on local network at: http://<your-local-ip>:${PORT}`);
});
