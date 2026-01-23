import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeviceId, getRoomIdentity, clearRoomIdentity } from '../utils/identity';
import { formatTime, formatTimeRemaining } from '../utils/helpers';
import useStore from '../store/useStore';

const ChatRoom = ({ roomId, onLeave }) => {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserForReport, setSelectedUserForReport] = useState(null);
  const [selectedMessageForReport, setSelectedMessageForReport] = useState(null);
  const [showJoinNotification, setShowJoinNotification] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch room details
  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  // Setup Socket.IO
  useEffect(() => {
    const deviceId = getDeviceId();
    const roomIdentity = getRoomIdentity(deviceId, roomId);
    setIdentity(roomIdentity);

    // Initialize socket connection only once
    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { device_id: deviceId },
        // CRITICAL: Match server config - WebSocket only
        transports: ['websocket'],
        // Reconnection settings for reliability
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      const newSocket = socketRef.current;

      newSocket.on('connect', () => {
        console.log('Connected to server');
        newSocket.emit('join_room', { room_id: roomId });
      });

      newSocket.on('joined_room', (data) => {
        setActiveUsers(data.active_users);
        setLoading(false);

        // Show join notification
        setShowJoinNotification(true);
        setTimeout(() => setShowJoinNotification(false), 5000);
      });

      newSocket.on('user_count_update', (data) => {
        setActiveUsers(data.count);
      });

      newSocket.on('message_history', (data) => {
        setMessages(data.messages);
      });

      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('error', (data) => {
        setError(data.message);
        setTimeout(() => setError(null), 5000);
      });

      setSocket(newSocket);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { room_id: roomId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      clearRoomIdentity(roomId);
    };
  }, [roomId]);

  // Update countdown timer
  useEffect(() => {
    if (!room) return;

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(room.expires_at));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [room]);

  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`);
      if (!response.ok) throw new Error('Room not found');
      const data = await response.json();
      setRoom(data);
    } catch (err) {
      setError('Failed to load room details');
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!socket || !messageInput.trim() || !identity) return;

    const text = messageInput.trim();

    if (text.length > 500) {
      setError('Message too long (max 500 characters)');
      return;
    }

    socket.emit('send_message', {
      room_id: roomId,
      text,
      username: identity.username,
      color: identity.color
    });

    setMessageInput('');
    inputRef.current?.focus();
  };

  const handleReport = async (message) => {
    if (!confirm(`Report ${message.username} for spam or abuse?`)) {
      setSelectedUserForReport(null);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': getDeviceId()
        },
        body: JSON.stringify({
          message_id: message.id,
          reason: 'inappropriate'
        })
      });

      if (response.ok) {
        alert('Report submitted. Thanks for keeping the community safe!');
      }
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setSelectedUserForReport(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-discord-bg text-discord-muted">
        <div className="w-10 h-10 border-4 border-discord-brand/30 border-t-discord-brand rounded-full animate-spin mb-4"></div>
        <div>Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-discord-bg text-discord-muted gap-4">
        <div className="text-xl">Room not found or expired</div>
        <button
          onClick={onLeave}
          className="px-6 py-2 bg-discord-brand text-white rounded-lg hover:bg-discord-brand/80"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-discord-bg overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-discord-sidebar shadow-md z-20 border-b border-discord-divider">
        <div className="flex items-center gap-4 overflow-hidden">
          <button
            className="text-discord-muted hover:text-white transition-colors p-1"
            onClick={onLeave}
          >
            ←
          </button>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-discord-muted text-xl font-light">#</span>
              <h2 className="text-white font-bold text-lg truncate leading-tight">{room.title}</h2>
            </div>
            {room.description && (
              <p className="text-xs text-discord-muted truncate mt-0.5">{room.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-discord-muted text-sm flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-discord-bg/50 px-2 py-1 rounded">
            <span className="text-green-500">●</span>
            <span>{activeUsers} Online</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-discord-bg/50 px-2 py-1 rounded font-mono">
            <span>⏱</span>
            <span>{timeRemaining}</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center opacity-70 p-8"
          >
            <div className="w-20 h-20 icon-bg rounded-full flex items-center justify-center text-4xl mb-4 bg-discord-element">
              💬
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Welcome to {room.title}!</h3>
            <p className="text-discord-muted max-w-sm">
              This is the start of this channel. Messages here are anonymous and disappear when the room expires.
            </p>
            <div className="mt-8 bg-discord-element px-4 py-2 rounded-full border border-white/5">
              You joined as <strong style={{ color: identity?.color }}>{identity?.username}</strong>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const messageId = message._id || message.id;
              const isSelected = selectedMessageForReport === messageId;
              return (
                <Message
                  key={messageId}
                  message={message}
                  messageId={messageId}
                  onReport={handleReport}
                  isMe={message.username === identity?.username}
                  isSystem={message.isSystem}
                  isSelectedForReport={isSelected}
                  onSelectForReport={() => {
                    console.log('Selected message ID:', messageId);
                    setSelectedMessageForReport(messageId);
                  }}
                  onCancelReport={() => {
                    console.log('Cancelled report');
                    setSelectedMessageForReport(null);
                  }}
                />
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Join Notification */}
      <AnimatePresence>
        {showJoinNotification && identity && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-discord-brand text-white px-6 py-3 rounded-lg shadow-lg z-30 font-medium text-sm flex items-center gap-3"
          >
            <span className="text-xl">👋</span>
            <span>You joined as <strong style={{ color: identity.color }}>{identity.username}</strong></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-auto bg-discord-red text-white px-4 py-2 rounded shadow-lg z-30 font-medium text-sm flex items-center gap-2"
          >
            <span>⚠️</span> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 bg-discord-sidebar/50 z-20">
        <form
          className="flex items-center gap-3 bg-discord-element px-4 py-3 rounded-xl border border-transparent focus-within:border-discord-brand/50 transition-all shadow-sm relative"
          onSubmit={handleSendMessage}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed border-discord-muted/30 text-discord-muted cursor-help" title={`You are ${identity?.username}`}>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: identity?.color }}></div>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-discord-text placeholder-discord-muted/60 outline-none font-medium"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message #${room.title}`}
            maxLength={500}
            disabled={!socket}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || !socket}
            className="text-discord-muted hover:text-discord-brand disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-discord-muted mt-2 opacity-60">
          Messages are public to nearby users. Do not share personal info.
        </p>
      </div>
    </div>
  );
};

