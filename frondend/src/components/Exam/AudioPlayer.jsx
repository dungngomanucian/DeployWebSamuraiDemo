import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
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

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
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