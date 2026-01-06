const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'agrisync.db');

function initDatabase() {
  // Ensure database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    // Users table (producers and buyers)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'producer',
        organization TEXT,
        email_verified BOOLEAN DEFAULT 0,
        phone_verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OTP verification table
    db.run(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        phone TEXT,
        otp_code TEXT NOT NULL,
        otp_type TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        verified BOOLEAN DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Batches table
    db.run(`
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        producer_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        product_type TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        harvest_date DATE,
        location TEXT,
        description TEXT,
        qr_code TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producer_id) REFERENCES users (id)
      )
    `);

    // Events table (traceability events)
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        photo_url TEXT,
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `);

    // Certifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS certifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id TEXT NOT NULL,
        cert_type TEXT NOT NULL,
        cert_number TEXT,
        issuer TEXT NOT NULL,
        issue_date DATE,
        expiry_date DATE,
        document_url TEXT,
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `);

    // QR scans tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS qr_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id TEXT NOT NULL,
        scanner_ip TEXT,
        scanner_location TEXT,
        scan_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        producer_id INTEGER NOT NULL,
        buyer_name TEXT NOT NULL,
        buyer_email TEXT,
        buyer_phone TEXT,
        status TEXT DEFAULT 'pending',
        total_amount REAL NOT NULL,
        tracking_id TEXT,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        delivery_date DATE,
        notes TEXT,
        FOREIGN KEY (producer_id) REFERENCES users (id)
      )
    `);

    // Order items table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        batch_id TEXT,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        price_per_unit REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `);

    // Quote requests table
    db.run(`
      CREATE TABLE IF NOT EXISTS quote_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        producer TEXT NOT NULL,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        quantity REAL NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES batches (id)
      )
    `);
  });

  db.close();
  console.log('Database initialized successfully');
}

function getDatabase() {
  return new sqlite3.Database(dbPath);
}

module.exports = { initDatabase, getDatabase };