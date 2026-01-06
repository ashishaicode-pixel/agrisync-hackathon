const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');
const verifyRoutes = require('./routes/verify');
const ordersRoutes = require('./routes/orders');
const aiRoutes = require('./routes/ai');
const quotesRoutes = require('./routes/quotes');
const otpRoutes = require('./routes/otp');
const { initDatabase, getDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://*.azurestaticapps.net',
        'https://*.azurewebsites.net',
        'https://your-custom-domain.com'
      ]
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/otp', otpRoutes);

// Public marketplace endpoint - get all batches from all producers
app.get('/api/marketplace', (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT b.*, u.username as producer_name, u.organization, u.email as producer_email, u.phone as producer_phone
     FROM batches b 
     JOIN users u ON b.producer_id = u.id 
     ORDER BY b.created_at DESC`,
    [],
    (err, batches) => {
      if (err) {
        console.error('Marketplace query error:', err);
        db.close();
        return res.status(500).json({ error: 'Failed to fetch marketplace products' });
      }
      
      console.log(`Found ${batches.length} batches for marketplace`);
      db.close();
      res.json(batches);
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AgriSync API is running' });
});

app.listen(PORT, () => {
  console.log(`AgriSync server running on port ${PORT}`);
});