import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import chatService, { ChatMessage } from '../services/chatService';

interface ChatBotProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function ChatBot({ onClose, isModal = false }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI cybersecurity assistant. I can help you with CTF challenges, security concepts, secure coding practices, and answer any cybersecurity questions. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check backend health on mount
    checkHealth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkHealth = async () => {
    const healthy = await chatService.checkHealth();
    setIsConnected(healthy);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage.content);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsConnected(true);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting to the AI service. Please make sure the backend server is running on port 3001. You can start it by running `npm run dev:backend` in the server directory.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearHistory = async () => {
    await chatService.clearHistory();
    setMessages([
      {
        role: 'assistant',
        content: 'Chat history cleared! How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ChatContainer = isModal ? 'div' : 'div';

  return (
    <ChatContainer
      className={isModal ? 'fixed inset-0 z-50 flex items-center justify-center p-4' : 'h-full flex flex-col'}
    >
      {isModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`relative w-full ${
          isModal ? 'max-w-4xl max-h-[90vh]' : 'h-full'
        } border border-cyan-400/30 rounded-lg bg-[#0b0f1a] flex flex-col shadow-[0_0_30px_rgba(8,247,254,0.1)]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
              <Bot className="text-cyan-400" size={20} />
            </div>
            <div>
              <div className="text-cyan-300 font-semibold">AI Cybersecurity Assistant</div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected === true
                      ? 'bg-green-400'
                      : isConnected === false
                      ? 'bg-red-400'
                      : 'bg-yellow-400'
                  }`}
                />
                {isConnected === true
                  ? 'Connected'
                  : isConnected === false
                  ? 'Disconnected'
                  : 'Connecting...'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear chat history"
            >
              <Trash2 size={18} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 self-start">
                  <Bot className="text-cyan-400" size={16} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-100'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-200'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.timestamp && (
                  <div className="text-xs text-slate-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="p-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-400/30 self-start">
                  <User className="text-fuchsia-400" size={16} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
                <Bot className="text-cyan-400" size={16} />
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <Loader2 className="text-cyan-400 animate-spin" size={16} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about cybersecurity..."
              className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </ChatContainer>
  );
}

