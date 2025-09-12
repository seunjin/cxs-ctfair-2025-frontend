import { useRef, useState } from 'react';
import { Icon } from './Icon';

interface AdminVideoProps {
  videoUrl: string;
}

const AdminVideo = ({ videoUrl }: AdminVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [, setDuration] = useState(0);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(timeInSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="relative aspect-square w-full rounded-[12px] border-1 border-[#e9e9e9] overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        controls={false}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />
      <div
        className="absolute bottom-[14px] left-[14px] h-[30px] rounded-[8px] bg-black/60 px-[10px] flex items-center gap-2 cursor-pointer"
        onClick={togglePlay}
      >
        <span className="text-white font-bold">
          {/* 아이콘: 재생(>) / 일시정지(||) */}
          {isPlaying ? (
            <Icon.Pause className="stroke-white fill-white size-3" />
          ) : (
            <Icon.Play className="stroke-white fill-white size-3" />
          )}
        </span>
        <span className="text-[13px] font-medium text-white">
          {formatTime(currentTime)} {/* / {formatTime(duration)} */}
        </span>
      </div>
    </div>
  );
};

export default AdminVideo;
