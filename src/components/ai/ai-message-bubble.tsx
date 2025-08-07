// src/components/ai/ai-message-bubble.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  User, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  Copy
} from 'lucide-react';
import { AIMessage } from '@/types/ai';

interface AIMessageBubbleProps {
  message: AIMessage;
  isLatest?: boolean;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  onCopy?: (content: string) => void;
}

export function AIMessageBubble({ 
  message, 
  isLatest = false,
  onFeedback,
  onCopy 
}: AIMessageBubbleProps) {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.(message.content);
  };

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`flex gap-3 mb-4 group ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? "bg-blue-500 text-white" 
          : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
      </div>

      {/* Message Container */}
      <div className={`flex-1 max-w-xs lg:max-w-sm ${
        isUser ? "flex flex-col items-end" : "flex flex-col items-start"
      }`}>
        {/* Message Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
          isUser 
            ? "ai-message-user" 
            : "ai-message-assistant"
        } ${message.isLoading ? "animate-pulse" : ""}`}>
          {/* Loading State */}
          {message.isLoading ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>

        {/* Quick Actions for AI Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {message.suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => {
                  console.log('Quick action:', suggestion.action);
                }}
                className="text-xs h-7 px-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
              >
                {suggestion.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Message Metadata */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(message.timestamp)}</span>
          </div>

          {/* Action Buttons (only for AI messages) */}
          {!isUser && !message.isLoading && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="h-6 w-6 p-0 rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
              
              {onFeedback && (
                <>
                  <button
                    onClick={() => onFeedback(message.id, 'positive')}
                    className="h-6 w-6 p-0 rounded hover:bg-green-100 hover:text-green-600 flex items-center justify-center transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onFeedback(message.id, 'negative')}
                    className="h-6 w-6 p-0 rounded hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}