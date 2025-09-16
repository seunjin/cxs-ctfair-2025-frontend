import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import KioskPage from './pages/KioskPage';
import AdminPage from './pages/AdminPage';
import DisplayPage from './pages/DisplayPage';
import MainStep from './pages/kiosk/MainStep';
import InfoStep from './pages/kiosk/InfoStep';
import KeywordsStep from './pages/kiosk/KeywordsStep';
import CompleteStep from './pages/kiosk/CompleteStep';
import PhoneStep from './pages/kiosk/PhoneStep';
import ResultPage from './pages/kiosk/ResultPage';
import { queryClient } from './queryClient';
import { getKeywords } from './api/kioskApi';
import GenerationsListPage from './pages/admin/GenerationsListPage';
import GenerationDetailPage from './pages/admin/GenerationDetailPage';
import VideoManagementPage from './pages/admin/VideoManagementPage';

// 키워드 데이터를 미리 로드하는 loader 함수
const keywordsLoader = async () => {
  const query = {
    queryKey: ['keywords'],
    queryFn: getKeywords,
  };
  // 캐시된 데이터가 없으면 API를 호출하고, 있으면 캐시된 데이터를 반환합니다.
  return await queryClient.ensureQueryData(query);
};

import DocentMainStep from './pages/docent/MainStep';
import DocentInfoStep from './pages/docent/InfoStep';
import DocentKeywordsStep from './pages/docent/KeywordsStep';
import DocentCompleteStep from './pages/docent/CompleteStep';
import DocentGuard from './components/guards/DocentGuard';

export const ROUTER_PATH = {
  HOME: '/',
  KIOSK: '/kiosk',
  ADMIN: '/admin',
  DISPLAY: '/display',
  KIOSK_MAIN: '/kiosk',
  KIOSK_INFO: '/kiosk/info',
  KIOSK_CAPTURE: '/kiosk/capture',
  KIOSK_KEYWORDS: '/kiosk/keywords',
  KIOSK_COMPLETE: '/kiosk/complete',
  KIOSK_PHONE: '/kiosk/phone',
  KIOSK_RESULT: '/kiosk/result/:id',
  DOCENT: '/docent',
  DOCENT_MAIN: '/docent',
  DOCENT_INFO: '/docent/info',
  DOCENT_CAPTURE: '/docent/capture',
  DOCENT_KEYWORDS: '/docent/keywords',
  DOCENT_COMPLETE: '/docent/complete',
  ADMIN_GENERATIONS: '/admin/generations',
  ADMIN_GENERATION_DETAIL: '/admin/generations/:id',
  ADMIN_VIDEOS: '/admin/videos',
};
const router = createBrowserRouter([
  {
    path: ROUTER_PATH.HOME,
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTER_PATH.KIOSK,
        element: <KioskPage />,
        loader: keywordsLoader, // KioskPage에 loader 연결
        children: [
          {
            index: true, // /kiosk 경로의 기본 페이지
            element: <MainStep />,
          },
          {
            path: ROUTER_PATH.KIOSK_INFO, // /kiosk/info
            element: <InfoStep />,
          },
          {
            path: ROUTER_PATH.KIOSK_CAPTURE, // /kiosk/capture
            element: <></>, // Outlet 렌더링 방지를 위해 빈 엘리먼트 설정
          },
          {
            path: ROUTER_PATH.KIOSK_KEYWORDS, // /kiosk/keywords
            element: <KeywordsStep />,
          },
          {
            path: ROUTER_PATH.KIOSK_COMPLETE, // /kiosk/complete
            element: <CompleteStep />,
          },
          {
            path: ROUTER_PATH.KIOSK_PHONE, // /kiosk/phone
            element: <PhoneStep />,
          },
        ],
      },
      {
        path: ROUTER_PATH.DOCENT,
        element: <KioskPage />, // 동일한 레이아웃 사용
        loader: keywordsLoader,
        children: [
          {
            index: true,
            element: <DocentMainStep />,
          },
          {
            element: <DocentGuard />,
            children: [
              {
                path: ROUTER_PATH.DOCENT_INFO,
                element: <DocentInfoStep />,
              },
              {
                path: ROUTER_PATH.DOCENT_CAPTURE,
                element: <></>,
              },
              {
                path: ROUTER_PATH.DOCENT_KEYWORDS,
                element: <DocentKeywordsStep />,
              },
              {
                path: ROUTER_PATH.DOCENT_COMPLETE,
                element: <DocentCompleteStep />,
              },
            ],
          },
        ],
      },
      {
        path: ROUTER_PATH.KIOSK_RESULT,
        element: <ResultPage />,
      },
      {
        path: ROUTER_PATH.ADMIN,
        element: <AdminPage />,
        children: [
          {
            index: true,
            element: <GenerationsListPage />,
          },
          {
            path: ROUTER_PATH.ADMIN_GENERATIONS,
            element: <GenerationsListPage />,
          },
          {
            path: ROUTER_PATH.ADMIN_GENERATION_DETAIL,
            element: <GenerationDetailPage />,
          },
          {
            path: ROUTER_PATH.ADMIN_VIDEOS,
            element: <VideoManagementPage />,
          },
        ],
      },
      {
        path: ROUTER_PATH.DISPLAY,
        element: <DisplayPage />,
      },
    ],
  },
]);

export default router;
