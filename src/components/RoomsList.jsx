import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimeRemaining } from '../utils/helpers';
import { getDeviceId } from '../utils/identity';
import useStore from '../store/useStore';
// CSS file removed in favor of Tailwind

const RoomCard = ({ room, onSelect }) => {
  const [timeRemaining, setTimeRemaining] = useState(
    formatTimeRemaining(room.expires_at)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(room.expires_at));
    }, 60000);
    return () => clearInterval(interval);
  }, [room.expires_at]);

  const timeLeft = room.time_remaining;
  const expires = new Date(room.expires_at).getTime();
  const now = Date.now();
  const diff = (expires - now) / 1000;

  const isUrgent = diff < 1800; // Less than 30 mins

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -4, borderColor: 'rgba(124, 58, 237, 0.5)', boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.2)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-card-dark/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 flex flex-col min-h-[280px] relative cursor-pointer"
    >
      {/* Header with Title and Badge */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-extrabold text-white transition-colors">
          {room.title || room.name}
        </h2>
        {room.is_mine && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-primary/20 text-primary border border-primary/40 rounded-full flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(124,58,237,1)] animate-pulse"></span>
            My Vibe
          </span>
        )}
      </div>

      {/* Time Remaining */}
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-rounded text-slate-400 text-base">schedule</span>
        <span className="font-medium text-xs bg-slate-800/50 px-2 py-1 rounded text-slate-400">{timeRemaining} left for Vibe</span>
      </div>

      {/* Description */}
      <div className="flex-grow">
        {room.description && (
          <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">
            {room.description}
          </p>
        )}
      </div>

      {/* Tags and Online Count */}
      <div className="space-y-4">
        {room.tags && Array.isArray(room.tags) && room.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {room.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="bg-white/5 border border-white/10 text-[11px] font-semibold px-3 py-1 rounded-full text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-slate-300 font-semibold">
          <span className="material-symbols-rounded text-lg">group</span>
          <span className="text-sm">{room.active_users} joined</span>
        </div>
      </div>
    </motion.div>
  );
};

const RoomsList = ({ location, onJoinRoom, onCreateRoom }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rooms = useStore((state) => state.rooms);
  const setRooms = useStore((state) => state.setRooms);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [location]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/rooms?lat=${location.lat}&lon=${location.lon}`,
        {
          headers: {
            'X-Device-ID': getDeviceId()
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch rooms');

      const data = await response.json();
      const activeRooms = data.rooms.filter(room => room.time_remaining > 0);
      setRooms(activeRooms);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-midnight p-4 md:p-8 font-display">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 text-primary">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path className="opacity-10" d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" fill="currentColor"></path>
                <path d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                <path d="M16 16L24 26L32 16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
              </svg>
            </div>
            Vibe
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-primary font-bold animate-pulse">Scanning frequencies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-midnight font-display selection:bg-primary/30">
      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        <header className="flex justify-between items-center mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 text-white">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path className="opacity-10" d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" fill="currentColor"></path>
                  <path d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  <path d="M16 16L24 26L32 16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                </svg>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Vibe
              </h1>
            </div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm w-fit">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-400">{rooms.length} active room{rooms.length !== 1 ? 's' : ''} within 5km</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-600/20 group"
            onClick={onCreateRoom}
          >
            <span className="material-symbols-rounded group-hover:rotate-90 transition-transform duration-300">add_circle</span>
            Create Vibe
          </motion.button>
        </header>
        {error ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center bg-deep-charcoal/50 rounded-3xl border border-white/5 p-8 max-w-lg mx-auto">
            <span className="material-symbols-rounded text-4xl text-red-500 mb-4">signal_disconnected</span>
            <p className="text-red-400 mb-6 font-bold text-lg">{error}</p>
            <button
              className="text-white bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full font-bold transition-colors"
              onClick={() => window.location.reload()}
            >
              Reconnect
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center flex-1 text-center py-20 px-4"
          >
            <div className="w-32 h-32 bg-deep-charcoal border border-white/5 rounded-full flex items-center justify-center text-primary mb-8 relative group cursor-pointer" onClick={onCreateRoom}>
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20"></div>
              <span className="material-symbols-rounded text-6xl group-hover:scale-110 transition-transform duration-300">forum</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-3">It's quiet... too quiet.</h2>
            <p className="text-slate-400 mb-8 max-w-sm font-medium text-lg">
              Be the spark! Start a room and let people nearby join the vibe.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-deep-charcoal text-white border border-white/10 hover:border-primary/50 hover:text-primary px-10 py-4 rounded-full font-bold transition-all duration-300 text-lg flex items-center gap-3"
              onClick={onCreateRoom}
            >
              Start the Vibe
            </motion.button>
          </motion.div>
        ) : (
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {rooms.map((room) => (
                <RoomCard
                  key={room.id || room._id}
                  room={room}
                  onSelect={() => onJoinRoom(room.id || room._id)}
                />
              ))}
            </AnimatePresence>

            {/* Discover More Card */}
            <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-all duration-300 min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-rounded text-slate-500">explore</span>
              </div>
              <h3 className="font-bold text-slate-500">Discover more</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-[150px]">Pull to refresh and see what's popping near you</p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default RoomsList;
