import { Outlet } from 'react-router-dom';

const AdminPage = () => {
  return (
    <div>
      {/* TODO: 관리자 페이지 공통 레이아웃 (e.g., 사이드바, 헤더) */}
      <h2>Admin Section</h2>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPage;

