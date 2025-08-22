import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import KioskPage from './pages/KioskPage';
import AdminPage from './pages/AdminPage';
import DisplayPage from './pages/DisplayPage';

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
