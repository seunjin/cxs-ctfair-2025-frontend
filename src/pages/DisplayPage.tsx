import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPlaylist, reportContentPresented } from '../api/kioskApi';
import type { Content } from '../api/types';

/**
 * @description 메인 스크린에 영상을 연속적으로 재생하고, SSE를 통해 실시간으로 재생 목록을 업데이트하는 페이지 컴포넌트입니다.
 */
const DisplayPage = () => {
  // --- 상태 관리 ---

  /**
   * @description 현재 화면에 표시되고 있는 동적인 재생 목록입니다.
   * 초기 데이터는 useQuery를 통해 가져오며, 이후 SSE를 통해 실시간으로 업데이트됩니다.
   */
  const [playlist, setPlaylist] = useState<Content[]>([]);

  /**
   * @description 현재 재생 중인 영상이 playlist 배열의 몇 번째 인덱스에 해당하는지를 추적합니다.
   */
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- 데이터 Fetching 및 Mutation ---

  /**
   * @description 컴포넌트 마운트 시, 서버로부터 초기 재생 목록을 가져옵니다.
   * 이 데이터는 SSE 연결이 이루어지기 전의 기본 목록으로 사용됩니다.
   * @property {Content[]} data - 성공 시 받아온 초기 재생 목록 데이터.
   * @property {boolean} isLoading - 데이터 로딩 상태.
   */
  const { data: initialPlaylist, isLoading } = useQuery({
    queryKey: ['playlist'],
    queryFn: getPlaylist,
  });

  /**
   * @description 영상 재생이 완료되었을 때, 해당 영상의 contentId를 서버에 POST로 전송하기 위한 Mutation입니다.
   */
  const { mutate: reportPresented } = useMutation({
    mutationFn: reportContentPresented,
    onError: (error) => {
      // 실제 프로덕션에서는 Sentry 등의 에러 리포팅 툴을 사용하는 것이 좋습니다.
      console.error('재생 완료 보고에 실패했습니다:', error);
    },
  });

  // --- Side Effects ---

  /**
   * @description useQuery를 통해 초기 재생 목록을 성공적으로 가져왔을 때,
   * 이 데이터를 컴포넌트의 `playlist` 상태에 반영합니다.
   * 이 Effect는 initialPlaylist 데이터가 변경될 때만 실행됩니다.
   */
  useEffect(() => {
    if (initialPlaylist) {
      setPlaylist(initialPlaylist);
    }
  }, [initialPlaylist]);

  /**
   * @description SSE(Server-Sent Events) 연결을 설정하고 관리합니다.
   * 서버로부터 실시간으로 새 영상 정보를 받아 재생 목록에 추가하는 역할을 합니다.
   */
  useEffect(() => {
    // 스크린을 식별하기 위한 ID입니다. 추후 여러 스크린을 관리하게 되면 동적으로 할당할 수 있습니다.
    const screenId = 'main-screen-01';

    // SSE 연결을 위한 EventSource 인스턴스를 생성합니다.
    // Vite 프록시 설정을 통해 /api 경로는 실제 API 서버로 전달됩니다.
    const eventSource = new EventSource(`/api/contents/subscribe?screenId=${screenId}`);

    // 서버로부터 메시지가 도착했을 때 호출될 이벤트 리스너입니다.
    eventSource.onmessage = (event) => {
      try {
        // 서버가 보낸 데이터는 event.data에 문자열 형태로 담겨있으므로, JSON 객체로 파싱합니다.
        const newContent = JSON.parse(event.data) as Content;

        // 새로운 영상을 재생 목록에 추가합니다.
        // 현재 재생 중인 영상 바로 다음에 새 영상을 삽입하여, 자연스럽게 다음 순서로 재생되도록 합니다.
        setPlaylist((currentPlaylist) => {
          const nextIndex = currentIndex + 1;
          const newPlaylist = [
            ...currentPlaylist.slice(0, nextIndex),
            newContent,
            ...currentPlaylist.slice(nextIndex),
          ];
          return newPlaylist;
        });
      } catch (error) {
        console.error('SSE 메시지 파싱에 실패했습니다:', error);
      }
    };

    // SSE 연결 중 에러가 발생했을 때 호출될 이벤트 리스너입니다.
    eventSource.onerror = (error) => {
      console.error('EventSource에 에러가 발생했습니다:', error);
      // 연결이 끊겼을 때 재연결 로직을 추가할 수 있습니다. EventSource는 기본적으로 자동 재연결을 시도합니다.
      eventSource.close(); // 필요 시 연결을 명시적으로 닫습니다.
    };

    // 컴포넌트가 언마운트될 때(페이지를 벗어날 때) 실행될 클린업 함수입니다.
    // 불필요한 연결을 방지하고 메모리 누수를 막기 위해 반드시 SSE 연결을 종료해야 합니다.
    return () => {
      eventSource.close();
    };
  }, [currentIndex]); // currentIndex가 바뀔 때마다 SSE 로직을 재평가하여 정확한 위치에 새 영상을 삽입합니다.

  // --- 이벤트 핸들러 ---

  /**
   * @description 비디오 재생이 자연스럽게 종료되었을 때 호출되는 함수입니다.
   */
  const handleVideoEnded = () => {
    // 현재 재생 목록이 비어있으면 아무 작업도 하지 않습니다.
    if (playlist.length === 0) return;

    // 현재 재생이 끝난 영상의 정보를 가져옵니다.
    const finishedContent = playlist[currentIndex];

    // 서버에 이 영상의 재생이 완료되었음을 보고합니다.
    if (finishedContent) {
      reportPresented({ contentId: finishedContent.contentId });
    }

    // 다음 영상으로 인덱스를 업데이트합니다.
    // 재생 목록의 마지막 영상이었다면, % (나머지) 연산자를 통해 다시 첫 번째 영상(인덱스 0)으로 돌아가 무한 반복합니다.
    setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  // --- 렌더링 ---

  // 초기 데이터 로딩 중일 때 표시할 UI입니다.
  if (isLoading) {
    return <div className="w-full h-screen bg-black flex justify-center items-center text-white text-4xl">재생 목록을 불러오는 중입니다...</div>;
  }

  // 현재 재생할 영상의 URL을 가져옵니다. 재생 목록이 비어있을 경우를 대비해 옵셔널 체이닝(?.)을 사용합니다.
  const currentVideoUrl = playlist[currentIndex]?.videoUrl;

  return (
    <div className="w-full h-screen bg-black">
      {currentVideoUrl ? (
        <video
          // key prop에 currentIndex를 전달하여, src가 변경될 때마다 React가 video 요소를 새로 렌더링하도록 강제합니다.
          // 이는 autoplay 정책이 엄격한 브라우저에서 다음 영상이 자동으로 재생되도록 보장하는 데 도움이 됩니다.
          key={currentIndex}
          src={currentVideoUrl}
          width="100%"
          height="100%"
          autoPlay // 영상이 로드되면 자동으로 재생합니다.
          muted // 대부분의 브라우저에서는 음소거 상태여야 자동 재생이 가능합니다.
          onEnded={handleVideoEnded} // 영상 재생이 끝나면 handleVideoEnded 함수를 호출합니다.
          className="object-cover w-full h-full"
        />
      ) : (
        // 재생할 영상이 하나도 없을 때 표시할 UI입니다.
        <div className="w-full h-screen flex justify-center items-center text-white text-4xl">재생 대기 중...</div>
      )}
    </div>
  );
};

export default DisplayPage;