const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, organization, phone, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  const db = getDatabase();
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'producer'; // Default to producer if not specified
    
    db.run(
      'INSERT INTO users (username, email, password, organization, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, organization || null, phone || null, userRole],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        
        const token = jwt.sign(
          { id: this.lastID, username, role: userRole },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, username, email, role: userRole, organization, phone }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    db.close();
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const db = getDatabase();
  
  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, username],
    async (err, user) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Login failed' });
      }
      
      if (!user) {
        db.close();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      try {
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
          db.close();
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            organization: user.organization,
            phone: user.phone
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Login failed' });
      } finally {
        db.close();
      }
    }
  );
});

module.exports = router;