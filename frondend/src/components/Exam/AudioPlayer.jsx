import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

// Simple registry to share a single HTMLAudioElement across multiple renderers by key
const sharedAudioRegistry = {};

const AudioPlayer = ({ audioUrl, sharedKey }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const localIsSharedOwnerRef = useRef(false);

  // Setup shared or local audio element and bind events
  useEffect(() => {
    let audio;

    if (sharedKey) {
      // Ensure a shared audio exists for this key
      if (!sharedAudioRegistry[sharedKey]) {
        const sharedAudio = new Audio(audioUrl || undefined);
        sharedAudio.preload = 'metadata';
        sharedAudioRegistry[sharedKey] = {
          audio: sharedAudio,
          subscribers: new Set(),
          src: audioUrl || ''
        };
        localIsSharedOwnerRef.current = true;
      }

      const entry = sharedAudioRegistry[sharedKey];
      audio = entry.audio;

      // If URL changes, update shared audio src
      if (audioUrl && entry.src !== audioUrl) {
        entry.src = audioUrl;
        audio.src = audioUrl;
        audio.load();
      }

      // Apply current volume to the shared audio
      audio.volume = volume;

      const updateFromAudio = () => {
        setCurrentTime(audio.currentTime || 0);
        setDuration(isFinite(audio.duration) ? audio.duration : 0);
        setIsPlaying(!audio.paused);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      const handleTime = () => setCurrentTime(audio.currentTime || 0);
      const handleLoaded = () => setDuration(isFinite(audio.duration) ? audio.duration : 0);

      // Subscribe to events
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('timeupdate', handleTime);
      audio.addEventListener('loadedmetadata', handleLoaded);

      // Keep a subscriber record for cleanup and initial sync
      entry.subscribers.add(updateFromAudio);
      // Initial sync
      updateFromAudio();

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTime);
        audio.removeEventListener('loadedmetadata', handleLoaded);
        entry.subscribers.delete(updateFromAudio);
        // If no more subscribers, clean up the shared audio
        if (entry.subscribers.size === 0) {
          try { audio.pause(); } catch {}
          delete sharedAudioRegistry[sharedKey];
        }
      };
    } else {
      // Local standalone audio element mode
      audio = audioRef.current;
      if (!audio) return;

      const updateTime = () => setCurrentTime(audio.currentTime || 0);
      const updateDuration = () => setDuration(isFinite(audio.duration) ? audio.duration : 0);
      const handleEnded = () => setIsPlaying(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [audioUrl, sharedKey]);

  useEffect(() => {
    // Apply volume to either shared or local audio
    if (sharedKey && sharedAudioRegistry[sharedKey]) {
      sharedAudioRegistry[sharedKey].audio.volume = volume;
    } else {
      const audio = audioRef.current;
      if (audio) audio.volume = volume;
    }
  }, [volume, sharedKey]);

  const togglePlayPause = () => {
    const audio = sharedKey ? sharedAudioRegistry[sharedKey]?.audio : audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e) => {
    const audio = sharedKey ? sharedAudioRegistry[sharedKey]?.audio : audioRef.current;
    if (!audio) return;

    const seekBar = e.currentTarget;
    const clickPosition = (e.clientX - seekBar.getBoundingClientRect().left) / seekBar.offsetWidth;
    audio.currentTime = clickPosition * audio.duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Audio Player */}
      <div className="flex items-center gap-3 rounded-full px-4 py-2" style={{ backgroundColor: '#D9D9D9' }}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 flex items-center justify-center transition-opacity hover:opacity-70"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" fill="#535353" stroke="none" strokeWidth={0} />
          ) : (
            <Play className="w-4 h-4 ml-0.5" fill="#535353" stroke="none" strokeWidth={0} />
          )}
        </button>

        {/* Current Time */}
        <span className="text-xs font-semibold min-w-[40px]" style={{ fontFamily: 'Nunito', color: '#000000' }}>
          {formatTime(currentTime)}
        </span>

        {/* Seek Bar */}
        <div
          className="flex-1 h-1.5 rounded-full cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: '#969696' }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%`, backgroundColor: '#FFC943' }}
          />
        </div>

        {/* Duration */}
        <span className="text-xs font-semibold min-w-[40px]" style={{ fontFamily: 'Nunito', color: '#000000' }}>
          {formatTime(duration)}
        </span>

        {/* Volume Control */}
        <div className="flex flex-col items-start gap-1 ml-2">
          <span className="text-xs font-semibold whitespace-nowrap" style={{ fontFamily: 'Nunito', color: '#000000' }}>
            Âm lượng
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider w-20 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #969696 0%, #969696 ${volume * 100}%, #D9D9D9 ${volume * 100}%, #D9D9D9 100%)`
            }}
          />
        </div>
      </div>

      {/* Hidden Audio Element (only in local mode) */}
      {!sharedKey && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #535353;
          cursor: pointer;
        }
        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #535353;
          cursor: pointer;
          border: none;
        }
      `}} />
    </div>
  );
};

export default AudioPlayer;