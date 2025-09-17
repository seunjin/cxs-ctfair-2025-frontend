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

const TRANSITION_DURATION_MS = 1000; // CSS 트랜지션 시간과 일치

const DisplayPage = () => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  const { data: fixedPlaylist, isLoading } = useQuery({
    queryKey: ['fixedPlaylist'],
    queryFn: getFixedPlaylist,
    refetchOnWindowFocus: false, // 창 포커스 시 재요청 방지
    refetchOnReconnect: false, // 네트워크 재연결 시 재요청 방지
    staleTime: Infinity, // 데이터를 항상 최신 상태로 간주
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

      console.log(
        `[Playlist] Initial playlist set. Total fixed videos: ${initialPlaylist.length}`,
        initialPlaylist
      );

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
    const API_BASE_URL =
      import.meta.env.MODE === 'production' ? 'https://api.cxsctfair.com' : '';
    fetchEventSource(`${API_BASE_URL}/api/contents/subscribe`, {
      headers: { Authorization: 'Bearer 41f065b5-7c8f-4c29-8dad-68478c706778' },
      onopen: async (response) => {
        if (response.ok) {
          console.log('[SSE] Connection established');
        } else {
          console.error(
            `[SSE] Connection failed: ${response.status} ${response.statusText}`
          );
        }
      },
      onmessage(event) {
        if (!event.data) return;
        try {
          const payload = JSON.parse(event.data)?.data;
          if (payload?.heartbeat === 'ok') {
            console.log('[SSE] Heartbeat received');
            return;
          }
          console.log('[SSE] New data received:', payload);
          if (payload?.videoUrl && payload?.contentId != null) {
            const userVideo: PlaylistItem = { ...payload, isUserContent: true };
            setPlaylist((current) => {
              // ref를 사용하여 최신 currentIndex를 가져옵니다.
              const nextIdx =
                (currentIndexRef.current + 1) % (current.length + 1);
              const newPlaylist = [
                ...current.slice(0, nextIdx),
                userVideo,
                ...current.slice(nextIdx),
              ];
              console.log(
                `[Playlist] New video inserted at index ${nextIdx}. Updated playlist:`,
                newPlaylist
              );
              return newPlaylist;
            });
          }
        } catch (error) {
          console.error('[SSE] Message parsing failed:', error);
        }
      },
      onclose: () => {
        console.log('[SSE] Connection closed by server.');
      },
      onerror: (err) => {
        console.error('[SSE] EventSource error:', err);
        // Note: fetchEventSource will automatically try to reconnect on network errors.
        // If the error is fatal (e.g. 401 Unauthorized), it will not reconnect.
      },
      signal: ctrl.signal,
    });
    return () => {
      console.log('[SSE] Closing connection on component unmount.');
      ctrl.abort();
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행되도록 수정합니다.

  // 3. 비디오 재생 완료 또는 오류 시 호출될 함수
  const advanceToNextVideo = (finishedIndex: number) => {
    const finishedContent = playlist[finishedIndex];
    if (!finishedContent) return;

    if (finishedContent.isUserContent) {
      if (finishedContent.contentId != null)
        reportPresented({ contentId: finishedContent.contentId });
      const newPlaylist = playlist.filter((_, i) => i !== finishedIndex);
      setPlaylist(newPlaylist);
      if (newPlaylist.length > 0) {
        const nextIndex = finishedIndex % newPlaylist.length;
        console.log(
          `[Playback] User video finished. Advancing to index: ${nextIndex}`
        );
        setCurrentIndex(nextIndex);
      }
    } else {
      if (playlist.length === 1) {
        const currentPlayer = videoRefs[activePlayerIndex].current;
        if (currentPlayer) {
          console.log('[Playback] Single fixed video looping.');
          currentPlayer.currentTime = 0;
          currentPlayer
            .play()
            .catch((e) => console.error('반복 재생 실패:', e));
        }
      } else {
        const nextIndex = (currentIndex + 1) % playlist.length;
        console.log(
          `[Playback] Fixed video finished. Advancing from index ${currentIndex} to ${nextIndex}`
        );
        setCurrentIndex(nextIndex);
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
    if (activeVideoIndex === currentIndex) return;

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
    standbyPlayer.load(); // 비디오 소스가 변경되었음을 명시적으로 알리고 로드를 시작합니다.

    const onCanPlayThrough = () => {
      standbyPlayer.play().catch((e) => console.error('재생 실패:', e));
      setActivePlayerIndex(standbyPlayerIndex);
    };
    standbyPlayer.addEventListener('canplaythrough', onCanPlayThrough);
    return () =>
      standbyPlayer.removeEventListener('canplaythrough', onCanPlayThrough);
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
