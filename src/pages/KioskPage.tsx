import { Outlet, useLocation } from 'react-router-dom';
import { ROUTER_PATH } from '../router';
import KioskHeader from '../components/kiosk/KioskHeader';
import KioskCaptureStep from './kiosk/CaptureStep'; // 이름 변경
import DocentCaptureStep from './docent/CaptureStep'; // 도슨트 스텝 추가
import clsx from 'clsx';

const KioskPage = () => {
  const location = useLocation();
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
