/**
 * FIX 1: SNAP TO GRID - Round coordinates to kill GPS jitter
 * Precision 2 = ~1km stability (perfect for 5km geohash cells)
 */
export const snapCoordinate = (value, precision = 2) => {
  return Number(value.toFixed(precision));
};

/**
 * Calculate distance between two points (Haversine formula)
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Encode geolocation to geohash (client-side)
 * Uses simple geohash encoding
 */
export const encodeGeohash = (lat, lon, precision = 6) => {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      // longitude
      const lonMid = (lonMin + lonMax) / 2;
      if (lon > lonMid) {
        idx = (idx << 1) + 1;
        lonMin = lonMid;
      } else {
        idx = idx << 1;
        lonMax = lonMid;
      }
    } else {
      // latitude
      const latMid = (latMin + latMax) / 2;
      if (lat > latMid) {
        idx = (idx << 1) + 1;
        latMin = latMid;
      } else {
        idx = idx << 1;
        latMax = latMid;
      }
    }
    evenBit = !evenBit;

    if (++bit === 5) {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
};

/**
 * FIX 2: GEOHASH STICKINESS - Session-locked geohash
 * Prevents flickering and room list changes from GPS jitter
 */
const GEOHASH_KEY = 'stable_geohash';
const LOCATION_KEY = 'stable_location';
const MOVEMENT_THRESHOLD_KM = 2; // Only update if moved > 2km

/**
 * Get stable location with all 3 layers of protection:
 * 1. Snap coordinates to grid
 * 2. Session-sticky geohash
 * 3. Movement threshold
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Raw GPS coordinates
        const rawLat = position.coords.latitude;
        const rawLon = position.coords.longitude;

        // FIX 1: SNAP TO GRID - Kill GPS jitter
        const lat = snapCoordinate(rawLat, 2);
        const lon = snapCoordinate(rawLon, 2);
        const newGeohash = encodeGeohash(lat, lon, 6);

        // FIX 2: Check if we have a stable location in session
        const storedGeohash = sessionStorage.getItem(GEOHASH_KEY);
        const storedLocation = sessionStorage.getItem(LOCATION_KEY);

        if (storedGeohash && storedLocation) {
          const stored = JSON.parse(storedLocation);

          // FIX 3: MOVEMENT THRESHOLD - Only update if significant movement
          const distanceMoved = calculateDistance(
            stored.lat, stored.lon,
            lat, lon
          );

          if (distanceMoved < MOVEMENT_THRESHOLD_KM) {
            // Still in same area - return stable location
            console.log(`📍 Location stable (moved ${distanceMoved.toFixed(2)}km < ${MOVEMENT_THRESHOLD_KM}km threshold)`);
            resolve({
              lat: stored.lat,
              lon: stored.lon,
              geohash: storedGeohash
            });
            return;
          } else {
            // Significant movement detected
            console.log(`🚶 Moved ${distanceMoved.toFixed(2)}km - updating location`);
          }
        }

        // Store new stable location
        sessionStorage.setItem(GEOHASH_KEY, newGeohash);
        sessionStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lon }));

        console.log(`📍 Location locked: ${newGeohash} (${lat}, ${lon})`);
        resolve({ lat, lon, geohash: newGeohash });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  });
};

/**
 * Force refresh location (for manual "refresh location" button)
 */
export const forceRefreshLocation = () => {
  sessionStorage.removeItem(GEOHASH_KEY);
  sessionStorage.removeItem(LOCATION_KEY);
  console.log('🔄 Location cache cleared - will fetch fresh on next request');
  return getCurrentLocation();
};

/**
 * Store location in localStorage (cache)
 */
export const cacheLocation = (location) => {
  localStorage.setItem('cached_location', JSON.stringify({
    ...location,
    timestamp: Date.now()
  }));
};

/**
 * Get cached location (if fresh)
 */
export const getCachedLocation = () => {
  const cached = localStorage.getItem('cached_location');
  if (!cached) return null;

  try {
    const data = JSON.parse(cached);
    const age = Date.now() - data.timestamp;

    // Cache valid for 5 minutes
    if (age < 5 * 60 * 1000) {
      return { lat: data.lat, lon: data.lon, geohash: data.geohash };
    }
  } catch (e) {
    // Invalid cache
  }

  return null;
};
