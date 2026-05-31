import { useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useChatStore } from '../utils/store';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
const socketCallbacks = {};

export const useSocket = (userId, accessToken) => {
  const { addMessage, setMessages, setConversations } = useChatStore();
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const token = accessToken || localStorage.getItem('accessToken');
    if (!token) return;

    if (!socket || !socket.connected) {
      socket = io(SOCKET_URL, {
        auth: {
          token,
          userId,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        socket.emit('user_join', { userId, timestamp: new Date().toISOString() });
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      // Message events
      socket.on('receive_message', (data) => {
        console.log('Message received:', data);
        addMessage(data);
        
        // Call any registered callbacks for this event
        if (socketCallbacks.onReceiveMessage) {
          socketCallbacks.onReceiveMessage(data);
        }
      });

      // Typing indicators
      socket.on('user_typing', (data) => {
        console.log('User typing:', data);
        if (socketCallbacks.onUserTyping) {
          socketCallbacks.onUserTyping(data);
        }
      });

      socket.on('user_stop_typing', (data) => {
        console.log('User stopped typing:', data);
        if (socketCallbacks.onUserStopTyping) {
          socketCallbacks.onUserStopTyping(data);
        }
      });

      // Conversation updated
      socket.on('conversation_updated', (data) => {
        console.log('Conversation updated:', data);
        if (socketCallbacks.onConversationUpdated) {
          socketCallbacks.onConversationUpdated(data);
        }
      });

      socket.on('message_read', (data) => {
        console.log('Message read:', data);
        if (socketCallbacks.onMessageRead) {
          socketCallbacks.onMessageRead(data);
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        if (socketCallbacks.onError) {
          socketCallbacks.onError(error);
        }
      });
    }

    return () => {
      // Don't disconnect on unmount to keep socket alive for other components
    };
  }, [userId, accessToken, addMessage, setMessages, setConversations]);

  // Send message with real-time delivery
  const sendMessage = useCallback((conversationId, message, metadata = {}) => {
    if (socket && socket.connected) {
      const messageData = {
        conversationId,
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
      };
      socket.emit('send_message', messageData, (response) => {
        console.log('Message sent confirmation:', response);
        if (socketCallbacks.onMessageSent) {
          socketCallbacks.onMessageSent(response);
        }
      });
      return true;
    }
    console.warn('Socket not connected');
    return false;
  }, []);

  // Emit typing event
  const emitTyping = useCallback((conversationId) => {
    if (socket && socket.connected) {
      socket.emit('typing', { conversationId, timestamp: new Date().toISOString() });
    }
  }, []);

  // Emit stop typing event
  const emitStopTyping = useCallback((conversationId) => {
    if (socket && socket.connected) {
      socket.emit('stop_typing', { conversationId, timestamp: new Date().toISOString() });
    }
  }, []);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId, conversationId) => {
    if (socket && socket.connected) {
      socket.emit('mark_read', { messageId, conversationId, timestamp: new Date().toISOString() });
    }
  }, []);

  // Request conversation messages (for pagination)
  const requestConversationMessages = useCallback((conversationId, limit = 20, offset = 0) => {
    if (socket && socket.connected) {
      return new Promise((resolve) => {
        socket.emit('get_messages', { conversationId, limit, offset }, (response) => {
          resolve(response);
        });
      });
    }
    return Promise.resolve([]);
  }, []);

  // Get or create conversation
  const getOrCreateConversation = useCallback((workerId) => {
    if (socket && socket.connected) {
      return new Promise((resolve) => {
        socket.emit('get_or_create_conversation', { workerId, timestamp: new Date().toISOString() }, (response) => {
          resolve(response);
        });
      });
    }
    return Promise.resolve(null);
  }, []);

  // Register callback for specific events
  const registerCallback = (eventName, callback) => {
    socketCallbacks[eventName] = callback;
  };

  // Unregister callback
  const unregisterCallback = (eventName) => {
    delete socketCallbacks[eventName];
  };

  // Get socket connection status
  const isConnected = socket?.connected || false;

  return {
    socket,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markMessageAsRead,
    requestConversationMessages,
    getOrCreateConversation,
    registerCallback,
    unregisterCallback,
    isConnected,
  };
};

// Singleton getter for socket
export const getSocket = () => socket;

// Disconnect socket (call on logout)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
