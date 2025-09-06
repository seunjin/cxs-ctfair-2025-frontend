import { Outlet, useLocation } from 'react-router-dom';
import { ROUTER_PATH } from '../router';
import KioskHeader from '../components/kiosk/KioskHeader';
import { KioskProvider } from '../contexts/kiosk/KioskProvider';

const KioskPage = () => {
  const location = useLocation();
  const layoutRenderer = () => {
    if (location.pathname === ROUTER_PATH.KIOSK) {
      return <Outlet />;
    } else {
      return (
        <div className="h-full ">
          <KioskHeader />
          <div className="h-[calc(100%-136px)] ">
            <Outlet />
          </div>
        </div>
      );
    }
  };
  return (
    // 배경 이미지를 전체 화면에 적용합니다.
    <main className="bg-[url('/src/assets/images/kiosk/kiosk-bg.png')]  bg-contain bg-no-repeat bg-center min-h-screen flex items-center justify-center">
      <div className="grid w-[1080px] h-[1920px] mx-auto border-l border-r border-gray-300">
        <KioskProvider>{layoutRenderer()}</KioskProvider>
      </div>
    </main>
  );
};

export default KioskPage;
