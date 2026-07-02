const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getOrCreateConversation,
  getUserConversations,
  getConversationDetails,
  getConversationMessages,
  sendMessage,
  markMessageAsRead,
} = require('../controllers/chatController');

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

// Conversation management
router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getUserConversations);

// Conversation details and messages
router.get('/:conversationId/details', getConversationDetails);
router.get('/:conversationId/messages', getConversationMessages);
router.post('/:conversationId/messages', sendMessage);

// Message actions
router.put('/messages/:messageId/read', markMessageAsRead);

module.exports = router;
