// Real-time chat page for client-worker communication

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';
import { useAuthStore } from '../utils/store';
import { chatService } from '../services/endpoints';

const Chat = () => {
  const { conversationId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { sendMessage, emitTyping, emitStopTyping, registerCallback, unregisterCallback } = useSocket(user?.id);

  // Fetch conversation list
  useEffect(() => {
    setLoadingConversations(true);
    chatService.getUserConversations().then((res) => {
      if (res.data?.conversations) {
        setConversations(res.data.conversations);
      }
    }).catch(() => {
      setError('Failed to load conversations');
    }).finally(() => {
      setLoadingConversations(false);
    });
  }, []);

  // Fetch conversation messages on mount
  useEffect(() => {
    if (!conversationId) return;
    setLoadingMessages(true);
    setError('');
    chatService.getConversationMessages(conversationId).then((res) => {
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    }).catch(() => {
      setError('Failed to load messages');
    }).finally(() => {
      setLoadingMessages(false);
    });
  }, [conversationId]);

  // Listen for typing events
  useEffect(() => {
    registerCallback('onUserTyping', (data) => {
      if (data.conversationId === Number(conversationId)) {
        setIsTyping(true);
      }
    });
    registerCallback('onUserStopTyping', (data) => {
      if (data.conversationId === Number(conversationId)) {
        setIsTyping(false);
      }
    });
    return () => {
      unregisterCallback('onUserTyping');
      unregisterCallback('onUserStopTyping');
    };
  }, [conversationId, registerCallback, unregisterCallback]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (!conversationId) return;
    emitTyping(conversationId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(conversationId);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(conversationId, inputMessage);
      setInputMessage('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4 h-screen flex flex-col">
        <h1 className="text-4xl font-bold mb-8">Messages</h1>
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Conversation List Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow-md overflow-y-auto flex-shrink-0">
            {loadingConversations ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-gray-600 text-center p-4">No conversations yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conv) => {
                  const otherName = conv.client_id === user?.id
                    ? `${conv.worker_first_name} ${conv.worker_last_name}`
                    : `${conv.client_first_name} ${conv.client_last_name}`;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => navigate(`/chat/${conv.id}`)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        Number(conversationId) === conv.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-neutral-800 truncate">{otherName}</p>
                        {conv.last_message_time && (
                          <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                            {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-sm text-neutral-500 truncate mt-1">{conv.last_message}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages Container */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6 mb-4 overflow-y-auto">
              {error ? (
                <div className="text-center mt-20">
                  <p className="text-red-600 font-semibold">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-orange-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : loadingMessages ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <div className="h-12 w-48 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : !conversationId ? (
                <p className="text-gray-600 text-center mt-20">Select a conversation to start chatting</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-600 text-center mt-20">No messages yet. Send one below!</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => {
                    const isOwn = msg.sender === 'self' || msg.sender_id === user?.id;
                    const msgTime = msg.created_at || msg.createdAt;
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                      >
                        {!isOwn && msg.first_name && (
                          <span className="text-xs text-neutral-500 mb-1 ml-1">
                            {msg.first_name} {msg.last_name}
                          </span>
                        )}
                        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-primary text-black'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p>{msg.message || msg.text}</p>
                          </div>
                          {msgTime && (
                            <span className="text-xs text-neutral-400 flex-shrink-0">
                              {new Date(msgTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
              {isTyping && !loadingMessages && (
                <div className="flex justify-start mt-2">
                  <div className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg">
                    <span className="animate-pulse">typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            {conversationId && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-primary text-black px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
