import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  GripVertical,
  Loader2,
  Bot,
  User,
  Minimize2,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage, ChatRequest, ChatResponse } from '../types/chat';

const WIDGET_WIDTH = 380;
const COLLAPSED_SIZE = 56;

const ChatWidget: React.FC = () => {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Widget state
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('chatWidgetPosition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: window.innerWidth - WIDGET_WIDTH - 24, y: window.innerHeight - 500 };
      }
    }
    return { x: window.innerWidth - WIDGET_WIDTH - 24, y: window.innerHeight - 500 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    if ((e.target as HTMLElement).closest('input')) return;
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('textarea')) return;

    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const width = isExpanded ? WIDGET_WIDTH : COLLAPSED_SIZE;
      const height = widgetRef.current?.offsetHeight || COLLAPSED_SIZE;

      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Constrain to viewport
      const padding = 16;
      newX = Math.max(padding, Math.min(window.innerWidth - width - padding, newX));
      newY = Math.max(padding, Math.min(window.innerHeight - height - padding, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem('chatWidgetPosition', JSON.stringify(position));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset, isExpanded, position]);

  // Send message to API
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Build messages array for API (without id and timestamp)
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const request: ChatRequest = {
        messages: apiMessages,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Collapsed state - floating button
  if (!isExpanded) {
    return (
      <div
        ref={widgetRef}
        className="fixed z-50"
        style={{ left: position.x, top: position.y }}
      >
        <button
          onClick={() => setIsExpanded(true)}
          onMouseDown={handleMouseDown}
          className={`
            w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
            shadow-lg border-2 border-white
            flex items-center justify-center
            hover:shadow-xl hover:scale-105 active:scale-95
            transition-all duration-200 group
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          `}
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Expanded state
  return (
    <div
      ref={widgetRef}
      className="fixed z-50"
      style={{ left: position.x, top: position.y, width: WIDGET_WIDTH }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[480px]">
        {/* Header - Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`
            bg-gradient-to-r from-blue-500 to-blue-600 text-white
            px-4 py-3 flex items-center justify-between
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            select-none
          `}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-blue-200" />
            <Bot className="w-5 h-5" />
            <h2 className="font-semibold text-sm">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="no-drag p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsExpanded(false);
                setMessages([]);
                setError(null);
              }}
              className="no-drag p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-blue-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Hi! I'm your AI assistant. Ask me anything about your sales data.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-2.5 text-sm
                  ${message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md shadow-sm'
                  }
                `}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your sales data..."
              disabled={isLoading}
              className="no-drag flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="no-drag w-10 h-10 rounded-full bg-blue-500 text-white
                flex items-center justify-center
                hover:bg-blue-600 active:scale-95 transition-all
                disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
