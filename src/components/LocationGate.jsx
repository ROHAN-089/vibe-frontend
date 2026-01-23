import { useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentLocation, cacheLocation } from '../utils/location';
import useStore from '../store/useStore';

const LocationGate = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const setLocation = useStore((state) => state.setLocation);
  const goToRooms = useStore((state) => state.goToRooms);

  const handleAllowLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      cacheLocation(location);
      setLocation(location);
      goToRooms();
    } catch (err) {
      console.error(err);
      if (err.code === 1) {
        setError('Location permission denied. Please allow access.');
      } else if (err.code === 2) {
        setError('Location unavailable. Try again.');
      } else {
        setError('Timeout. Please check your connection.');
      }
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Vibe - Connect Near You',
          text: 'Check out Vibe! Anonymous, ephemeral chat rooms near you.',
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // Here you could also send analytics or save to local storage
  };

  return (
    <div className="bg-midnight text-slate-100 font-display overflow-x-hidden antialiased selection:bg-primary/30 min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/10 bg-midnight/80 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-1.5 sm:gap-2 text-white">
          <div className="flex items-center justify-center size-7 sm:size-8 text-primary shadow-neon-pink rounded-full overflow-hidden">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path className="opacity-10" d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" fill="currentColor"></path>
              <path d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
              <path d="M16 16L24 26L32 16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Vibe</h2>
        </div>
        <button
          onClick={() => setShowAppModal(true)}
          className="flex min-w-[70px] sm:min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-4 sm:px-6 border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">Get App</span>
        </button>
      </header>

      <main className="flex-grow flex flex-col">
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="City at night with neon lights and lively atmosphere"
              className="w-full h-full object-cover scale-105 opacity-70"
              src="https://res.cloudinary.com/dnuhcjztp/image/upload/v1768992031/download_sfontp.png"
            />
            <div className="absolute inset-0 bg-midnight/70 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 hero-gradient"></div>
          </div>

          <div className="relative z-10 py-12 md:py-24 max-w-[1100px] w-full flex flex-col gap-10 items-center justify-center text-center">

            <div className="flex flex-col gap-6 max-w-4xl">
              <h1 className="text-white text-6xl md:text-8xl font-black leading-[1.05] tracking-[-0.04em]">
                Vibe — What’s <br /><span className="text-electric-blue neon-text-blue">happening</span> near you.
              </h1>
              <h2 className="text-slate-200 text-xl md:text-2xl font-semibold leading-normal bg-black/40 backdrop-blur-md self-center px-6 py-2 rounded-full border border-white/10">
                Check your area’s Vibe.
              </h2>
            </div>

            {error && (
              <div className="w-full max-w-md p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-bold">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-2">
              <button
                onClick={handleAllowLocation}
                disabled={loading}
                className="group relative flex w-full sm:min-w-[280px] max-w-[320px] sm:max-w-none cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 sm:h-20 px-8 sm:px-10 bg-blue-600 hover:bg-blue-500 text-white text-xl sm:text-2xl font-extrabold shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2 sm:gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-lg sm:text-2xl">Locating...</span>
                  </span>
                ) : (
                  <>
                    <span className="mr-2 sm:mr-3 material-symbols-outlined text-2xl sm:text-3xl group-hover:rotate-12 transition-transform">explore</span>
                    <span className="truncate text-lg sm:text-2xl">Find rooms nearby</span>
                  </>
                )}
              </button>

              <p className="text-slate-400 text-xs sm:text-sm md:text-base font-medium flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/5 max-w-[90%] sm:max-w-none text-center">
                <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-electric-blue">verified_user</span>
                <span>Your exact location is never shared. Rooms auto-delete. No profiles.</span>
              </p>
            </div>

            <div className="mt-4 sm:mt-8 w-full max-w-sm px-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -4, borderColor: 'rgba(124, 58, 237, 0.5)', boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.2)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-card-dark/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col min-h-[180px] sm:min-h-[200px] relative cursor-pointer"
              >
                {/* Header with Title */}
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white transition-colors line-clamp-2">
                    SSR Rooftop party
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500/20 text-green-400 border border-green-500/40 rounded-full flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,1)] animate-pulse"></span>
                    <span className="hidden sm:inline">My Vibe</span>
                    <span className="sm:hidden">Live</span>
                  </span>
                </div>

                {/* Time Remaining */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  <span className="material-symbols-rounded text-slate-400 text-sm sm:text-base">schedule</span>
                  <span className="font-medium text-[10px] sm:text-xs bg-slate-800/50 px-2 py-0.5 sm:py-1 rounded text-slate-400">2h 45m left</span>
                </div>

                {/* Description */}
                <div className="flex-grow mb-3 sm:mb-4">
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed italic line-clamp-2">
                    Is this place good for Chill vibes, rooftop views, and great conversation
                  </p>
                </div>

                {/* Online Count */}
                <div className="pt-3 sm:pt-4 border-t border-white/5 flex items-center gap-1.5 sm:gap-2 text-slate-300 font-semibold">
                  <span className="material-symbols-rounded text-base sm:text-lg">group</span>
                  <span className="text-xs sm:text-sm">856 joined</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-black/50 relative z-10">
          <div className="max-w-[1100px] mx-auto w-full relative">
            <div className="flex flex-col gap-10 sm:gap-16">
              <div className="flex flex-col gap-3 sm:gap-4 text-center items-center">
                <span className="px-3 sm:px-4 py-1 bg-vibrant-purple/20 text-vibrant-purple border border-vibrant-purple/30 font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-full">Discovery</span>
                <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">How it works</h2>
                <p className="text-slate-400 text-base sm:text-lg max-w-md font-medium px-4">Simple, anonymous, and ephemeral.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Step 1 */}
                <div className="group flex flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-deep-charcoal/90 to-deep-charcoal/60 backdrop-blur-xl p-6 sm:p-10 hover:border-electric-blue/60 hover:shadow-[0_0_40px_rgba(14,165,233,0.15)] transition-all duration-500">
                  <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-electric-blue/20 to-electric-blue/5 flex items-center justify-center text-electric-blue group-hover:scale-110 group-hover:from-electric-blue group-hover:to-blue-400 group-hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl font-bold">near_me</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <h3 className="text-white text-xl sm:text-2xl font-extrabold leading-tight group-hover:text-electric-blue transition-colors">Join rooms near you</h3>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium group-hover:text-slate-300 transition-colors">Instantly discover chat rooms within a ≈5 km radius. See what's trending around the corner.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group flex flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-deep-charcoal/90 to-deep-charcoal/60 backdrop-blur-xl p-6 sm:p-10 hover:border-primary/60 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-500">
                  <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover:from-primary group-hover:to-purple-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl font-bold">domino_mask</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <h3 className="text-white text-xl sm:text-2xl font-extrabold leading-tight group-hover:text-primary transition-colors">Chat anonymously</h3>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium group-hover:text-slate-300 transition-colors">No profiles, no history, just vibes. Express yourself freely without the social pressure.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group flex flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-deep-charcoal/90 to-deep-charcoal/60 backdrop-blur-xl p-6 sm:p-10 hover:border-vibrant-purple/60 hover:shadow-[0_0_40px_rgba(138,43,226,0.15)] transition-all duration-500">
                  <div className="size-16 sm:size-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-vibrant-purple/20 to-vibrant-purple/5 flex items-center justify-center text-vibrant-purple group-hover:scale-110 group-hover:from-vibrant-purple group-hover:to-purple-600 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(138,43,226,0.3)]">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl font-bold">hourglass_top</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <h3 className="text-white text-xl sm:text-2xl font-extrabold leading-tight group-hover:text-vibrant-purple transition-colors">It all disappears</h3>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-medium group-hover:text-slate-300 transition-colors">Rooms and chats auto-delete after a few hours of inactivity. The night is ephemeral, so is Vibe.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-deep-charcoal py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[960px] mx-auto flex flex-col gap-8 sm:gap-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-3 text-white">
              <div className="size-7 sm:size-8 bg-primary rounded-full flex items-center justify-center text-white shadow-neon-pink overflow-hidden">
                <svg className="w-full h-full p-1" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path className="opacity-10" d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" fill="currentColor"></path>
                  <path d="M24 44C24 44 40 32 40 18C40 9.16344 32.8366 2 24 2C15.1634 2 8 9.16344 8 18C8 32 24 44 24 44Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  <path d="M16 16L24 26L32 16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                </svg>
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight">Vibe</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <a className="text-slate-400 hover:text-primary text-xs sm:text-sm font-bold transition-colors" href="#">Privacy Policy</a>
              <a className="text-slate-400 hover:text-primary text-xs sm:text-sm font-bold transition-colors" href="#">Terms of Service</a>
              <a className="text-slate-400 hover:text-primary text-xs sm:text-sm font-bold transition-colors" href="#">Contact</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-6 sm:pt-8 gap-4">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">© 2026 Vibe. All rights reserved.</p>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={handleShare}
                className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-electric-blue transition-colors cursor-pointer hover:border-electric-blue/50 hover:bg-electric-blue/10"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </button>
              <button
                onClick={handleLike}
                className={`size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all cursor-pointer ${liked
                  ? 'text-red-500 border-red-500/50 bg-red-500/10'
                  : 'text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/10'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">{liked ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* App Development Modal */}
      {showAppModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowAppModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-deep-charcoal border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-md w-full mx-4 text-center relative"
          >
            <button
              onClick={() => setShowAppModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
            </button>

            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-primary to-vibrant-purple flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-white">construction</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 sm:mb-4">App Coming Soon!</h3>
            <p className="text-slate-400 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
              We're building something amazing. The mobile app is currently under development.
            </p>
            <p className="text-primary font-bold text-sm">
              For now, enjoy Vibe on the web! 🎉
            </p>

            <button
              onClick={() => setShowAppModal(false)}
              className="mt-6 sm:mt-8 bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold transition-all text-sm sm:text-base"
            >
              Got it!
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LocationGate;
