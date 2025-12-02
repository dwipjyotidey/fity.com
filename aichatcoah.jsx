import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function ChatCoach() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm your AI fitness coach. I'm here to help you stay motivated, answer questions about workouts and nutrition, and keep you on track with your goals. What's on your mind today? 💪"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "I need motivation today",
    "Suggest a workout for me",
    "How do I stay consistent?",
    "Nutrition tips for weight loss"
  ];

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    const systemPrompt = `You are Fity, an empathetic and motivating AI fitness coach. Your role:

- Provide encouragement and accountability
- Answer questions about workouts, nutrition, and recovery
- Be supportive but honest about realistic expectations
- Use casual, friendly tone (like a gym buddy)
- Keep responses concise (2-4 sentences) unless detailed explanation is needed
- Use emojis naturally to add warmth

User is asking for guidance. Be helpful, positive, and actionable.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: systemPrompt,
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }))
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto h-screen flex flex-col">
        <div className="bg-white rounded-t-2xl shadow-xl p-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Chat with Fity</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Always here to help
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white shadow-xl overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={16} />
                </div>
              )}
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-gray-600" size={16} />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={16} />
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="bg-white shadow-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <Sparkles size={16} className="text-purple-600" />
              <span className="font-semibold">Quick Questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(reply)}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm hover:bg-purple-200 transition"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-b-2xl shadow-xl p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 Tip: Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
