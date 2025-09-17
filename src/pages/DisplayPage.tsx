import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportContentPresented } from '../api/kioskApi';
import { fetchEventSource } from '@microsoft/fetch-event-source';

interface PlaylistItem {
  videoUrl: string;
  contentId: number;
}

const TRANSITION_DURATION_MS = 1000; // CSS 트랜지션 시간과 일치

const DisplayPage = () => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const playlistRef = useRef(playlist);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);

  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { mutate: reportPresented } = useMutation({
    mutationFn: reportContentPresented,
    onError: (error) => {
      console.error('재생 완료 보고에 실패했습니다:', error);
    },
  });

  // SSE 핸들러: 새로운 재생 목록을 받아 처리
  useEffect(() => {
    const ctrl = new AbortController();
    const API_BASE_URL =
      import.meta.env.MODE === 'production' ? 'https://api.cxsctfair.com' : '';

    fetchEventSource(`${API_BASE_URL}/api/contents/subscribe`, {
      headers: { Authorization: 'Bearer 41f065b5-7c8f-4c29-8dad-68478c706778' },
      onopen: async (response) => {
        if (response.ok) console.log('[SSE] Connection established');
        else
          console.error(
            `[SSE] Connection failed: ${response.status} ${response.statusText}`
          );
      },
      onmessage(event) {
        if (!event.data) return;
        try {
          const newPlaylist = JSON.parse(event.data);

          // Heartbeat 체크
          if (newPlaylist?.heartbeat === 'ok') {
            console.log('[SSE] Heartbeat received');
            return;
          }

          // 배열 형태가 아니거나 비어있으면 무시
          if (!Array.isArray(newPlaylist) || newPlaylist.length === 0) {
            console.warn('[SSE] Received invalid or empty playlist');
            return;
          }

          console.log('[SSE] New playlist received:', newPlaylist);

          // Ref와 State 업데이트
          playlistRef.current = newPlaylist;
          setPlaylist(newPlaylist);

          // 로딩 상태 해제 및 첫 비디오 재생 (최초 수신 시)
          if (isLoading) {
            setIsLoading(false);
            const firstPlayer = videoRefs[0].current;
            if (firstPlayer && newPlaylist[0]) {
              firstPlayer.src = newPlaylist[0].videoUrl;
              firstPlayer
                .play()
                .catch((e) => console.error('초기 재생 실패:', e));
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

    return () => {
      console.log('[SSE] Closing connection on component unmount.');
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 비디오 재생 완료 또는 오류 시 다음 비디오 재생
  const advanceToNextVideo = useCallback(() => {
    const currentPlaylist = playlistRef.current;
    if (currentPlaylist.length === 0) return;

    const finishedContent = currentPlaylist[currentIndexRef.current];
    if (finishedContent?.contentId) {
      reportPresented({ contentId: finishedContent.contentId });
    }

    const nextIndex = (currentIndexRef.current + 1) % currentPlaylist.length;
    setCurrentIndex(nextIndex);
  }, [reportPresented]);

  // 메인 크로스페이드 로직
  useEffect(() => {
    currentIndexRef.current = currentIndex; // currentIndex가 변경될 때마다 Ref 업데이트

    const currentPlaylist = playlistRef.current;
    if (currentPlaylist.length === 0) return;

    const standbyPlayerIndex = 1 - activePlayerIndex;
    const standbyPlayer = videoRefs[standbyPlayerIndex].current;
    const nextVideoUrl = currentPlaylist[currentIndex]?.videoUrl;

    if (!standbyPlayer || !nextVideoUrl) return;

    // 이미 로드된 비디오는 다시 로드하지 않음
    if (standbyPlayer.src.endsWith(nextVideoUrl)) return;

    standbyPlayer.src = nextVideoUrl;
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
  }, [currentIndex, activePlayerIndex]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex justify-center items-center text-white text-4xl">
        재생 목록을 기다리는 중입니다...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex justify-center items-center">
      <div
        className="relative"
        style={{ width: '100vmin', height: '100vmin' }}
      >
        {videoRefs.map((ref, index) => (
          <video
            key={index}
            ref={ref}
            width="100%"
            height="100%"
            muted
            playsInline
            onEnded={advanceToNextVideo}
            onError={advanceToNextVideo} // 오류 발생 시에도 다음 영상으로 넘김
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