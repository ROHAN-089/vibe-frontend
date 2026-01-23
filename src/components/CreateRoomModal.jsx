import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateRoomTitle, validateRoomDescription } from '../utils/helpers';
import { getDeviceId } from '../utils/identity';
import useStore from '../store/useStore';

const CreateRoomModal = ({ location, onClose, onRoomCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    expires_in_hours: 6
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    const titleError = validateRoomTitle(formData.title);
    const descError = validateRoomDescription(formData.description);

    if (titleError) newErrors.title = titleError;
    if (descError) newErrors.description = descError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': getDeviceId()
        },
        body: JSON.stringify({
          ...formData,
          lat: location.lat,
          lon: location.lon
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create room');
      }

      const data = await response.json();
      onRoomCreated(data.room);
      onClose(); // In production, this might be handled by parent state update
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();

    if (!tag) return;

    if (formData.tags.length >= 5) {
      setErrors({ ...errors, tags: 'Maximum 5 tags allowed' });
      return;
    }

    if (formData.tags.includes(tag)) {
      setTagInput('');
      return;
    }

    if (tag.length < 2 || tag.length > 20) {
      setErrors({ ...errors, tags: 'Tags must be 2-20 characters' });
      return;
    }

    setFormData({ ...formData, tags: [...formData.tags, tag] });
    setTagInput('');
    setErrors({ ...errors, tags: null });
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-deep-charcoal rounded-3xl shadow-2xl border border-white/10 overflow-hidden font-display"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            Create Vibe
          </h2>
          <button
            className="text-slate-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Topic <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Roof Party @ Matrix"
                maxLength={60}
                className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 transition-all font-bold outline-none"
              />
              <span className="absolute right-3 bottom-3 text-xs text-slate-500 font-bold">
                {formData.title.length}/60
              </span>
            </div>
            {errors.title && <p className="text-red-400 text-xs mt-2 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Description
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's the vibe?"
                maxLength={120}
                rows={3}
                className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 resize-none transition-all font-medium outline-none"
              />
              <span className="absolute right-3 bottom-3 text-xs text-slate-500 font-bold">
                {formData.description.length}/120
              </span>
            </div>
            {errors.description && <p className="text-red-400 text-xs mt-2 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span> {errors.description}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Tags
            </label>
            <div className="bg-black/20 rounded-xl p-2 flex flex-wrap gap-2 items-center min-h-[52px] border border-white/10 focus-within:border-primary transition-all">
              {formData.tags.map((tag) => (
                <span key={tag} className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              ))}

              {formData.tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                  placeholder={formData.tags.length === 0 ? "Add tags..." : ""}
                  className="bg-transparent text-white p-2 outline-none flex-1 min-w-[100px] font-bold placeholder:text-slate-600"
                  maxLength={20}
                />
              )}
            </div>
            {errors.tags && <p className="text-red-400 text-xs mt-2 font-bold">{errors.tags}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
              <span>Expires In</span>
              <span className="text-white normal-case">{formData.expires_in_hours} {formData.expires_in_hours === 1 ? 'Hour' : 'Hours'}</span>
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={formData.expires_in_hours}
              onChange={(e) => setFormData({ ...formData, expires_in_hours: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
              <span>1h</span>
              <span>12h</span>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">error_outline</span>
              {errors.submit}
            </div>
          )}

          <div className="flex justify-center pt-4 border-t border-white/5 mt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-full font-bold shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Create Vibe
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateRoomModal;
