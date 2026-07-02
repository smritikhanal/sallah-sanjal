const pool = require('../config/database');

// Get or create conversation
const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { workerId, bookingId } = req.body;

    if (!workerId) {
      return res.status(400).json({ error: 'Worker ID is required' });
    }

    // Get worker's user_id
    const [worker] = await pool.query(
      'SELECT user_id FROM worker_profiles WHERE id = ?',
      [workerId]
    );

    if (worker.length === 0) {
      return res.status(400).json({ error: 'Invalid worker' });
    }

    const workerUserId = worker[0].user_id;

    // Check if conversation exists
    const [existing] = await pool.query(
      'SELECT id FROM conversations WHERE (client_id = ? AND worker_id = ?) OR (client_id = ? AND worker_id = ?)',
      [userId, workerUserId, workerUserId, userId]
    );

    if (existing.length > 0) {
      return res.json({ conversationId: existing[0].id });
    }

    // Create new conversation
    const [result] = await pool.query(
      'INSERT INTO conversations (client_id, worker_id, booking_id) VALUES (?, ?, ?)',
      [userId, workerUserId, bookingId || null]
    );

    res.status(201).json({ conversationId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get conversation', details: error.message });
  }
};

// Get conversations for user with worker details
const getUserConversations = async (req, res) => {
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
       u1.first_name as client_first_name,
       u1.last_name as client_last_name,
       u2.id as worker_user_id,
       u2.first_name as worker_first_name,
       u2.last_name as worker_last_name,
       u2.profile_picture as worker_image,
       wp.id as worker_profile_id,
       sc.name as worker_category,
       (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
       (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM conversations c
       JOIN users u1 ON c.client_id = u1.id
       JOIN users u2 ON c.worker_id = u2.id
       LEFT JOIN worker_profiles wp ON u2.id = wp.user_id
       LEFT JOIN worker_services ws ON wp.id = ws.worker_id
       LEFT JOIN service_categories sc ON ws.service_id = sc.id
       WHERE c.client_id = ? OR c.worker_id = ?
       ORDER BY c.last_message_at DESC`,
      [userId, userId]
    );

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
};

// Get conversation details with worker info
const getConversationDetails = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    const [conversation] = await pool.query(
      `SELECT 
       c.*,
       u1.first_name as client_first_name,
       u1.last_name as client_last_name,
       u2.id as worker_user_id,
       u2.first_name as worker_first_name,
       u2.last_name as worker_last_name,
       u2.profile_picture as worker_image,
       wp.id as worker_profile_id,
       wp.hourly_rate,
       wp.average_rating,
       sc.name as worker_category,
       GROUP_CONCAT(DISTINCT sc2.name SEPARATOR ', ') as services
       FROM conversations c
       JOIN users u1 ON c.client_id = u1.id
       JOIN users u2 ON c.worker_id = u2.id
       LEFT JOIN worker_profiles wp ON u2.id = wp.user_id
       LEFT JOIN worker_services ws ON wp.id = ws.worker_id
       LEFT JOIN service_categories sc ON ws.service_id = sc.id
       LEFT JOIN service_categories sc2 ON ws.service_id = sc2.id
       WHERE c.id = ? AND (c.client_id = ? OR c.worker_id = ?)
       GROUP BY c.id`,
      [conversationId, userId, userId]
    );

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation details', details: error.message });
  }
};

// Get messages for conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const [messages] = await pool.query(
      `SELECT m.*, u.first_name, u.last_name, u.profile_picture FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC
       LIMIT ? OFFSET ?`,
      [conversationId, parseInt(limit), offset]
    );

    res.json({
      messages: messages,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Verify user is part of conversation
    const [conversation] = await pool.query(
      'SELECT id FROM conversations WHERE id = ? AND (client_id = ? OR worker_id = ?)',
      [conversationId, userId, userId]
    );

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Insert message
    const [result] = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)',
      [conversationId, userId, message.trim()]
    );

    // Update conversation's last_message_at
    await pool.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = ?',
      [conversationId]
    );

    // Get the message with user details
    const [newMessage] = await pool.query(
      `SELECT m.*, u.first_name, u.last_name, u.profile_picture FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    await pool.query(
      'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ?',
      [messageId]
    );

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read', details: error.message });
  }
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getConversationDetails,
  getConversationMessages,
  sendMessage,
  markMessageAsRead,
};
