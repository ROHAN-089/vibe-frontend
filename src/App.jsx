import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import LocationGate from './components/LocationGate';
import RoomsList from './components/RoomsList';
import CreateRoomModal from './components/CreateRoomModal';
import ChatRoom from './components/ChatRoom';
import useStore from './store/useStore';
import { getCachedLocation } from './utils/location';

function App() {
  const {
    location, setLocation,
    view, goToRooms, goToChat, activeRoomId, reset
  } = useStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [init, setInit] = useState(true);

  useEffect(() => {
    // Initial check for cached location
    const cached = getCachedLocation();
    if (cached) {
      setLocation(cached);
      goToRooms();
    }
    setInit(false);
  }, []);

  if (init) return null;

  const handleRoomCreated = (room) => {
    setShowCreateModal(false);
    goToChat(room.id);
  };

  return (
    <div className="bg-discord-bg min-h-screen text-discord-text font-sans antialiased overflow-hidden">
      {/* Route Views */}
      <AnimatePresence mode="wait">
        {!location ? (
          <LocationGate key="location-gate" />
        ) : view === 'chat' && activeRoomId ? (
          <ChatRoom
            key="chat-room"
            roomId={activeRoomId}
            onLeave={reset}
          />
        ) : (
          <div key="rooms-list" className="relative h-full">
            <RoomsList
              location={location}
              onJoinRoom={goToChat}
              onCreateRoom={() => setShowCreateModal(true)}
            />

            <AnimatePresence>
              {showCreateModal && (
                <CreateRoomModal
                  location={location}
                  onClose={() => setShowCreateModal(false)}
                  onRoomCreated={handleRoomCreated}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
      <Analytics />
    </div>
  );
}

export default App;
