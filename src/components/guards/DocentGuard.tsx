
import { useKiosk } from '../../contexts/kiosk/useKiosk';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';

const DocentGuard = () => {
  const { docentTeam } = useKiosk();

  if (!docentTeam) {
    return <Navigate to={ROUTER_PATH.KIOSK} replace />;
  }

  return <Outlet />;
};

export default DocentGuard;
