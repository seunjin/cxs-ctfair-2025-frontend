import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="p-4">
      {/* 공통 네비게이션 바 등이 위치할 수 있습니다. */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
