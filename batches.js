const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Create new batch
router.post('/', authenticateToken, async (req, res) => {
  const {
    product_name,
    product_type,
    quantity,
    unit,
    harvest_date,
    location,
    description
  } = req.body;

  if (!product_name || !product_type || !quantity || !unit) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const batchId = uuidv4();
  const qrData = `${req.protocol}://${req.get('host')}/verify/${batchId}`;
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    
    const db = getDatabase();
    
    db.run(
      `INSERT INTO batches (id, producer_id, product_name, product_type, quantity, unit, 
       harvest_date, location, description, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [batchId, req.user.id, product_name, product_type, quantity, unit, 
       harvest_date, location, description, qrData],
      function(err) {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Failed to create batch' });
        }
        
        // Add initial harvest event
        db.run(
          'INSERT INTO events (batch_id, event_type, description, location) VALUES (?, ?, ?, ?)',
          [batchId, 'harvest', `Harvested ${quantity} ${unit} of ${product_name}`, location],
          (err) => {
            db.close();
            if (err) {
              console.error('Failed to create harvest event:', err);
            }
          }
        );
        
        res.status(201).json({
          message: 'Batch created successfully',
          batch: {
            id: batchId,
            product_name,
            product_type,
            quantity,
            unit,
            harvest_date,
            location,
            description,
            qr_code: qrData,
            qr_image: qrCodeDataURL
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get producer's batches
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT * FROM batches WHERE producer_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, batches) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch batches' });
      }
      res.json(batches);
    }
  );
});

// Get specific batch details
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.get(
    'SELECT * FROM batches WHERE id = ? AND producer_id = ?',
    [req.params.id, req.user.id],
    (err, batch) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch batch' });
      }
      
      if (!batch) {
        db.close();
        return res.status(404).json({ error: 'Batch not found' });
      }
      
      // Get events for this batch
      db.all(
        'SELECT * FROM events WHERE batch_id = ? ORDER BY timestamp DESC',
        [req.params.id],
        (err, events) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Failed to fetch events' });
          }
          
          // Get certifications
          db.all(
            'SELECT * FROM certifications WHERE batch_id = ?',
            [req.params.id],
            (err, certifications) => {
              db.close();
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch certifications' });
              }
              
              res.json({
                ...batch,
                events,
                certifications
              });
            }
          );
        }
      );
    }
  );
});

// Add event to batch
router.post('/:id/events', authenticateToken, upload.single('photo'), (req, res) => {
  const { event_type, description, location } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!event_type || !description) {
    return res.status(400).json({ error: 'Event type and description are required' });
  }
  
  const db = getDatabase();
  
  // Verify batch belongs to user
  db.get(
    'SELECT id FROM batches WHERE id = ? AND producer_id = ?',
    [req.params.id, req.user.id],
    (err, batch) => {
      if (err || !batch) {
        db.close();
        return res.status(404).json({ error: 'Batch not found' });
      }
      
      db.run(
        'INSERT INTO events (batch_id, event_type, description, location, photo_url) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, event_type, description, location, photo_url],
        function(err) {
          db.close();
          if (err) {
            return res.status(500).json({ error: 'Failed to add event' });
          }
          
          res.status(201).json({
            message: 'Event added successfully',
            event: {
              id: this.lastID,
              batch_id: req.params.id,
              event_type,
              description,
              location,
              photo_url,
              timestamp: new Date().toISOString()
            }
          });
        }
      );
    }
  );
});

module.exports = router;