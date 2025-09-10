import { Outlet, useLocation } from 'react-router-dom';
import { ROUTER_PATH } from '../router';
import KioskHeader from '../components/kiosk/KioskHeader';
import { KioskProvider } from '../contexts/kiosk/KioskProvider';
import CaptureStep from './kiosk/CaptureStep'; // CaptureStep을 직접 임포트
import clsx from 'clsx';

const KioskPage = () => {
  const location = useLocation();
  const isCapturePage = location.pathname === ROUTER_PATH.KIOSK_CAPTURE;
  const isMainPage = location.pathname === ROUTER_PATH.KIOSK_MAIN;

  return (
    <main
      className={clsx(
        isMainPage
          ? `bg-[url('/src/assets/images/kiosk/kiosk-bg.png')]`
          : `bg-[url('/src/assets/images/kiosk/kiosk-simple-bg.png')]`,
        "bg-[url('/src/assets/images/kiosk/kiosk-bg.png')] bg-contain bg-no-repeat bg-center min-h-[100dvh] flex items-center justify-center"
      )}
    >
      <div className="grid w-[1080px] h-[1920px] mx-auto border-gray-300">
        <KioskProvider>
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
              <CaptureStep />
            </div>
          </div>
        </KioskProvider>
      </div>
    </main>
  );
};

export default KioskPage;
