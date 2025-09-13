import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFixedPlaylist, reportContentPresented } from '../api/kioskApi';
import type { Content } from '../api/types';
import { fetchEventSource } from '@microsoft/fetch-event-source';

interface PlaylistItem {
  videoUrl: string;
  contentId: number | null;
  isUserContent: boolean;
}

const DisplayPage = () => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loopCounter, setLoopCounter] = useState(0);

  // --- [DEBUG] 상태 변화 추적용 useEffect ---
  useEffect(() => {
    console.log('[State Update]', {
      currentIndex,
      playlistLength: playlist.length,
      playlist: JSON.parse(JSON.stringify(playlist)), // 깊은 복사로 현재 스냅샷 확인
    });
  }, [playlist, currentIndex]);
  // -----------------------------------------

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

  useEffect(() => {
    if (fixedPlaylist) {
      const initialPlaylist: PlaylistItem[] = fixedPlaylist.map((url) => ({
        videoUrl: url,
        contentId: null,
        isUserContent: false,
      }));
      setPlaylist(initialPlaylist);
    }
  }, [fixedPlaylist]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchEventSource(`/api/contents/subscribe`, {
      headers: {
        Authorization: 'Bearer 41f065b5-7c8f-4c29-8dad-68478c706778',
      },
      onmessage(event) {
        if (!event.data) return;
        try {
          const parsedEvent = JSON.parse(event.data);
          const payload = parsedEvent.data;

          if (payload && payload.heartbeat === 'ok') {
            return;
          }

          if (payload && payload.contentId && payload.videoUrl) {
            // --- [DEBUG] SSE 메시지 수신 로그 ---
            console.log('[SSE Received]', { newContent: payload });
            // ------------------------------------
            const newContent = payload as Content;
            const userVideo: PlaylistItem = {
              videoUrl: newContent.videoUrl,
              contentId: newContent.contentId,
              isUserContent: true,
            };
            setPlaylist((currentPlaylist) => {
              const nextIndex = (currentIndex + 1) % (currentPlaylist.length + 1);
              const newPlaylist = [
                ...currentPlaylist.slice(0, nextIndex),
                userVideo,
                ...currentPlaylist.slice(nextIndex),
              ];
              // --- [DEBUG] SSE로 재생 목록 변경 로그 ---
              console.log('[SSE Playlist Update]', { nextIndex, newPlaylist });
              // ---------------------------------------
              return newPlaylist;
            });
          }
        } catch (error) {
          console.error('SSE 메시지 파싱에 실패했습니다:', error, { originalData: event.data });
        }
      },
      onerror(err) {
        console.error('EventSource에 에러가 발생했습니다:', err);
      },
      signal: ctrl.signal,
    });
    return () => ctrl.abort();
  }, [currentIndex]);

  const handleVideoEnded = () => {
    // --- [DEBUG] 비디오 종료 시점 로그 ---
    console.log('[Video Ended] handleVideoEnded triggered.', {
      currentIndex,
      playlistLength: playlist.length,
    });
    // ------------------------------------

    if (playlist.length === 0) return;

    const finishedContent = playlist[currentIndex];
    if (!finishedContent) return;

    if (finishedContent.isUserContent) {
      if (finishedContent.contentId) {
        reportPresented({ contentId: finishedContent.contentId });
      }
      
      const newPlaylist = playlist.filter((_, i) => i !== currentIndex);
      const newPlaylistLength = newPlaylist.length;
      
      // --- [DEBUG] 사용자 비디오 제거 로그 ---
      console.log('[Video Ended] User video removed.', { newPlaylistLength, newPlaylist });
      // ------------------------------------

      setPlaylist(newPlaylist);
      
      if (newPlaylistLength === 0) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(currentIndex % newPlaylistLength);
      }
    } else {
      const nextIndex = (currentIndex + 1) % playlist.length;
      
      // --- [DEBUG] 관리자 비디오 다음 인덱스 계산 로그 ---
      console.log('[Video Ended] Admin video ended.', { nextIndex });
      // ---------------------------------------------

      if (nextIndex === currentIndex) {
        setLoopCounter(c => c + 1);
      } else {
        setCurrentIndex(nextIndex);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex justify-center items-center text-white text-4xl">
        재생 목록을 불러오는 중입니다...
      </div>
    );
  }

  const currentVideoUrl = playlist[currentIndex]?.videoUrl;

  // --- [DEBUG] 렌더링 시점 로그 ---
  console.log('[Render]', {
    currentIndex,
    playlistLength: playlist.length,
    currentVideoUrl: currentVideoUrl ?? 'undefined',
  });
  // --------------------------------

  return (
    <div className="w-full h-screen bg-black flex justify-center items-center">
      {currentVideoUrl ? (
        <div style={{ width: '100vmin', height: '100vmin' }}>
          <video
            key={`${currentVideoUrl}-${loopCounter}`}
            src={currentVideoUrl}
            width="100%"
            height="100%"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="text-white text-4xl">
          재생 대기 중...
        </div>
      )}
    </div>
  );
};

export default DisplayPage;