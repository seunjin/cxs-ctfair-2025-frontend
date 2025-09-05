import { Outlet } from 'react-router-dom';

const KioskPage = () => {
  return (
    <div className="h-screen w-screen bg-gray-100 p-8">
      {/* TODO: 키오스크 플로우에 공통으로 필요한 UI (헤더, 푸터, 배경 등)를 여기에 추가 */}
      <main className="mx-auto h-full max-w-4xl rounded-lg bg-white shadow-xl">
        <Outlet />
      </main>
    </div>
  );
};

export default KioskPage;