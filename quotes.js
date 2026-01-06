const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Submit quote request
router.post('/', async (req, res) => {
  try {
    const {
      productId,
      productName,
      producer,
      companyName,
      contactName,
      email,
      phone,
      quantity,
      message
    } = req.body;

    if (!productId || !companyName || !contactName || !email || !phone || !quantity) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const db = getDatabase();
    
    // Insert quote request
    db.run(
      `INSERT INTO quote_requests (
        product_id, product_name, producer, company_name, contact_name, 
        email, phone, quantity, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [productId, productName, producer, companyName, contactName, email, phone, quantity, message],
      function(err) {
        db.close();
        if (err) {
          console.error('Quote request error:', err);
          return res.status(500).json({ error: 'Failed to submit quote request' });
        }
        
        res.status(201).json({
          message: 'Quote request submitted successfully',
          quoteId: this.lastID,
          status: 'pending'
        });
      }
    );
  } catch (error) {
    console.error('Quote request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quote requests for a producer (would need authentication in real app)
router.get('/producer/:producerId', (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT * FROM quote_requests WHERE producer = ? ORDER BY created_at DESC',
    [req.params.producerId],
    (err, quotes) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch quote requests' });
      }
      res.json(quotes);
    }
  );
});

module.exports = router;