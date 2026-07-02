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
  const messagesEndRef = useRef(null);
  const { sendMessage } = useSocket(user?.id);

  // Fetch conversation list
  useEffect(() => {
    chatService.getUserConversations().then((res) => {
      if (res.data?.conversations) {
        setConversations(res.data.conversations);
      }
    }).catch(() => {});
  }, []);

  // Fetch conversation messages on mount
  useEffect(() => {
    if (!conversationId) return;
    chatService.getConversationMessages(conversationId).then((res) => {
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    }).catch(() => {});
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
            {conversations.length === 0 ? (
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
                      <p className="font-semibold text-neutral-800 truncate">{otherName}</p>
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
              {!conversationId ? (
                <p className="text-gray-600 text-center mt-20">Select a conversation to start chatting</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-600 text-center mt-20">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`flex ${msg.sender === 'self' || msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'self' || msg.sender_id === user?.id
                            ? 'bg-primary text-black'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {msg.message || msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            {conversationId && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
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
