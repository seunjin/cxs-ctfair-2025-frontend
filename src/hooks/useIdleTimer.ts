
import { useEffect, useRef } from 'react';

/**
 * 지정된 시간 동안 사용자 활동이 없으면 콜백을 실행하는 훅
 * @param onIdle - 유휴 상태일 때 실행할 콜백 함수
 * @param timeout - 유휴 상태로 간주할 시간 (ms)
 */
export const useIdleTimer = (onIdle: () => void, timeout: number) => {
  const timeoutId = useRef<number | null>(null);

  const resetTimer = () => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }
    timeoutId.current = window.setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      resetTimer();
    };

    // 초기 타이머 설정
    resetTimer();

    // 이벤트 리스너 등록
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // 클린업 함수
    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [onIdle, timeout]); // onIdle 또는 timeout이 변경되면 useEffect를 다시 실행

  return null; // 이 훅은 UI를 렌더링하지 않음
};
