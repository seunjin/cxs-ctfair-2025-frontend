import { useKiosk } from '../../contexts/kiosk';
import { useEffect } from 'react';
import clsx from 'clsx';
import { useDialogs } from '../../lib/dialogs';
import { useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';

interface MainStepProps {
  isActive: boolean;
  onNext: () => void;
}

const MainStep = ({ isActive, onNext }: MainStepProps) => {
  const router = useNavigate();
  const { resetState, modelsLoaded } = useKiosk();
  const { openDialog } = useDialogs();
  // MainStep이 활성화될 때마다 상태를 초기화합니다.
  useEffect(() => {
    if (isActive) {
      resetState();
    }
  }, [isActive, resetState]);

  return (
    <div className="flex flex-col h-full pt-76 pb-15">
      <section className="pb-50">
        <h1 className="self-stretch text-center justify-start text-[#0033FF] text-9xl font-extrabold font-['Pretendard'] leading-[150px] [text-shadow:_0px_0px_15px_rgb(208_82_153_/_1.00)] pb-25">
          SIMULATED
          <br />
          RUNWAY
        </h1>
        <p className="text-center justify-start text-white text-7xl font-extrabold font-['Pretendard'] leading-[98px] pb-10">
          AI로 나만의 런웨이 무대!
          <br />
          지금 바로 주인공이 되어보세요.
        </p>
        <p className="text-center justify-start text-white text-4xl font-semibold font-['Pretendard'] leading-[60px]">
          얼굴을 촬영하고 원하는 의상을 고르면
          <br />
          AI가 런웨이 영상을 만들어드립니다.
        </p>
      </section>
      <section>
        <div className="flex justify-center ">
          <button
            onClick={modelsLoaded ? onNext : undefined}
            className={clsx(
              "w-[920px] px-2.5 py-12 rounded-[32px] mx-auto shadow-[0px_0px_15px_0px_rgba(208,82,153,1.00)] text-center text-white text-5xl font-bold font-['Pretendard'] leading-[75px]",
              modelsLoaded
                ? 'bg-blue-700 cursor-pointer'
                : 'bg-gray-500 cursor-not-allowed'
            )}
            disabled={!modelsLoaded}
          >
            {modelsLoaded ? '체험 시작하기' : 'AI 모델을 불러오는 중...'}
          </button>
        </div>
      </section>

      <section className=" flex flex-1 items-end justify-center ">
        <button
          className="inline-flex items-center gap-2"
          onClick={() => {
            openDialog('confirm', {
              form: 'kiosk',
              message: '키오스크로 돌아가시겠습니까?',
              onConfirm: () => {
                router(ROUTER_PATH.KIOSK);
              },
            });
          }}
        >
          <span className="text-center justify-start text-zinc-100/90 text-3xl font-semibold animate-pulse">
            - Docent -
          </span>
        </button>
      </section>
    </div>
  );
};

export default MainStep;
