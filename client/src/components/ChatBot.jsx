import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

export const ChatBot = ({ onOpenLeadForm, businessProfile }) => {
  const businessName = businessProfile?.name || 'ABC Academy';
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! Welcome to ${businessName}. I'm your AI Admissions Counselor. You can ask me about our 2-Year NEET & JEE programs, 1-Year Droppers batches, class timings, sample fee structures, or the ATSE scholarship test. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const chatEndRef = useRef(null);
  const sessionIdRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
  );

  const samplePrompts = [
    "What courses do you offer?",
    "What are the NEET and JEE fees?",
    "What are the batch timings?",
    "How does the ATSE scholarship work?",
    "Can someone call me for counseling?"
  ];

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
      const data = await sendChatMessage(userText, sessionIdRef.current);
      const aiMsgObj = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || "I'm sorry, I couldn't process that response.",
        provider: data.provider,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to receive AI response. Check backend connection.');
      const errorMsgObj = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm currently unable to reach the AI engine. Please click 'Enquire / Call Back' above to leave your contact details.",
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
    <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-xl flex flex-col overflow-hidden relative">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white leading-tight">{businessName} AI</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                DEMO MODE
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-semibold border border-emerald-800">
                ● Live AI
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-normal">NEET & JEE Admissions Counselor</span>
          </div>
        </div>

        <button
          onClick={onOpenLeadForm}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-600 text-white flex items-center gap-1 transition-colors shadow-sm"
          title="Directly request a callback"
        >
          <span className="material-symbols-outlined text-[14px]">call</span>
          <span>Callback</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-blue-50/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 max-w-[90%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            } animate-fade-in`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {msg.sender === 'user' ? 'You' : 'AI'}
            </div>

            <div className="flex flex-col">
              <div
                className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-700 text-white rounded-tr-none font-medium'
                    : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span
                className={`text-[10px] text-gray-400 mt-1 ${
                  msg.sender === 'user' ? 'self-end' : 'self-start'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 mr-auto animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-[11px] font-bold">
              AI
            </div>
            <div className="bg-white border border-gray-200 rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Prompt Pills */}
      {messages.length < 5 && (
        <div className="px-4 py-2 bg-white border-t border-gray-200 flex flex-col gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-blue-600">auto_awesome</span>
            Try Asking:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="whitespace-nowrap text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-gray-700 border border-gray-200 px-3 py-1 rounded-full transition-colors"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-gray-200 flex flex-col gap-1 shrink-0">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1.5 border border-gray-200">
          <input
            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:outline-none placeholder:text-gray-400"
            placeholder="Ask about NEET/JEE batches, fees, scholarships, or type 'call me'..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="w-8 h-8 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white flex items-center justify-center transition-all shadow-sm shrink-0"
            onClick={() => handleSendMessage()}
            disabled={isLoading || inputMessage.trim() === ''}
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
        <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-medium">
          <span>Multi-turn memory active • Qwen2.5 Local AI</span>
          <span className="text-amber-600 font-semibold">● Demo Mode</span>
        </div>
      </div>

    </div>
  );
};
