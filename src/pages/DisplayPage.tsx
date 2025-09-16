import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFixedPlaylist, reportContentPresented } from '../api/kioskApi';
import { fetchEventSource } from '@microsoft/fetch-event-source';
// import M from '../assets/screen_masking(p).png';
interface PlaylistItem {
  videoUrl: string;
  contentId: number | null;
  isUserContent: boolean;
}

const TRANSITION_DURATION_MS = 300; // CSS 트랜지션 시간과 일치

const DisplayPage = () => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  const { data: fixedPlaylist, isLoading } = useQuery({
    queryKey: ['fixedPlaylist'],
    queryFn: getFixedPlaylist,
  });

  const { mutate: reportPresented } = useMutation({
    mutationFn: reportContentPresented,
    onError: (error) => {
      console.error('재생 완료 보고에 실패했습니다:', error);
    },
  });

  // 1. 초기 재생 목록 설정
  useEffect(() => {
    if (fixedPlaylist && fixedPlaylist.length > 0) {
      const initialPlaylist: PlaylistItem[] = fixedPlaylist.map((url) => ({
        videoUrl: url,
        contentId: null,
        isUserContent: false,
      }));
      setPlaylist(initialPlaylist);

      const firstPlayer = videoRefs[0].current;
      if (firstPlayer) {
        firstPlayer.src = initialPlaylist[0].videoUrl;
        firstPlayer.play().catch((e) => console.error('초기 재생 실패:', e));
      }
    }
  }, [fixedPlaylist]);

  // 2. SSE 핸들러
  useEffect(() => {
    const ctrl = new AbortController();
    fetchEventSource(`https://api.cxsctfair.com/api/contents/subscribe`, {
      headers: { Authorization: 'Bearer 41f065b5-7c8f-4c29-8dad-68478c706778' },
      onmessage(event) {
        if (!event.data) return;
        try {
          const payload = JSON.parse(event.data)?.data;
          if (payload?.heartbeat === 'ok') return;
          if (payload?.contentId && payload?.videoUrl) {
            const userVideo: PlaylistItem = { ...payload, isUserContent: true };
            setPlaylist((current) => {
              const nextIdx = (currentIndex + 1) % (current.length + 1);
              return [
                ...current.slice(0, nextIdx),
                userVideo,
                ...current.slice(nextIdx),
              ];
            });
          }
        } catch (error) {
          console.error('SSE 메시지 파싱 실패:', error);
        }
      },
      onerror: (err) => console.error('EventSource 에러:', err),
      signal: ctrl.signal,
    });
    return () => ctrl.abort();
  }, [currentIndex]);

  // 3. 비디오 재생 완료 또는 오류 시 호출될 함수
  const advanceToNextVideo = (finishedIndex: number) => {
    const finishedContent = playlist[finishedIndex];
    if (!finishedContent) return;

    if (finishedContent.isUserContent) {
      if (finishedContent.contentId)
        reportPresented({ contentId: finishedContent.contentId });
      const newPlaylist = playlist.filter((_, i) => i !== finishedIndex);
      setPlaylist(newPlaylist);
      if (newPlaylist.length > 0)
        setCurrentIndex(finishedIndex % newPlaylist.length);
    } else {
      if (playlist.length === 1) {
        const currentPlayer = videoRefs[activePlayerIndex].current;
        if (currentPlayer) {
          currentPlayer.currentTime = 0;
          currentPlayer
            .play()
            .catch((e) => console.error('반복 재생 실패:', e));
        }
      } else {
        setCurrentIndex((prev) => (prev + 1) % playlist.length);
      }
    }
  };

  const handleVideoEnded = () => {
    advanceToNextVideo(currentIndex);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const errorVideoUrl = e.currentTarget.src;
    const errorIndex = playlist.findIndex((item) =>
      errorVideoUrl.endsWith(item.videoUrl)
    );
    console.error('[Video Error]', {
      message: '비디오 로드/재생 실패. 다음 비디오로 강제 전환합니다.',
      errorVideoUrl: errorVideoUrl,
      errorIndex: errorIndex,
    });
    advanceToNextVideo(errorIndex > -1 ? errorIndex : currentIndex);
  };

  // 4. 메인 크로스페이드 로직
  useEffect(() => {
    const activePlayer = videoRefs[activePlayerIndex].current;
    if (!activePlayer) return;
    const activeVideoIndex = playlist.findIndex((item) =>
      activePlayer.src.endsWith(item.videoUrl)
    );
    if (activeVideoIndex === currentIndex || activeVideoIndex === -1) return;

    const standbyPlayerIndex = 1 - activePlayerIndex;
    const standbyPlayer = videoRefs[standbyPlayerIndex].current;
    const nextVideoUrl = playlist[currentIndex]?.videoUrl;

    if (
      !standbyPlayer ||
      !nextVideoUrl ||
      standbyPlayer.src.endsWith(nextVideoUrl)
    )
      return;

    standbyPlayer.src = nextVideoUrl;

    const onCanPlay = () => {
      standbyPlayer.play().catch((e) => console.error('재생 실패:', e));
      setActivePlayerIndex(standbyPlayerIndex);
    };
    standbyPlayer.addEventListener('canplay', onCanPlay);
    return () => standbyPlayer.removeEventListener('canplay', onCanPlay);
  }, [currentIndex, playlist, activePlayerIndex]);

  // 5. 메모리 관리: 비활성화된 플레이어 정리
  useEffect(() => {
    const inactivePlayerIndex = 1 - activePlayerIndex;
    const playerToClean = videoRefs[inactivePlayerIndex].current;

    if (playerToClean && playerToClean.src) {
      const cleanupTimer = setTimeout(() => {
        playerToClean.src = '';
        playerToClean.removeAttribute('src');
        playerToClean.load();
      }, TRANSITION_DURATION_MS);

      return () => clearTimeout(cleanupTimer);
    }
  }, [activePlayerIndex, playlist]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex justify-center items-center text-white text-4xl">
        재생 목록을 불러오는 중입니다...
      </div>
    );
  }

  return (
    <>
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
              onEnded={handleVideoEnded}
              onError={handleVideoError}
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
      {/* <div className="fixed inset-0 z-10 flex items-center justify-center opacity-30">
        <h2 className="text-blue-600 text-7xl">마스킹 테스트</h2>
        <img src={M} className="w-full" />
      </div> */}
    </>
  );
};

export default DisplayPage;
