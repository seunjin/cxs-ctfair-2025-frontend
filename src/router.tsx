import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import KioskPage from './pages/KioskPage';
import AdminPage from './pages/AdminPage';
import DisplayPage from './pages/DisplayPage';
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

export const ROUTER_PATH = {
  HOME: '/',
  KIOSK: '/kiosk',
  ADMIN: '/admin',
  DISPLAY: '/display',
  KIOSK_RESULT: '/kiosk/result/:id',
  DOCENT: '/docent',
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
        loader: keywordsLoader,
      },
      {
        path: ROUTER_PATH.DOCENT,
        element: <KioskPage />,
        loader: keywordsLoader,
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
