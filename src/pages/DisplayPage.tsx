import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

interface PlaylistItem {
  videoUrl: string;
  type: 'fixed' | 'user' | 'docent';
  index?: number; // user, docent 비디오의 우선순위를 위한 인덱스
}

const TRANSITION_DURATION_MS = 1000;

/**
 * 재생 목록을 우선순위에 따라 정렬하는 함수.
 */
const sortPlaylist = (playlist: PlaylistItem[]): PlaylistItem[] => {
  const priorityItems = playlist
    .filter((item) => item.type === 'user' || item.type === 'docent')
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0)); // index 오름차순

  const fixedItems = playlist.filter((item) => item.type === 'fixed');

  return [...priorityItems, ...fixedItems];
};

const DisplayPage = () => {
  // --- State for Rendering ---
  const [nowPlaying, setNowPlaying] = useState<PlaylistItem | null>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- Refs for All Logic and Data (Single Source of Truth) ---
  const initialPlaylist: PlaylistItem[] = [
    { videoUrl: 'https://cdn.cxsctfair.com/fixed/87.mp4', type: 'fixed' },
    { videoUrl: 'https://cdn.cxsctfair.com/fixed/82.mp4', type: 'fixed' },
  ];
  const playlistQueueRef = useRef<PlaylistItem[]>(initialPlaylist);
  const nowPlayingRef = useRef(nowPlaying); // Stale Closure 문제 해결을 위한 ref
  const isAdvancingRef = useRef(false); // 레이스 컨디션 방지를 위한 가드
  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];

  // nowPlaying state가 변경될 때마다 ref에도 최신 값을 동기화
  useEffect(() => {
    nowPlayingRef.current = nowPlaying;
  }, [nowPlaying]);

  // --- The "Brain" of the player, wrapped in useCallback for stability ---
  const advanceToNextVideo = useCallback(() => {
    // --- 가드 로직: 이미 다음 영상으로 넘어가는 중이면 실행 방지 ---
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    const finishedVideo = nowPlaying;
    if (!finishedVideo) {
      isAdvancingRef.current = false;
      return;
    }

    const currentQueue = playlistQueueRef.current;

    // 1. "방금 끝난 비디오"를 큐에서 제거
    const indexToRemove = currentQueue.findIndex(
      (item) => item.videoUrl === finishedVideo.videoUrl
    );
    if (indexToRemove !== -1) {
      currentQueue.splice(indexToRemove, 1);
      console.log('[Playback] 재생 완료:', finishedVideo.videoUrl);
    }

    // 2. 만약 끝난 비디오가 'fixed' 타입이면, 큐의 맨 뒤로 다시 추가하여 순환
    if (finishedVideo.type === 'fixed') {
      currentQueue.push(finishedVideo);
      console.log('[Playback] fixed 영상 순환:', finishedVideo.videoUrl);
    }

    // 3. 큐에 다음 비디오가 있는지 확인하고 재생
    if (currentQueue.length > 0) {
      const nextVideo = currentQueue[0];
      console.log('[Playback] 다음 비디오 재생:', nextVideo.videoUrl);
      setNowPlaying(nextVideo);
    } else {
      console.log('[Playback] 큐가 비었습니다. 대기합니다.');
      setNowPlaying(null);
    }

    // 짧은 시간 후 가드 해제
    setTimeout(() => {
      isAdvancingRef.current = false;
    }, 100);
  }, [nowPlaying]);

  // --- Ref to hold the latest version of the callback to solve closure issue ---
  const advanceCallbackRef = useRef(advanceToNextVideo);
  useEffect(() => {
    advanceCallbackRef.current = advanceToNextVideo;
  }, [advanceToNextVideo]);

  // --- Effect 1: SSE Listener (Producer) ---
  useEffect(() => {
    const ctrl = new AbortController();
    const API_BASE_URL =
      import.meta.env.MODE === 'production' ? 'https://api.cxsctfair.com' : '';

    fetchEventSource(`${API_BASE_URL}/api/contents/subscribe`, {
      headers: { Authorization: 'Bearer 41f065b5-7c8f-4c29-8dad-68478c706778' },
      onopen: async (res) =>
        res.ok
          ? console.log('[SSE] 연결 수립')
          : console.error(`[SSE] 연결 실패: ${res.status}`),
      onmessage(event) {
        if (!event.data) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload?.heartbeat === 'ok') return;

          const newItem = payload?.data as PlaylistItem;
          if (!newItem || !newItem.videoUrl) return;

          const isDuplicate = playlistQueueRef.current.some(
            (item) => item.videoUrl === newItem.videoUrl
          );
          if (isDuplicate) return;

          console.log('[SSE] 새 항목 수신:', newItem);

          const newQueue = sortPlaylist([...playlistQueueRef.current, newItem]);
          playlistQueueRef.current = newQueue;
          
          console.log('[Playlist] 갱신된 큐:', playlistQueueRef.current);

          // Stale Closure 방지를 위해 state 대신 ref를 사용
          if (!nowPlayingRef.current) {
            console.log('[Playback] 플레이어 유휴 상태. 새 항목으로 재생 시작.');
            if (playlistQueueRef.current.length > 0) {
              setNowPlaying(playlistQueueRef.current[0]);
            }
          }
        } catch (error) {
          console.error('[SSE] 메시지 파싱 실패:', error);
        }
      },
      onclose: () => console.log('[SSE] 서버에 의해 연결이 종료되었습니다.'),
      onerror: (err) => console.error('[SSE] EventSource 오류:', err),
      signal: ctrl.signal,
    });
    return () => {
      console.log('[SSE] SSE 연결을 종료합니다.');
      ctrl.abort();
    }
    // 의존성 배열을 비워 마운트 시 한 번만 실행되도록 수정
  }, []);

  // --- Effect 2: Kicks off the very first video playback ---
  useEffect(() => {
    if (isLoading && playlistQueueRef.current.length > 0) {
      setNowPlaying(playlistQueueRef.current[0]);
      setIsLoading(false);
    }
  }, [isLoading]);

  // --- Effect 3: "Player" - Renders the video decided by `nowPlaying` state ---
  useEffect(() => {
    if (!nowPlaying) return;

    const standbyPlayerIndex = 1 - activePlayerIndex;
    const standbyPlayer = videoRefs[standbyPlayerIndex].current;

    if (!standbyPlayer || !nowPlaying.videoUrl) return;
    
    if (standbyPlayer.src.endsWith(nowPlaying.videoUrl)) return;

    console.log(
      `[Player] #${standbyPlayerIndex} 플레이어에 비디오 로딩:`,
      nowPlaying.videoUrl
    );
    standbyPlayer.src = nowPlaying.videoUrl;
    standbyPlayer.load();

    const onCanPlayThrough = () => {
      standbyPlayer.play().catch((e) => console.error('재생 실패:', e));
      setActivePlayerIndex(standbyPlayerIndex);
    };

    standbyPlayer.addEventListener('canplaythrough', onCanPlayThrough, {
      once: true,
    });
    return () =>
      standbyPlayer.removeEventListener('canplaythrough', onCanPlayThrough);
  }, [nowPlaying, activePlayerIndex]);

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
            onEnded={() => advanceCallbackRef.current()}
            onError={() => advanceCallbackRef.current()}
            className={`absolute top-0 left-0 object-cover w-full h-full transition-opacity ease-in-out ${
              activePlayerIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDuration: `${TRANSITION_DURATION_MS}ms` }}
          />
        ))}
      </div>
      {playlistQueueRef.current.length === 0 && !isLoading && !nowPlaying && (
        <div className="absolute text-white text-4xl">재생 대기 중...</div>
      )}
    </div>
  );
};

export default DisplayPage;
