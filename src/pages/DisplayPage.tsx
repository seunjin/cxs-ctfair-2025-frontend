import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportContentPresented } from '../api/kioskApi';
import { fetchEventSource } from '@microsoft/fetch-event-source';

interface PlaylistItem {
  videoUrl: string;
  contentId: number;
  status: 'fixed' | 'user' | 'docent';
}

const TRANSITION_DURATION_MS = 1000; // CSS 트랜지션 시간과 일치

const DisplayPage = () => {
  // --- State Definitions ---
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [fixedPlaylist, setFixedPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- Ref Definitions for non-rendering state ---
  const playlistRef = useRef(playlist);
  const fixedPlaylistRef = useRef(fixedPlaylist);
  const currentIndexRef = useRef(currentIndex);
  const loopCountRef = useRef(loopCount);

  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];

  // --- API Mutation ---
  const { mutate: reportPresented } = useMutation({
    mutationFn: reportContentPresented,
    onError: (error) => {
      console.error('재생 완료 보고에 실패했습니다:', error);
    },
  });

  // --- State/Ref Synchronization ---
  useEffect(() => {
    playlistRef.current = playlist;
    fixedPlaylistRef.current = fixedPlaylist;
    currentIndexRef.current = currentIndex;
    loopCountRef.current = loopCount;
  }, [playlist, fixedPlaylist, currentIndex, loopCount]);

  // --- SSE Event Source Handler ---
  useEffect(() => {
    const ctrl = new AbortController();
    const API_BASE_URL =
      import.meta.env.MODE === 'production' ? 'https://api.cxsctfair.com' : '';

    fetchEventSource(`${API_BASE_URL}/api/contents/subscribe`, {
      headers: { Authorization: 'Bearer 41f065b5-7c8f-4c29-8dad-68478c706778' },
      onopen: async (res) =>
        res.ok
          ? console.log('[SSE] Connection established')
          : console.error(`[SSE] Connection failed: ${res.status}`),
      onmessage(event) {
        if (!event.data) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload?.heartbeat === 'ok') {
            console.log('[SSE] Heartbeat received');
            return;
          }

          const newList = payload?.data?.list;
          if (!Array.isArray(newList)) {
            console.warn('[SSE] Received invalid playlist data:', payload);
            return;
          }

          console.log('[SSE] New playlist received:', newList);

          const newFixedList = newList.filter(
            (item) => item.status === 'fixed'
          );

          // Reset everything for the new playlist
          setPlaylist(newList);
          setFixedPlaylist(newFixedList);
          setCurrentIndex(0);
          setLoopCount(0);

          if (isLoading && newList.length > 0) {
            setIsLoading(false);
            const firstPlayer = videoRefs[0].current;
            if (firstPlayer) {
              firstPlayer.src = newList[0].videoUrl;
              firstPlayer
                .play()
                .catch((e) => console.error('Initial play failed:', e));
            }
          }
        } catch (error) {
          console.error('[SSE] Message parsing failed:', error);
        }
      },
      onclose: () => console.log('[SSE] Connection closed by server.'),
      onerror: (err) => console.error('[SSE] EventSource error:', err),
      signal: ctrl.signal,
    });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Core Playback Logic ---
  const advanceToNextVideo = useCallback(() => {
    const isFirstLoop = loopCountRef.current === 0;
    const currentList = isFirstLoop
      ? playlistRef.current
      : fixedPlaylistRef.current;

    if (currentList.length === 0) {
      // If the current loop's list is empty, try to switch to the fixed list.
      if (isFirstLoop && fixedPlaylistRef.current.length > 0) {
        console.log('[Playback] First loop list is empty, switching to fixed list.');
        setLoopCount(1);
        setCurrentIndex(0);
      }
      return;
    }

    const finishedContent = currentList[currentIndexRef.current];
    if (finishedContent?.contentId) {
      reportPresented({ contentId: finishedContent.contentId });
    }

    let nextIndex = (currentIndexRef.current + 1) % currentList.length;

    // Transition from the first loop to the fixed loop
    if (isFirstLoop && nextIndex === 0) {
      console.log('[Playback] First loop finished. Switching to fixed playlist.');
      setLoopCount(1);
      // If the fixed playlist is empty, loop the full list again.
      if (fixedPlaylistRef.current.length === 0) {
        console.warn('[Playback] Fixed playlist is empty. Looping full list again.');
      } else {
        // The next video will be the first one from the fixed list.
        // The index is already 0, so we just need to let the state update.
      }
    }
    setCurrentIndex(nextIndex);
  }, [reportPresented]);

  // --- Video Player Effect ---
  useEffect(() => {
    const isFirstLoop = loopCountRef.current === 0;
    const activePlaylist = isFirstLoop ? playlist.slice() : fixedPlaylist.slice();

    if (activePlaylist.length === 0) return;

    const standbyPlayerIndex = 1 - activePlayerIndex;
    const standbyPlayer = videoRefs[standbyPlayerIndex].current;
    const nextVideoUrl = activePlaylist[currentIndex]?.videoUrl;

    if (!standbyPlayer || !nextVideoUrl || standbyPlayer.src.endsWith(nextVideoUrl)) return;

    standbyPlayer.src = nextVideoUrl;
    standbyPlayer.load();

    const onCanPlayThrough = () => {
      standbyPlayer.play().catch((e) => console.error('Playback failed:', e));
      setActivePlayerIndex(standbyPlayerIndex);
    };

    standbyPlayer.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
    return () => standbyPlayer.removeEventListener('canplaythrough', onCanPlayThrough);
  }, [currentIndex, playlist, fixedPlaylist, activePlayerIndex]);


  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex justify-center items-center text-white text-4xl">
        재생 목록을 기다리는 중입니다...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex justify-center items-center">
      <div className="relative" style={{ width: '100vmin', height: '100vmin' }}>
        {videoRefs.map((ref, index) => (
          <video
            key={index}
            ref={ref}
            width="100%"
            height="100%"
            muted
            playsInline
            onEnded={advanceToNextVideo}
            onError={advanceToNextVideo}
            className={`absolute top-0 left-0 object-cover w-full h-full transition-opacity ease-in-out ${
              activePlayerIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDuration: `${TRANSITION_DURATION_MS}ms` }}
          />
        ))}
      </div>
      {playlist.length === 0 && !isLoading && (
        <div className="absolute text-white text-4xl">재생 대기 중...</div>
      )}
    </div>
  );
};

export default DisplayPage;
