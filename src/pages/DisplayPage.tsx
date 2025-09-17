import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// 'fixed' 타입을 다시 포함하고, 'user'/'docent'일 경우 index를 갖도록 수정
interface PlaylistItem {
  videoUrl: string;
  type: 'fixed' | 'user' | 'docent';
  index?: number; // user, docent 비디오의 우선순위를 위한 인덱스
}

const TRANSITION_DURATION_MS = 1000;

/**
 * 재생 목록을 우선순위에 따라 정렬하는 함수.
 * 1. 'user' 또는 'docent' 타입의 항목들이 'fixed' 타입의 항목들보다 앞에 옵니다.
 * 2. 'user'/'docent' 항목들 사이에서는 'index'를 기준으로 내림차순 정렬됩니다.
 * 3. 'fixed' 항목들 사이의 순서는 유지됩니다.
 */
const sortPlaylist = (playlist: PlaylistItem[]): PlaylistItem[] => {
  const priorityItems = playlist
    .filter((item) => item.type === 'user' || item.type === 'docent')
    .sort((a, b) => (b.index ?? 0) - (a.index ?? 0)); // index 내림차순

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
    {
      videoUrl: 'https://cdn.cxsctfair.com/fixed/87.mp4',
      type: 'fixed',
    },
    { videoUrl: 'https://cdn.cxsctfair.com/fixed/82.mp4', type: 'fixed' },
  ];
  const activePlaylistRef = useRef<PlaylistItem[]>(initialPlaylist);
  const fixedPlaylistRef = useRef<PlaylistItem[]>(initialPlaylist);
  const currentIndexRef = useRef(0);
  const loopCountRef = useRef(0);
  const priorityInterruptRef = useRef(false); // 우선순위 인터럽트 플래그
  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];

  // --- The "Brain" of the player, wrapped in useCallback for stability ---
  const advanceToNextVideo = useCallback(() => {
    // 1. 최우선 순위: 인터럽트 신호가 있는지 확인
    if (priorityInterruptRef.current) {
      priorityInterruptRef.current = false; // 플래그 즉시 리셋
      loopCountRef.current = 0; // 인터럽트는 새 루프의 시작으로 간주
      const playlist = activePlaylistRef.current;
      if (playlist.length > 0) {
        console.log('[Playback] 우선순위 인터럽트! 0번 인덱스부터 다시 시작합니다.');
        currentIndexRef.current = 0;
        setNowPlaying(playlist[0]);
      } else {
        setNowPlaying(null);
      }
      return;
    }

    // 2. 현재 재생 단계에 맞는 재생 목록 결정
    const isRepeating = loopCountRef.current > 0;
    const canRepeatFixed = fixedPlaylistRef.current.length > 0;
    const currentPlaylist =
      isRepeating && canRepeatFixed
        ? fixedPlaylistRef.current
        : activePlaylistRef.current;

    if (currentPlaylist.length === 0) {
      setNowPlaying(null);
      return;
    }

    // 3. 다음 인덱스 계산
    const safeCurrentIndex = Math.min(currentIndexRef.current, currentPlaylist.length - 1);
    let nextIndex = safeCurrentIndex + 1;

    // 4. 루프 전환 처리
    if (nextIndex >= currentPlaylist.length) {
      if (!isRepeating && canRepeatFixed) {
        console.log('[Playback] 첫 번째 루프 완료. 고정 영상 반복을 시작합니다.');
        loopCountRef.current = 1;
        currentIndexRef.current = 0;
        setNowPlaying(fixedPlaylistRef.current[0]);
      } else {
        console.log('[Playback] 목록의 끝에 도달. 처음부터 다시 반복합니다.');
        currentIndexRef.current = 0;
        setNowPlaying(currentPlaylist[0]);
      }
    } else {
      currentIndexRef.current = nextIndex;
      setNowPlaying(currentPlaylist[nextIndex]);
    }
  }, []);

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
          
          // 수신된 데이터가 fixed 타입이 아니거나, 아직 fixed 타입이 목록에 없을 때만 추가 (중복 방지)
          if (newItem.type !== 'fixed' || fixedPlaylistRef.current.every(i => i.videoUrl !== newItem.videoUrl)) {
            console.log('[SSE] 새 항목 수신:', newItem);

            const newPlaylist = sortPlaylist([...activePlaylistRef.current, newItem]);
            activePlaylistRef.current = newPlaylist;
            fixedPlaylistRef.current = newPlaylist.filter(
              (item) => item.type === 'fixed'
            );
            
            console.log('[Playlist] 갱신된 재생 목록:', activePlaylistRef.current);

            const isPriorityItem = newItem.type === 'user' || newItem.type === 'docent';
            const isNowFirst = newPlaylist.length > 0 && newPlaylist[0].videoUrl === newItem.videoUrl;

            if (isPriorityItem && isNowFirst) {
              console.log('[Playback] 우선순위 인터럽트가 설정되었습니다.');
              priorityInterruptRef.current = true;
            }
          }

          if (isLoading) {
            setIsLoading(false);
          } else if (!nowPlaying) {
            console.log('[Playback] 플레이어 유휴 상태. advanceToNextVideo 호출.');
            advanceCallbackRef.current();
          }
        } catch (error) {
          console.error('[SSE] 메시지 파싱 실패:', error);
        }
      },
      onclose: () => console.log('[SSE] 서버에 의해 연결이 종료되었습니다.'),
      onerror: (err) => console.error('[SSE] EventSource 오류:', err),
      signal: ctrl.signal,
    });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Effect 2: Kicks off the very first video playback ---
  useEffect(() => {
    if (isLoading && activePlaylistRef.current.length > 0 && !nowPlaying) {
      setNowPlaying(activePlaylistRef.current[0]);
      setIsLoading(false);
    }
  }, [isLoading, nowPlaying]);

  // --- Effect 3: "Player" - Renders the video decided by `nowPlaying` state ---
  useEffect(() => {
    if (!nowPlaying) return;

    const standbyPlayerIndex = 1 - activePlayerIndex;
    const standbyPlayer = videoRefs[standbyPlayerIndex].current;

    if (!standbyPlayer || !nowPlaying.videoUrl) return;
    
    if (standbyPlayer.src.endsWith(nowPlaying.videoUrl)) {
      // 재생목록에 영상이 하나뿐일 때, 또는 현재 영상과 다음 영상이 같을 때 (반복재생)
      if (activePlaylistRef.current.length === 1 || nowPlaying.videoUrl === (activePlaylistRef.current[currentIndexRef.current] || {}).videoUrl) {
          standbyPlayer.currentTime = 0;
          standbyPlayer.play().catch((e) => console.error('Playback failed:', e));
      }
      return;
    }

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
      {activePlaylistRef.current.length === 0 && !isLoading && (
        <div className="absolute text-white text-4xl">재생 대기 중...</div>
      )}
    </div>
  );
};

export default DisplayPage;
