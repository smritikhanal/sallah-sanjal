// Real-time chat page for client-worker communication

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';
import { useAuthStore } from '../utils/store';
import { chatService } from '../services/endpoints';

const Chat = () => {
  const { conversationId } = useParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { sendMessage } = useSocket(user?.id);

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
      <div className="max-w-2xl mx-auto py-8 px-4 h-screen flex flex-col">
        <h1 className="text-4xl font-bold mb-8">Chat</h1>

        {/* Messages Container */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 mb-6 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-600 text-center">No messages yet</p>
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
      </div>
    </>
  );
};

export default Chat;
