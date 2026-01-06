const { getDatabase } = require('../database/init');

class OTPService {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP in database
  async storeOTP(email, phone, otpCode, type) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      // Clean up old OTPs for this email/phone
      const cleanupQuery = email 
        ? 'DELETE FROM otp_verifications WHERE email = ? AND otp_type = ?'
        : 'DELETE FROM otp_verifications WHERE phone = ? AND otp_type = ?';
      
      db.run(cleanupQuery, [email || phone, type], (err) => {
        if (err) {
          db.close();
          return reject(err);
        }
        
        // Insert new OTP
        db.run(
          `INSERT INTO otp_verifications (email, phone, otp_code, otp_type, expires_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [email, phone, otpCode, type, expiresAt.toISOString()],
          function(err) {
            db.close();
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, otpCode, expiresAt });
            }
          }
        );
      });
    });
  }

  // Verify OTP
  async verifyOTP(email, phone, otpCode, type) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const now = new Date().toISOString();
      
      const query = email
        ? `SELECT * FROM otp_verifications 
           WHERE email = ? AND otp_type = ? AND expires_at > ? AND verified = 0 
           ORDER BY created_at DESC LIMIT 1`
        : `SELECT * FROM otp_verifications 
           WHERE phone = ? AND otp_type = ? AND expires_at > ? AND verified = 0 
           ORDER BY created_at DESC LIMIT 1`;
      
      db.get(query, [email || phone, type, now], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }
        
        if (!row) {
          db.close();
          return resolve({ success: false, message: 'OTP expired or not found' });
        }
        
        // Check attempts
        if (row.attempts >= 3) {
          db.close();
          return resolve({ success: false, message: 'Too many failed attempts' });
        }
        
        // Verify OTP
        if (row.otp_code === otpCode) {
          // Mark as verified
          db.run(
            'UPDATE otp_verifications SET verified = 1 WHERE id = ?',
            [row.id],
            (err) => {
              db.close();
              if (err) {
                reject(err);
              } else {
                resolve({ success: true, message: 'OTP verified successfully' });
              }
            }
          );
        } else {
          // Increment attempts
          db.run(
            'UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?',
            [row.id],
            (err) => {
              db.close();
              if (err) {
                reject(err);
              } else {
                resolve({ success: false, message: 'Invalid OTP' });
              }
            }
          );
        }
      });
    });
  }

  // Send Email OTP (mock implementation)
  async sendEmailOTP(email, otpCode) {
    // In production, integrate with email service like SendGrid, AWS SES, etc.
    console.log(`📧 Email OTP for ${email}: ${otpCode}`);
    
    // Mock email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `OTP sent to ${email}`,
          // In development, we'll show the OTP in the response
          developmentOTP: process.env.NODE_ENV === 'development' ? otpCode : undefined
        });
      }, 1000);
    });
  }

  // Send SMS OTP (mock implementation)
  async sendSMSOTP(phone, otpCode) {
    // In production, integrate with SMS service like Twilio, AWS SNS, etc.
    console.log(`📱 SMS OTP for ${phone}: ${otpCode}`);
    
    // Mock SMS sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `OTP sent to ${phone}`,
          // In development, we'll show the OTP in the response
          developmentOTP: process.env.NODE_ENV === 'development' ? otpCode : undefined
        });
      }, 1000);
    });
  }

  // Send OTP based on type
  async sendOTP(email, phone, type) {
    try {
      const otpCode = this.generateOTP();
      
      // Store OTP in database
      await this.storeOTP(email, phone, otpCode, type);
      
      // Send OTP based on type
      if (type === 'email') {
        return await this.sendEmailOTP(email, otpCode);
      } else if (type === 'sms') {
        return await this.sendSMSOTP(phone, otpCode);
      } else {
        throw new Error('Invalid OTP type');
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OTPService();