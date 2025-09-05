import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import KioskPage from './pages/KioskPage';
import AdminPage from './pages/AdminPage';
import DisplayPage from './pages/DisplayPage';
import MainStep from './pages/kiosk/MainStep';
import InfoStep from './pages/kiosk/InfoStep';
import CaptureStep from './pages/kiosk/CaptureStep';
import KeywordsStep from './pages/kiosk/KeywordsStep';
import CompleteStep from './pages/kiosk/CompleteStep';
import PhoneStep from './pages/kiosk/PhoneStep';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'kiosk',
        element: <KioskPage />,
        children: [
          {
            index: true, // /kiosk 경로의 기본 페이지
            element: <MainStep />,
          },
          {
            path: 'info', // /kiosk/info
            element: <InfoStep />,
          },
          {
            path: 'capture', // /kiosk/capture
            element: <CaptureStep />,
          },
          {
            path: 'keywords', // /kiosk/keywords
            element: <KeywordsStep />,
          },
          {
            path: 'complete', // /kiosk/complete
            element: <CompleteStep />,
          },
          {
            path: 'phone', // /kiosk/phone
            element: <PhoneStep />,
          },
        ],
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'display',
        element: <DisplayPage />,
      },
    ],
  },
]);

export default router;