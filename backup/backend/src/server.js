require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const pool = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173','https://sallah-sanjal-mpki.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
    origin: [process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:5173','https://sallah-sanjal-mpki.vercel.app'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images)
app.use('/images', express.static(path.join(__dirname, '../images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
const userSockets = {} // Map user IDs to socket IDs

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins chat
  socket.on('user_join', (userId) => {
    userSockets[userId] = socket.id;
    socket.userId = userId;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, message } = data;
      const userId = socket.userId;

      if (!userId) {
        return socket.emit('error', { error: 'User not authenticated' });
      }

      // Save message to database
      const [result] = await pool.query(
        'INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)',
        [conversationId, userId, message]
      );

      // Get other user in conversation
      const [conversation] = await pool.query(
        'SELECT client_id, worker_id FROM conversations WHERE id = ?',
        [conversationId]
      );

      if (conversation.length > 0) {
        const conv = conversation[0];
        const otherUserId = conv.client_id === userId ? conv.worker_id : conv.client_id;

        // Emit to recipient
        io.to(`user_${otherUserId}`).emit('receive_message', {
          messageId: result.insertId,
          conversationId,
          senderId: userId,
          message,
          createdAt: new Date(),
        });
      }

      socket.emit('message_sent', { messageId: result.insertId });
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('error', { error: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
    });
  });

  // Stop typing
  socket.on('stop_typing', (data) => {
    const { conversationId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
      userId: socket.userId,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    delete userSockets[socket.userId];
    console.log('User disconnected:', socket.id);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
