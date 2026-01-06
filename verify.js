const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Verify batch by QR scan
router.get('/:batchId', (req, res) => {
  const { batchId } = req.params;
  const scannerIp = req.ip;
  
  const db = getDatabase();
  
  // Get batch details with producer info
  db.get(`
    SELECT b.*, u.username as producer_name, u.organization, u.phone
    FROM batches b
    JOIN users u ON b.producer_id = u.id
    WHERE b.id = ?
  `, [batchId], (err, batch) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Verification failed' });
    }
    
    if (!batch) {
      db.close();
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    // Get events
    db.all(
      'SELECT * FROM events WHERE batch_id = ? ORDER BY timestamp ASC',
      [batchId],
      (err, events) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Failed to fetch events' });
        }
        
        // Get certifications
        db.all(
          'SELECT * FROM certifications WHERE batch_id = ?',
          [batchId],
          (err, certifications) => {
            if (err) {
              db.close();
              return res.status(500).json({ error: 'Failed to fetch certifications' });
            }
            
            // Record the scan
            db.run(
              'INSERT INTO qr_scans (batch_id, scanner_ip) VALUES (?, ?)',
              [batchId, scannerIp],
              (err) => {
                db.close();
                if (err) {
                  console.error('Failed to record scan:', err);
                }
              }
            );
            
            // Calculate trust score based on events and certifications
            const trustScore = calculateTrustScore(events, certifications);
            
            res.json({
              batch: {
                id: batch.id,
                product_name: batch.product_name,
                product_type: batch.product_type,
                quantity: batch.quantity,
                unit: batch.unit,
                harvest_date: batch.harvest_date,
                location: batch.location,
                description: batch.description,
                created_at: batch.created_at
              },
              producer: {
                name: batch.producer_name,
                organization: batch.organization,
                phone: batch.phone
              },
              events,
              certifications,
              trust_score: trustScore,
              verified_at: new Date().toISOString()
            });
          }
        );
      }
    );
  });
});

// Get scan analytics for a batch
router.get('/:batchId/analytics', (req, res) => {
  const { batchId } = req.params;
  
  const db = getDatabase();
  
  db.all(
    'SELECT COUNT(*) as total_scans, DATE(scan_timestamp) as scan_date FROM qr_scans WHERE batch_id = ? GROUP BY DATE(scan_timestamp) ORDER BY scan_date DESC',
    [batchId],
    (err, scanData) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch analytics' });
      }
      
      db.get(
        'SELECT COUNT(*) as total_scans FROM qr_scans WHERE batch_id = ?',
        [batchId],
        (err, totalScans) => {
          db.close();
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch total scans' });
          }
          
          res.json({
            total_scans: totalScans.total_scans,
            daily_scans: scanData
          });
        }
      );
    }
  );
});

function calculateTrustScore(events, certifications) {
  let score = 50; // Base score
  
  // Add points for events
  score += Math.min(events.length * 5, 30); // Max 30 points for events
  
  // Add points for certifications
  score += certifications.length * 10; // 10 points per certification
  
  // Add points for photos
  const eventsWithPhotos = events.filter(e => e.photo_url).length;
  score += eventsWithPhotos * 5;
  
  // Cap at 100
  return Math.min(score, 100);
}

module.exports = router;