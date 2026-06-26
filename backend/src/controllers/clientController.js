const pool = require('../config/database');

// Client controller — profile management, bookings, and messages

// Get current client profile
const getCurrentClientProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const [user] = await pool.query(
      'SELECT id, first_name, last_name, email, phone, profile_picture FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    // Format response to match frontend expectations
    const userData = user[0];
    res.json({
      id: userData.id,
      name: `${userData.first_name} ${userData.last_name}`,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      image: userData.profile_picture || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch client profile', details: error.message });
  }
};

// Update current client profile
const updateClientProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, first_name, last_name, phone, location, address, image, profile_image } = req.body;
    const imagePath = profile_image || image || null;

    // If name is provided, split it into first and last name
    let firstName = first_name;
    let lastName = last_name;
    
    if (name && !first_name && !last_name) {
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const [result] = await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, profile_picture = COALESCE(?, profile_picture) WHERE id = ?',
      [firstName, lastName, phone, imagePath, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update client profile', details: error.message });
  }
};

// Get client bookings
const getClientBookings = async (req, res) => {
  try {
    const { userId } = req.user;

    const [bookings] = await pool.query(
      `SELECT b.id, b.client_id, b.worker_id, b.service_id, b.booking_date, b.duration_hours, 
              b.estimated_cost, b.location, b.notes, b.status, b.created_at,
              u.first_name, u.last_name, u.phone,
              sc.name as service_name
       FROM bookings b
       LEFT JOIN users u ON b.worker_id = u.id
       LEFT JOIN service_categories sc ON b.service_id = sc.id
       WHERE b.client_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json(bookings || []);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
};

// Get client messages/conversations
const getClientMessages = async (req, res) => {
  try {
    const { userId } = req.user;

    const [conversations] = await pool.query(
      `SELECT 
        c.id,
        c.client_id,
        c.worker_id,
        c.last_message_at,
        c.created_at,
        c.updated_at,
        u2.first_name as worker_first_name,
        u2.last_name as worker_last_name,
        u2.profile_picture as worker_image,
        CONCAT(u2.first_name, ' ', u2.last_name) as worker_name,
        sc.name as worker_category,
        (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        DATE_FORMAT((SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1), '%M %d, %Y %h:%i %p') as timestamp
      FROM conversations c
      LEFT JOIN users u1 ON c.client_id = u1.id
      LEFT JOIN users u2 ON c.worker_id = u2.id
      LEFT JOIN worker_profiles wp ON u2.id = wp.user_id
      LEFT JOIN worker_services ws ON wp.id = ws.worker_id
      LEFT JOIN service_categories sc ON ws.service_id = sc.id
      WHERE c.client_id = ?
      GROUP BY c.id
      ORDER BY c.last_message_at DESC`,
      [userId]
    );

    res.json(conversations || []);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
};

module.exports = {
  getCurrentClientProfile,
  updateClientProfile,
  getClientBookings,
  getClientMessages,
};
