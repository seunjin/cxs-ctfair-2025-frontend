import { useState } from 'react';
import ArrowRight from '../../assets/icons/arrow-narrow-right.svg?react';
import Checked from '../../assets/icons/checked.svg?react';
import clsx from 'clsx';
import { useKiosk } from '../../contexts/kiosk';
import { useNavigate } from 'react-router-dom';

interface PhoneStepProps {
  goToStep: (stepName: string) => void;
}

const PhoneNumberButton = ({
  number,
  onClick,
}: {
  number: string;
  onClick: VoidFunction;
}) => {
  return (
    <button
      className="w-36 h-36 bg-white rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] flex justify-center items-center gap-3 active:scale-95 duration-100"
      onClick={onClick}
    >
      <div className="text-center justify-start text-[#0033FF] text-6xl font-semibold leading-[60px]">
        {number}
      </div>
    </button>
  );
};

const PhoneClearButton = ({ onClick }: { onClick: VoidFunction }) => {
  return (
    <button
      className="w-36 h-36  bg-white/5 rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-sm flex justify-center items-center gap-2.5 active:scale-95 duration-100"
      onClick={onClick}
    >
      <div className="text-center justify-start text-white text-4xl font-semibold leading-9">
        Clear
      </div>
    </button>
  );
};

const PhoneRemoveButton = ({ onClick }: { onClick: VoidFunction }) => {
  return (
    <button
      className="w-36 h-36  bg-white/5 rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-sm flex justify-center items-center gap-2.5 active:scale-95 duration-100"
      onClick={onClick}
    >
      <div className="text-center justify-start text-white text-4xl font-semibold leading-9">
        <ArrowRight className="rotate-180" />
      </div>
    </button>
  );
};

const PhoneStep = ({ goToStep }: PhoneStepProps) => {
  const { resetState } = useKiosk();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState<string>('010');
  const [agree, setAgree] = useState<boolean>(false);

  const handleNumberClick = (number: string) => {
    const currentNumber = phoneNumber.replace(/-/g, '');
    const newNumber = currentNumber + number;

    if (newNumber.length > 11) {
      return;
    }

    const formattedNumber = newNumber
      .replace(/^(\d{0,3})/, '$1')
      .replace(/^(\d{3})(\d{0,4})/, '$1-$2')
      .replace(/^(\d{3}-\d{4})(\d{0,4})/, '$1-$2');

    setPhoneNumber(formattedNumber);
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const handleRemove = () => {
    const currentNumber = phoneNumber.replace(/-/g, '');
    const newNumber = currentNumber.slice(0, -1);

    const formattedNumber = newNumber
      .replace(/^(\d{0,3})/, '$1')
      .replace(/^(\d{3})(\d{0,4})/, '$1-$2')
      .replace(/^(\d{3}-\d{4})(\d{0,4})/, '$1-$2');

    setPhoneNumber(formattedNumber);
  };

  const handleSubmit = () => {
    // 도슨트 모드에서는 API 호출 없이 상태만 초기화하고 키오스크 메인으로 이동
    resetState();
    navigate('/kiosk');
  };

  return (
    <>
      <div className="flex h-full flex-col py-[40px_130px] px-20">
        <section className="pb-[112px]">
          <div className="text-center justify-start text-white text-[60px] font-semibold leading-[70px] pb-[110px]">
            휴대폰번호를 입력해주세요.
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="pb-[70px]">
              <input
                type="tel"
                value={phoneNumber}
                readOnly
                className="appearance-none text-6xl font-semibold leading-[60px] w-[590px] focus:outline-none bg-transparent text-white text-center tracking-widest"
              />
            </div>
            <div className="inline-flex flex-col justify-start items-start gap-7">
              <div className="inline-flex justify-start items-center gap-16">
                <PhoneNumberButton
                  number="1"
                  onClick={() => handleNumberClick('1')}
                />
                <PhoneNumberButton
                  number="2"
                  onClick={() => handleNumberClick('2')}
                />
                <PhoneNumberButton
                  number="3"
                  onClick={() => handleNumberClick('3')}
                />
              </div>
              <div className="inline-flex justify-start items-center gap-16">
                <PhoneNumberButton
                  number="4"
                  onClick={() => handleNumberClick('4')}
                />
                <PhoneNumberButton
                  number="5"
                  onClick={() => handleNumberClick('5')}
                />
                <PhoneNumberButton
                  number="6"
                  onClick={() => handleNumberClick('6')}
                />
              </div>
              <div className="inline-flex justify-start items-center gap-16">
                <PhoneNumberButton
                  number="7"
                  onClick={() => handleNumberClick('7')}
                />
                <PhoneNumberButton
                  number="8"
                  onClick={() => handleNumberClick('8')}
                />
                <PhoneNumberButton
                  number="9"
                  onClick={() => handleNumberClick('9')}
                />
              </div>
              <div className="inline-flex justify-start items-center gap-16">
                <PhoneClearButton onClick={handleClear} />
                <PhoneNumberButton
                  number="0"
                  onClick={() => handleNumberClick('0')}
                />
                <PhoneRemoveButton onClick={handleRemove} />
              </div>
            </div>
          </div>
        </section>
        <section>
          <div
            onClick={() => setAgree(!agree)}
            className="inline-flex justify-start items-center gap-5 pb-[30px] cursor-pointer active:scale-95 duration-100"
          >
            <div
              className={clsx(
                'w-20 h-20  rounded-[99px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px]  backdrop-blur-sm flex justify-center items-center gap-2.5',
                agree
                  ? 'bg-[#0033FF] outline-[#0033FF]'
                  : 'bg-white/5 outline-white'
              )}
            >
              <Checked />
            </div>
            <div className="text-center justify-start text-white text-5xl font-semibold leading-[50px]">
              개인정보 수집∙이용 동의
            </div>
          </div>

          <div className="text-white text-[34px] font-semibold leading-[51px] break-keep">
            입력하신 휴대폰번호는 AI 생성물 발송에만 사용되며, 전송 후 즉시
            폐기됩니다.
          </div>
        </section>
        <section className="flex-1 flex items-end">
          <div className="flex w-full gap-[30px]">
            <button
              onClick={handleSubmit}
              className="inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-[#0033FF] text-[50px] font-bold text-white disabled:text-white/40 not-disabled:active:scale-95 duration-100"
              disabled={phoneNumber.length !== 13 || !agree}
            >
              입력 완료
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default PhoneStep;
