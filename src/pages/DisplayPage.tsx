import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPlaylist, reportContentPresented } from '../api/kioskApi';
import type { Content } from '../api/types';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const DisplayPage = () => {
  const [playlist, setPlaylist] = useState<Content[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: initialPlaylist, isLoading } = useQuery({
    queryKey: ['playlist'],
    queryFn: getPlaylist,
  });

  const { mutate: reportPresented } = useMutation({
    mutationFn: reportContentPresented,
    onError: (error) => {
      console.error('재생 완료 보고에 실패했습니다:', error);
    },
  });

  useEffect(() => {
    if (initialPlaylist) {
      setPlaylist(initialPlaylist);
    }
  }, [initialPlaylist]);

  // 인증 헤더를 포함한 안정적인 SSE 연결
  useEffect(() => {
    const ctrl = new AbortController();
    fetchEventSource(`/api/contents/subscribe`, {
      headers: {
        Authorization: 'Bearer 41f065b5-7c8f-4c29-8dad-68478c706778',
      },
      onmessage(event) {
        if (!event.data) {
          return;
        }
        try {
          const newContent = JSON.parse(event.data) as Content;
          // SSE 핸들러는 클로저이므로, 항상 최신 상태를 참조하도록 함수형 업데이트를 사용합니다.
          setPlaylist((currentPlaylist) => {
            const nextIndex = (currentIndex + 1) % (currentPlaylist.length + 1);
            return [
              ...currentPlaylist.slice(0, nextIndex),
              newContent,
              ...currentPlaylist.slice(nextIndex),
            ];
          });
        } catch (error) {
          console.error('SSE 메시지 파싱에 실패했습니다:', error);
        }
      },
      onerror(err) {
        console.error('EventSource에 에러가 발생했습니다:', err);
      },
      signal: ctrl.signal,
    });

    return () => {
      ctrl.abort();
    };
  }, [currentIndex]); // currentIndex를 의존성에 추가하여 setPlaylist 클로저가 최신 값을 참조하도록 함

  const handleVideoEnded = () => {
    if (playlist.length === 0) return;
    const finishedContent = playlist[currentIndex];
    if (finishedContent) {
      reportPresented({ contentId: finishedContent.contentId });
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  if (isLoading) {
    return <div className="w-full h-screen bg-black flex justify-center items-center text-white text-4xl">재생 목록을 불러오는 중입니다...</div>;
  }

  const currentVideoUrl = playlist[currentIndex]?.videoUrl;

  return (
    <div className="w-full h-screen bg-black">
      {currentVideoUrl ? (
        <video
          key={currentIndex}
          src={currentVideoUrl}
          width="100%"
          height="100%"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-screen flex justify-center items-center text-white text-4xl">재생 대기 중...</div>
      )}
    </div>
  );
};

export default DisplayPage;