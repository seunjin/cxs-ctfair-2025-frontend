import ArrowRighgt from '../../assets/icons/arrow-narrow-right.svg?react';
import { useKiosk } from '../../contexts/kiosk';
import ComlpleteImg from '../../assets/images/kiosk/complete-img.jpg';

interface CompleteStepProps {
  isActive: boolean;
  onNext: () => void;
  goToStep: (stepName: string) => void;
}

const CompleteStep = ({ onNext, goToStep }: CompleteStepProps) => {
  const { resetState } = useKiosk();

  const handleExit = () => {
    resetState();
    goToStep('main');
  };

  return (
    <div className="flex h-full flex-col py-[40px_130px] px-20">
      <section className="pb-[63px]">
        <div className="self-stretch h-28 text-center justify-start text-[#0033FF] text-[110px] font-extrabold leading-[110px] [text-shadow:_0px_0px_15px_rgb(208_82_153_/_1.00)] mb-10">
          FINISH !
        </div>
        <div className="text-center justify-start">
          <span className="text-white text-[50px] font-semibold leading-[75px]">
            휴대폰번호를 입력하시면 <br />
          </span>
          <span className="text-yellow-300 text-[50px] font-semibold leading-[75px]">
            생성 완료 후
          </span>
          <span className="text-white text-[50px] font-semibold leading-[75px]">
            {' '}
            이미지와 영상을
            <br />
            문자로 보내드립니다!
          </span>
        </div>
      </section>
      <section className="flex justify-center pb-[66px]">
        <div className="w-[806px] p-2.5 bg-blue-700 rounded-[50px] shadow-[0px_0px_15px_0px_rgba(208,82,153,1.00)] shadow-[0px_0px_5px_0px_rgba(208,82,153,1.00)] inline-flex flex-col justify-start items-center gap-10">
          <img
            className="w-[785px] h-[523px] rounded-[50px]"
            src={ComlpleteImg}
            alt="kiosk-complete-img"
          />
        </div>
      </section>
      <section>
        <div className="text-center justify-start">
          <span className="text-white text-[50px] font-semibold font-['Pretendard'] leading-[75px] [text-shadow:_0px_2px_9px_rgb(0_0_0_/_0.25)]">
            AI가 만든 당신의 런웨이 영상은
            <br />약{' '}
          </span>
          <span className="text-yellow-300 text-[50px] font-extrabold font-['Pretendard'] leading-[75px] [text-shadow:_0px_2px_9px_rgb(0_0_0_/_0.25)]">
            10분
          </span>
          <span className="text-white text-[50px] font-semibold font-['Pretendard'] leading-[75px] [text-shadow:_0px_2px_9px_rgb(0_0_0_/_0.25)]">
            {' '}
            뒤 무대 스크린에서 상영됩니다.
          </span>
        </div>
      </section>

      <section className="flex-1 flex items-end">
        <div className="flex w-full gap-[30px]">
          <button
            onClick={handleExit}
            className="inline-flex justify-center items-center gap-3 w-[310px] rounded-full h-40 bg-white text-[50px] font-bold text-[#0033FF] active:scale-95 duration-100"
          >
            종료
          </button>
          <button
            onClick={onNext}
            className="inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-[#0033FF] text-[50px] font-bold text-white active:scale-95 duration-100"
          >
            휴대폰번호 입력 <ArrowRighgt />
          </button>
        </div>
      </section>
    </div>
  );
};

export default CompleteStep;
