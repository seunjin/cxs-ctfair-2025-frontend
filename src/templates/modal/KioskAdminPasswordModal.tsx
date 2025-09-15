import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowRight from '../../assets/icons/arrow-narrow-right.svg?react';
import { useKiosk } from '../../contexts/kiosk';
import { type DocentTeam } from '../../contexts/kiosk/KioskContext';
import { useDialogs } from '../../lib/dialogs';
import { ROUTER_PATH } from '../../router';

const DOCENT_PASSWORDS: Record<string, DocentTeam> = {
  '1111': 'a', // 가
  '2222': 'b', // 나
  '3333': 'c', // 다
  '4444': 'd', // 라
};

const PhoneNumberButton = ({
  number,
  onClick,
}: {
  number: string;
  onClick: VoidFunction;
}) => {
  return (
    <div
      className="size-24 bg-[#111] rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] flex justify-center items-center gap-3 outline-[3px] outline-offset-[-3px] outline-white active-scale-95 duration-100"
      onClick={onClick}
    >
      <div className="text-center justify-start text-white text-3xl font-semibold leading-[60px]">
        {number}
      </div>
    </div>
  );
};

const PhoneClearButton = ({ onClick }: { onClick: VoidFunction }) => {
  return (
    <div
      className="size-24  bg-[#111]/5 rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-sm flex justify-center items-center gap-2.5 active-scale-95 duration-100"
      onClick={onClick}
    >
      <div className="text-center justify-start text-black text-xl font-semibold ">
        Clear
      </div>
    </div>
  );
};

const PhoneRemoveButton = ({ onClick }: { onClick: VoidFunction }) => {
  return (
    <div
      className="size-24  bg-[#111]/5 rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-sm flex justify-center items-center gap-2.5 active-scale-95 duration-100"
      onClick={onClick}
    >
      <div className="text-center justify-start">
        <ArrowRight className="size-9 rotate-180 invert-100" />
      </div>
    </div>
  );
};

const KioskAdminPasswordModal = () => {
  const [password, setPassword] = useState<string>('');
  const { setDocentTeam } = useKiosk();
  const { openDialog, closeDialog } = useDialogs();
  const navigate = useNavigate();

  const handleNumberClick = (number: string) => {
    if (password.length < 4) {
      setPassword(password + number);
    }
  };

  const handleClear = () => {
    setPassword('');
  };

  const handleRemove = () => {
    setPassword((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    if (password.length === 4) {
      const team = DOCENT_PASSWORDS[password];
      if (team) {
        setDocentTeam(team);
        navigate(ROUTER_PATH.DOCENT_INFO);
        closeDialog();
      } else {
        // TODO: 비밀번호 오류 처리 (예: 흔들리는 애니메이션)
        openDialog('alert', {
          form: 'kiosk',
          message: '비밀번호가 올바르지 않습니다.',
          onOk: () => setPassword(''),
        });
      }
    }
  }, [password, setDocentTeam, navigate, closeDialog]);

  return (
    <div className="w-[400px]">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="py-[40px]">
            <h2 className="text-center text-4xl font-bold pb-8">관리자 패널</h2>
            <div className="flex justify-center  ">
              <div className="w-[320px] rounded-full bg-black">
                <input
                  type="password"
                  value={password}
                  readOnly
                  placeholder="비밀번호를 입력해주세요."
                  className="appearance-none w-full text-2xl leading-[50px] font-semibold  focus:outline-none text-white text-center tracking-widest placeholder:text-gray-100/50 placeholder:text-xl"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex flex-col justify-start items-start gap-4 pb-[40px]">
          <div className="inline-flex justify-start items-center gap-4">
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
          <div className="inline-flex justify-start items-center gap-4">
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
          <div className="inline-flex justify-start items-center gap-4">
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
          <div className="inline-flex justify-start items-center gap-4">
            <PhoneClearButton onClick={handleClear} />
            <PhoneNumberButton
              number="0"
              onClick={() => handleNumberClick('0')}
            />
            <PhoneRemoveButton onClick={handleRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskAdminPasswordModal;
