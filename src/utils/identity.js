/**
 * Generate device ID if not exists
 * Stored in localStorage
 */
export const getDeviceId = () => {
  if (typeof window === 'undefined') return null;

  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

/**
 * Simple hash function for deterministic name generation
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Curated color palette (Discord-style, accessible)
const COLORS = [
  "#5865F2", // blurple
  "#57F287", // green
  "#ED4245", // red
  "#FEE75C", // yellow
  "#EB459E", // pink
  "#3498DB", // blue
  "#9B59B6", // purple
  "#1ABC9C", // turquoise
  "#E67E22", // orange
  "#95A5A6", // gray
];

// Adjectives for name generation
const ADJECTIVES = [
  "Blue", "Red", "Green", "Gold", "Silver", "Quiet", "Loud", "Swift",
  "Slow", "Bright", "Dark", "Neon", "Pixel", "Cosmic", "Crystal",
  "Fire", "Ice", "Storm", "Wind", "Shadow", "Light", "Wild", "Calm",
  "Bold", "Shy", "Wise", "Happy", "Sleepy", "Active", "Silent",
  "Electric", "Mystic", "Ancient", "Modern", "Turbo", "Mega", "Ultra"
];

// Animals/Objects for name generation
const NOUNS = [
  "Fox", "Tiger", "Bear", "Owl", "Wolf", "Cat", "Dog", "Lion",
  "Eagle", "Hawk", "Raven", "Dove", "Panda", "Koala", "Rabbit",
  "Dragon", "Phoenix", "Unicorn", "Ninja", "Wizard", "Knight", "Pirate",
  "Robot", "Cyborg", "Ghost", "Alien", "Zombie", "Goblin", "Elf",
  "Dwarf", "Giant", "Mage", "Warrior", "Hunter", "Scout", "Ranger"
];

/**
 * Generate deterministic username and color for a room
 * Same device + same room = same name & color
 * Different room = different name & color
 * 
 * @param {string} deviceId - User's device UUID
 * @param {string} roomId - Room ID
 * @returns {object} { username, color }
 */
export const generateRoomIdentity = (deviceId, roomId) => {
  if (!deviceId || !roomId) {
    return {
      username: "Anonymous",
      color: COLORS[0]
    };
  }

  // Create seed from device + room
  const seed = simpleHash(deviceId + roomId);

  // Generate deterministic name
  const adjectiveIndex = seed % ADJECTIVES.length;
  const nounIndex = Math.floor(seed / ADJECTIVES.length) % NOUNS.length;
  const username = ADJECTIVES[adjectiveIndex] + NOUNS[nounIndex];

  // Generate deterministic color
  const colorIndex = seed % COLORS.length;
  const color = COLORS[colorIndex];

  return { username, color };
};

/**
 * Store room-specific identity in session storage
 * (For reconnect safety within session)
 */
export const getRoomIdentity = (deviceId, roomId) => {
  const key = `identity_${roomId}`;
  const stored = sessionStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Fall through to generate new
    }
  }

  const identity = generateRoomIdentity(deviceId, roomId);
  sessionStorage.setItem(key, JSON.stringify(identity));
  return identity;
};

/**
 * Clear room identity (when leaving room)
 */
export const clearRoomIdentity = (roomId) => {
  const key = `identity_${roomId}`;
  sessionStorage.removeItem(key);
};
