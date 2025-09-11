import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDialogs } from './lib/dialogs';
import { DialogRenderer } from './components/dialogs/DialogRenderer';

function App() {
  const { dialogs } = useDialogs();
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <>
      <Outlet />
      <DialogRenderer dialogs={dialogs} />
    </>
  );
}

export default App;
