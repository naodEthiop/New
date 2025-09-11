import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Volume2, VolumeX, MoreVertical, Flag, UserX, UserCheck } from 'lucide-react';
import { ChatMessage } from '../types/game';
import { websocketService } from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface GameChatProps {
  gameId: string;
  messages: ChatMessage[];
  isEnabled?: boolean;
  onSendMessage?: (message: string) => void;
  onEmote?: (emote: string) => void;
  onReportPlayer?: (playerId: string, reason: string) => void;
  onBlockPlayer?: (playerId: string) => void;
  onUnblockPlayer?: (playerId: string) => void;
  className?: string;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀',
  '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽'
];

const SYSTEM_MESSAGES = [
  '🎉 Welcome to the game!',
  '🎯 Good luck everyone!',
  '🏆 Great game!',
  '👏 Well played!',
  '🔥 Hot streak!',
  '💪 Keep going!',
  '🎊 Almost there!',
  '⭐ Amazing!',
  '🚀 You got this!',
  '💎 Diamond play!'
];

const GameChat: React.FC<GameChatProps> = ({
  gameId,
  messages,
  isEnabled = true,
  onSendMessage,
  onEmote,
  onReportPlayer,
  onBlockPlayer,
  onUnblockPlayer,
  className = ''
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showSystemMessages, setShowSystemMessages] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayerMenu, setShowPlayerMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle WebSocket events
  useEffect(() => {
    const handleChatMessage = (data: any) => {
      if (data.gameId === gameId) {
        // Message will be handled by parent component
      }
    };

    const handleSystemMessage = (data: any) => {
      if (data.gameId === gameId) {
        toast(data.message, {
          icon: '🎮',
          duration: 3000,
        });
      }
    };

    websocketService.on('chat_message', handleChatMessage);
    websocketService.on('system_message', handleSystemMessage);

    return () => {
      websocketService.off('chat_message', handleChatMessage);
      websocketService.off('system_message', handleSystemMessage);
    };
  }, [gameId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isEnabled) return;

    if (onSendMessage) {
      onSendMessage(message.trim());
    } else {
      websocketService.sendChatMessage({
        message: message.trim(),
        gameId,
        type: 'text'
      });
    }
    setMessage('');
  };

  const handleEmoteClick = (emote: string) => {
    if (onEmote) {
      onEmote(emote);
    } else {
      websocketService.sendEmote(gameId, emote);
    }
    setShowEmojis(false);
  };

  const handleSystemMessageClick = (systemMsg: string) => {
    if (onSendMessage) {
      onSendMessage(systemMsg);
    } else {
      websocketService.sendChatMessage({
        message: systemMsg,
        gameId,
        type: 'text'
      });
    }
    setShowSystemMessages(false);
  };

  const handlePlayerAction = (playerId: string, action: 'report' | 'block' | 'unblock') => {
    switch (action) {
      case 'report':
        const reason = prompt('Please enter the reason for reporting this player:');
        if (reason && onReportPlayer) {
          onReportPlayer(playerId, reason);
        }
        break;
      case 'block':
        if (onBlockPlayer) {
          onBlockPlayer(playerId);
        }
        break;
      case 'unblock':
        if (onUnblockPlayer) {
          onUnblockPlayer(playerId);
        }
        break;
    }
    setShowPlayerMenu(null);
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getMessageClasses = (msg: ChatMessage): string => {
    const baseClasses = 'p-3 rounded-lg mb-2 max-w-[85%] break-words';
    
    if (msg.type === 'system') {
      return `${baseClasses} bg-blue-500/20 text-blue-200 mx-auto text-center`;
    }
    
    if (msg.playerId === user?.uid) {
      return `${baseClasses} bg-blue-500 text-white ml-auto`;
    }
    
    return `${baseClasses} bg-gray-700 text-white`;
  };

  const renderMessage = (msg: ChatMessage) => {
    if (msg.type === 'system') {
      return (
        <div className="text-center text-sm text-gray-400 mb-2">
          {msg.message}
        </div>
      );
    }

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-2 ${msg.playerId === user?.uid ? 'flex-row-reverse' : ''}`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
            {msg.playerName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${msg.playerId === user?.uid ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">{msg.playerName}</span>
            <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
            {msg.playerId !== user?.uid && (
              <button
                onClick={() => setShowPlayerMenu(showPlayerMenu === msg.playerId ? null : msg.playerId)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className={getMessageClasses(msg)}>
            {msg.type === 'emote' ? (
              <span className="text-2xl">{msg.message}</span>
            ) : (
              <span>{msg.message}</span>
            )}
          </div>

          {/* Player Menu */}
          <AnimatePresence>
            {showPlayerMenu === msg.playerId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 z-10"
                style={{ top: '100%', left: '0', marginTop: '4px' }}
              >
                <button
                  onClick={() => handlePlayerAction(msg.playerId, 'report')}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
                <button
                  onClick={() => handlePlayerAction(msg.playerId, 'block')}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-400 hover:bg-orange-500/20 rounded transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  Block
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  if (!isEnabled) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 text-center text-gray-400 ${className}`}>
        Chat is disabled for this game
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 flex flex-col h-96 ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Game Chat</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        <AnimatePresence>
          {messages.map(renderMessage)}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-3 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Emojis"
          >
            <Smile className="w-5 h-5 text-gray-400" />
          </button>

          {/* System Messages Button */}
          <button
            type="button"
            onClick={() => setShowSystemMessages(!showSystemMessages)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Quick Messages"
          >
            <span className="text-lg">💬</span>
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isMuted}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isMuted}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Send Message"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
                {EMOJIS.map((emote, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmoteClick(emote)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors text-lg"
                  >
                    {emote}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Messages Picker */}
        <AnimatePresence>
          {showSystemMessages && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="grid grid-cols-1 gap-1">
                {SYSTEM_MESSAGES.map((systemMsg, index) => (
                  <button
                    key={index}
                    onClick={() => handleSystemMessageClick(systemMsg)}
                    className="p-2 text-left hover:bg-gray-700 rounded transition-colors text-sm text-gray-300"
                  >
                    {systemMsg}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameChat;
