import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../router';
import KioskHeader from '../components/kiosk/KioskHeader';
import KioskCaptureStep from './kiosk/CaptureStep'; // 이름 변경
import DocentCaptureStep from './docent/CaptureStep'; // 도슨트 스텝 추가
import clsx from 'clsx';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { useKiosk } from '../contexts/kiosk/useKiosk';
import { useCallback } from 'react';

const IDLE_TIMEOUT = 120000; // 2분

const KioskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetState } = useKiosk();

  const handleIdle = useCallback(() => {
    console.log('유휴 상태 감지. 상태를 초기화하고 메인으로 이동합니다.');
    resetState();
    navigate('/kiosk');
  }, [navigate, resetState]);

  useIdleTimer(handleIdle, IDLE_TIMEOUT);

  const isCapturePage = [
    ROUTER_PATH.KIOSK_CAPTURE,
    ROUTER_PATH.DOCENT_CAPTURE,
  ].includes(location.pathname);
  const isMainPage = [
    ROUTER_PATH.KIOSK_MAIN,
    ROUTER_PATH.DOCENT_MAIN,
  ].includes(location.pathname);

  const isDocentMode = location.pathname.startsWith('/docent');

  return (
    <main
      id="kiosk-container"
      className={clsx(
        isMainPage
          ? `bg-[url('/src/assets/images/kiosk/kiosk-bg.png')]`
          : `bg-[url('/src/assets/images/kiosk/kiosk-simple-bg.png')]`,
        "bg-[url('/src/assets/images/kiosk/kiosk-bg.png')] bg-contain bg-no-repeat bg-center min-h-[100dvh] flex items-center justify-center"
      )}
    >
      <div className="grid w-[1080px] h-[1920px] mx-auto border-gray-300">
        <div
          style={{ display: isCapturePage ? 'none' : 'block' }}
          className="h-full"
        >
          {isMainPage ? (
            <Outlet />
          ) : (
            <div className="h-full">
              <KioskHeader />
              <div className="h-[calc(100%-136px)]">
                <Outlet />
              </div>
            </div>
          )}
        </div>

        {/* CaptureStep은 항상 렌더링하되, 경로가 일치할 때만 보여줍니다. */}
        <div
          style={{ display: isCapturePage ? 'block' : 'none' }}
          className="h-full"
        >
          <KioskHeader />
          <div className="h-[calc(100%-136px)]">
            {isDocentMode ? <DocentCaptureStep /> : <KioskCaptureStep />}
          </div>
        </div>
      </div>
    </main>
  );
};

export default KioskPage;
