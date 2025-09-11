import { Link, useLocation } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';
import clsx from 'clsx';

// type CreditLabelProps = {
//   type: 'NEW' | 'AKL' | 'REP';
// };
// const CreditLabel = ({ type }: CreditLabelProps) => {
//   return (
//     <div className="h-7 px-3.5 py-1.5 bg-neutral-100 rounded-md outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-start items-center gap-0.5">
//       <div className="justify-start text-neutral-600 text-xs font-medium font-['Pretendard'] leading-3">
//         {type}
//       </div>
//       <div className="justify-start text-blue-700 text-xs font-bold font-['Pretendard'] leading-3">
//         342
//       </div>
//     </div>
//   );
// };

const AdminHeader = () => {
  const location = useLocation();
  const activeStyle = (router: string) => {
    if (router === location.pathname || location.pathname.includes(router)) {
      return 'text-black';
    }
    return 'text-[#c3c9ce]';
  };
  return (
    <header className="stiky top-0 h-[var(--admin-header-height)] flex items-center justify-between px-[50px]">
      <div className="flex items-center gap-13">
        <span className="font-bold text-[20px] text-cxs-primary">
          SIMULATED RUNWAY
        </span>
        <div className="inline-flex gap-5">
          <Link
            to={ROUTER_PATH.ADMIN_GENERATIONS}
            className={clsx(
              'text-[18px] font-semibold',
              activeStyle(ROUTER_PATH.ADMIN_GENERATIONS)
            )}
          >
            AI 생성
          </Link>
          <Link
            to={ROUTER_PATH.ADMIN_VIDEOS}
            className={clsx(
              'text-[18px] font-semibold',
              activeStyle(ROUTER_PATH.ADMIN_VIDEOS)
            )}
          >
            영상 관리
          </Link>
        </div>
      </div>
      {/* <div className="flex gap-1">
        <CreditLabel type="NEW" />
        <CreditLabel type="AKL" />
        <CreditLabel type="REP" />
      </div> */}
    </header>
  );
};

export default AdminHeader;
