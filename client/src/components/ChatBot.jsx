import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Sparkles, RefreshCw, UserPlus } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import './ChatBot.css';

export const ChatBot = ({ onOpenLeadForm }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! Welcome to ABC Academy. I'm your AI assistant. How can I help you today with our technical courses, fees, or schedules?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const samplePrompts = [
    "What courses do you offer?",
    "What are the course fees?",
    "Where are you located?",
    "Do you offer placement support?"
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || text.trim() === '' || isLoading) return;

    const userText = text.trim();
    const userMsgObj = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMessage('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(userText);
      const aiMsgObj = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || "I'm sorry, I couldn't process that response.",
        isFallback: data.isFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to receive AI response. Please check backend status.');
      const errorMsgObj = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting to the server. Please check your network or leave your contact info below so our team can help you.",
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsgObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container card">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="chatbot-title">ABC Academy AI Support</h3>
            <span className="chatbot-status">
              <span className="status-dot"></span> Online • Responds instantly
            </span>
          </div>
        </div>

        <button className="btn-lead-trigger" onClick={onOpenLeadForm} title="Leave Contact Details">
          <UserPlus size={16} />
          <span>Request Callback</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'} animate-fade-in`}
          >
            <div className={`message-avatar ${msg.sender}`}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-content">
              <div className={`message-bubble ${msg.sender} ${msg.isError ? 'message-error' : ''}`}>
                <p className="message-text">{msg.text}</p>
              </div>
              <div className="message-time">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-row ai-row animate-fade-in">
            <div className="message-avatar ai">
              <Bot size={16} />
            </div>
            <div className="message-bubble ai loading-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length < 5 && (
        <div className="chatbot-suggestions">
          <span className="suggestion-label"><Sparkles size={12} /> Suggested Questions:</span>
          <div className="suggestion-pills">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="suggestion-pill"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="chatbot-error-banner">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="chatbot-input-area">
        <textarea
          ref={inputRef}
          className="chatbot-input"
          placeholder="Ask a question about courses, fees, or location..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        <button
          className="chatbot-send-btn"
          onClick={() => handleSendMessage()}
          disabled={isLoading || inputMessage.trim() === ''}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
