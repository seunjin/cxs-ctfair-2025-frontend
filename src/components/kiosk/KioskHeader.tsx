import { useNavigate } from 'react-router-dom';
import { useKiosk } from '../../contexts/kiosk';
import { useDialogs } from '../../lib/dialogs';
import { ROUTER_PATH } from '../../router';

const KioskHeader = () => {
  const router = useNavigate();
  const { resetState } = useKiosk();
  const { openDialog } = useDialogs();

  const handleReset = () => {
    console.log('resetState called from KioskHeader');
    resetState();
    router(ROUTER_PATH.KIOSK);
  };
  // openDialog('modal', { children: <div>asd</div> });
  return (
    <header className="sticky z-100 top-0 w-full h-[136px] flex items-center justify-between px-10">
      <h1 className="text-center justify-start text-[#0033FF] text-[50px] font-extrabold   [text-shadow:_0px_0px_15px_rgb(208_82_153_/_1.00)] ">
        SIMULATED RUNWAY
      </h1>
      <button
        onClick={() => {
          openDialog('confirm', {
            message: '진행중이던 체험을 취소하고\n처음으로 돌아갈까요?',
            form: 'kiosk',
            onConfirm: handleReset,
            confirmButtonText: '처음으로',
          });
        }}
        className="text-white text-3xl font-bold border-[2px] border-white leading-10 px-6 py-3 rounded-[99px]  outline-2 outline-offset-[-2px] outline-white/80 inline-flex justify-center items-center gap-2.5
"
      >
        처음으로
      </button>
    </header>
  );
};

export default KioskHeader;
