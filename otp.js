const express = require('express');
const otpService = require('../services/otpService');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Send OTP for email verification
router.post('/send-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const result = await otpService.sendOTP(email, null, 'email');
    res.json(result);
  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Send OTP for phone verification
router.post('/send-sms', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Validate phone format (Indian format)
    const phoneRegex = /^(\+91|91)?[6789]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    const result = await otpService.sendOTP(null, phone, 'sms');
    res.json(result);
  } catch (error) {
    console.error('Send SMS OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify email OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    const result = await otpService.verifyOTP(email, null, otp, 'email');
    
    if (result.success) {
      // Update user email verification status
      const db = getDatabase();
      db.run(
        'UPDATE users SET email_verified = 1 WHERE email = ?',
        [email],
        (err) => {
          db.close();
          if (err) {
            console.error('Update email verification error:', err);
          }
        }
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Verify phone OTP
router.post('/verify-sms', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }
    
    const result = await otpService.verifyOTP(null, phone, otp, 'sms');
    
    if (result.success) {
      // Update user phone verification status
      const db = getDatabase();
      db.run(
        'UPDATE users SET phone_verified = 1 WHERE phone = ?',
        [phone],
        (err) => {
          db.close();
          if (err) {
            console.error('Update phone verification error:', err);
          }
        }
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Combined verification for registration
router.post('/verify-registration', async (req, res) => {
  try {
    const { email, phone, emailOTP, phoneOTP } = req.body;
    
    if (!email || !phone || !emailOTP || !phoneOTP) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Verify both OTPs
    const emailResult = await otpService.verifyOTP(email, null, emailOTP, 'email');
    const phoneResult = await otpService.verifyOTP(null, phone, phoneOTP, 'sms');
    
    if (emailResult.success && phoneResult.success) {
      res.json({
        success: true,
        message: 'Both email and phone verified successfully',
        emailVerified: true,
        phoneVerified: true
      });
    } else {
      res.json({
        success: false,
        message: 'Verification failed',
        emailVerified: emailResult.success,
        phoneVerified: phoneResult.success,
        emailError: emailResult.success ? null : emailResult.message,
        phoneError: phoneResult.success ? null : phoneResult.message
      });
    }
  } catch (error) {
    console.error('Verify registration error:', error);
    res.status(500).json({ error: 'Failed to verify registration' });
  }
});

module.exports = router;