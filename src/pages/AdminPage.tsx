import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';

const AdminPage = () => {
  return (
    <div className="grid grid-rows-[var(--admin-header-height)_1fr] min-h-[100dvh] min-w-[1200px]">
      <AdminHeader />
      <main className="py-[40px_120px]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPage;
