// src/components/ai/ai-assistant-button.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  X, 
  Minimize2,
  Sparkles
} from 'lucide-react';
import { useAIStore } from '@/lib/store/ai-store';

export function AIAssistantButton() {
  const {
    isOpen,
    isMinimized,
    unreadSuggestions,
    toggleChat,
    openChat,
    minimizeChat,
    preferences,
  } = useAIStore();

  const [isHovered, setIsHovered] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  // Pulse animation for new suggestions
  useEffect(() => {
    if (unreadSuggestions > 0 && !isOpen) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadSuggestions, isOpen]);

  if (!preferences.enabled) return null;

  return (
    <div className="fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
      <AnimatePresence>
        {/* Main AI Button */}
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={toggleChat}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`ai-assistant-button ${shouldPulse ? 'ai-pulse-animation' : ''}`}
          >
            {/* Main Icon */}
            <Brain className="w-7 h-7 text-white relative z-10" />
            
            {/* Notification Badge */}
            <AnimatePresence>
              {unreadSuggestions > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="ai-notification-badge"
                >
                  {unreadSuggestions > 9 ? '9+' : unreadSuggestions}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sparkle Effects */}
            <AnimatePresence>
              {isHovered && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1.2, 1],
                      opacity: [0, 1, 0],
                      rotate: 180
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        {/* Minimized Chat State */}
        {isOpen && isMinimized && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-xs text-gray-500">Ready to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={openChat}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-gray-500" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleChat}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>
            </div>
            
            {unreadSuggestions > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">
                    {unreadSuggestions} new suggestion{unreadSuggestions > 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl whitespace-nowrap"
          >
            AI Assistant
            {unreadSuggestions > 0 && (
              <span className="ml-2 text-blue-300">
                ({unreadSuggestions} new)
              </span>
            )}
            <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}