const Message = ({ message, messageId, onReport, isMe, isSystem, isSelectedForReport, onSelectForReport, onCancelReport }) => {
  const [showMenu, setShowMenu] = useState(false);

  // System messages
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-2"
      >
        <div className="bg-discord-element/50 text-discord-muted px-4 py-2 rounded-full text-sm border border-white/5">
          {message.text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`group flex items-start gap-4 hover:bg-black/5 p-2 rounded -ml-2 transition-colors relative ${isSelectedForReport ? 'bg-discord-red/10 border-l-4 border-discord-red' : ''}`}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm mt-0.5 flex-shrink-0"
        style={{ backgroundColor: message.color }}
      >
        {message.username.substring(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className={`font-bold ${!isMe ? 'hover:underline cursor-pointer' : ''}`}
            style={{ color: message.color }}
            onClick={(e) => {
              if (!isMe) {
                e.stopPropagation();
                onSelectForReport();
              }
            }}
            title={!isMe ? 'Click to report this message' : ''}
          >
            {message.username}
          </span>
          <span className="text-[10px] text-discord-muted">
            {formatTime(message.created_at)}
          </span>
          {isSelectedForReport && (
            <span className="text-xs text-discord-red font-semibold animate-pulse">
              Click report icon →
            </span>
          )}
        </div>
        <p className="text-discord-text whitespace-pre-wrap break-words leading-relaxed text-[15px]">
          {message.text}
        </p>
      </div>

      {/* Action Menu - Only show on THIS specific selected message */}
      {isSelectedForReport && (
        <div className="absolute right-4 -top-2 bg-discord-sidebar border border-discord-divider shadow-lg rounded flex items-center overflow-hidden z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReport(message);
            }}
            className="p-1.5 bg-discord-red/20 hover:bg-discord-red/30 text-discord-red transition-colors animate-pulse"
            title="Confirm Report"
          >
            🚨
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancelReport();
            }}
            className="p-1.5 hover:bg-discord-element text-discord-muted transition-colors text-xs"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ChatRoom;
