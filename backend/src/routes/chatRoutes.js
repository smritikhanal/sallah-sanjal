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

router.use(authMiddleware);

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getUserConversations);
router.get('/:conversationId/details', getConversationDetails);
router.get('/:conversationId/messages', getConversationMessages);
router.post('/:conversationId/messages', sendMessage);
router.put('/messages/:messageId/read', markMessageAsRead);

module.exports = router;
