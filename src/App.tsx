import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // --- DEBUG CODE START ---
  const apiUrl = import.meta.env.VITE_API_URL;
  const debugStyle: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    left: '10px',
    padding: '10px',
    background: 'rgba(255, 0, 0, 0.8)',
    color: 'white',
    zIndex: 9999,
    fontSize: '16px',
    border: '2px solid white',
  };
  // --- DEBUG CODE END ---

  return (
    <>
      {/* --- DEBUG CODE START --- */}
      <div style={debugStyle}>
        <strong>VITE_API_URL:</strong> {apiUrl || '!!! UNDEFINED !!!'}
      </div>
      {/* --- DEBUG CODE END --- */}
      <Outlet />
    </>
  );
}

export default App;
