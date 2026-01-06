const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}-${random}`;
};

// Get all orders for producer
router.get('/', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT o.*, 
     (SELECT GROUP_CONCAT(oi.product_name || ':' || oi.quantity || ':' || oi.unit || ':' || oi.price_per_unit, '|') 
      FROM order_items oi WHERE oi.order_id = o.id) as items
     FROM orders o 
     WHERE o.producer_id = ? 
     ORDER BY o.order_date DESC`,
    [req.user.id],
    (err, orders) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }
      
      // Parse items string into array
      const parsedOrders = orders.map(order => {
        const products = order.items ? order.items.split('|').map(item => {
          const [name, quantity, unit, price] = item.split(':');
          return { name, quantity: parseFloat(quantity), unit, price: parseFloat(price) };
        }) : [];
        
        return {
          ...order,
          products,
          items: undefined
        };
      });
      
      res.json(parsedOrders);
    }
  );
});

// Create new order
router.post('/', authenticateToken, (req, res) => {
  const { buyer_name, buyer_email, buyer_phone, products, notes, delivery_date } = req.body;
  
  if (!buyer_name || !products || products.length === 0) {
    return res.status(400).json({ error: 'Buyer name and products are required' });
  }
  
  const orderNumber = generateOrderNumber();
  const totalAmount = products.reduce((sum, p) => sum + (p.quantity * p.price_per_unit), 0);
  
  const db = getDatabase();
  
  db.run(
    `INSERT INTO orders (order_number, producer_id, buyer_name, buyer_email, buyer_phone, total_amount, notes, delivery_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [orderNumber, req.user.id, buyer_name, buyer_email, buyer_phone, totalAmount, notes, delivery_date],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to create order' });
      }
      
      const orderId = this.lastID;
      
      // Insert order items
      const insertItem = db.prepare(
        'INSERT INTO order_items (order_id, batch_id, product_name, quantity, unit, price_per_unit) VALUES (?, ?, ?, ?, ?, ?)'
      );
      
      products.forEach(product => {
        insertItem.run(orderId, product.batch_id || null, product.name, product.quantity, product.unit, product.price_per_unit);
      });
      
      insertItem.finalize();
      db.close();
      
      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: orderId,
          order_number: orderNumber,
          buyer_name,
          buyer_email,
          buyer_phone,
          total_amount: totalAmount,
          status: 'pending',
          products
        }
      });
    }
  );
});

// Update order status
router.patch('/:id/status', authenticateToken, (req, res) => {
  const { status, tracking_id } = req.body;
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const db = getDatabase();
  
  db.run(
    `UPDATE orders SET status = ?, tracking_id = COALESCE(?, tracking_id) 
     WHERE id = ? AND producer_id = ?`,
    [status, tracking_id, req.params.id, req.user.id],
    function(err) {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to update order' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json({ message: 'Order updated successfully' });
    }
  );
});

// Delete order
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  
  // First delete order items
  db.run('DELETE FROM order_items WHERE order_id = ?', [req.params.id], (err) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to delete order items' });
    }
    
    // Then delete order
    db.run(
      'DELETE FROM orders WHERE id = ? AND producer_id = ?',
      [req.params.id, req.user.id],
      function(err) {
        db.close();
        if (err) {
          return res.status(500).json({ error: 'Failed to delete order' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ message: 'Order deleted successfully' });
      }
    );
  });
});

module.exports = router;
