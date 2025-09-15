import { useState } from 'react';
import ArrowRight from '../../assets/icons/arrow-narrow-right.svg?react';

const 도슨트_관리자_비밀번호 = {
  가: '1111',
  나: '2222',
  다: '3333',
  라: '4444',
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
      className="size-24 bg-[#111] rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] flex justify-center items-center gap-3 outline-[3px] outline-offset-[-3px] outline-white active:scale-95 duration-100"
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
      className="size-24  bg-[#111]/5 rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-sm flex justify-center items-center gap-2.5 active:scale-95 duration-100"
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
      className="size-24  bg-[#111]/5 rounded-full shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-sm flex justify-center items-center gap-2.5 active:scale-95 duration-100"
      onClick={onClick}
    >
      <div className="text-center justify-start">
        <ArrowRight className="size-9 rotate-180 invert-100" />
      </div>
    </div>
  );
};

const KioskAdminPasswordModal = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const handleNumberClick = (number: string) => {
    // 새로 입력된 숫자를 추가합니다.
    const newNumber = phoneNumber + number;

    // 11자리를 초과하지 않도록 합니다.
    if (newNumber.length > 4) {
      return;
    }

    setPhoneNumber(newNumber);
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const handleRemove = () => {
    // 현재 값에서 마지막 문자(숫자 또는 하이픈)를 제거한 후 다시 포맷팅합니다.
    const currentNumber = phoneNumber.replace(/-/g, '');
    const newNumber = currentNumber.slice(0, -1);

    setPhoneNumber(newNumber);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (
      value === 도슨트_관리자_비밀번호.가 ||
      value === 도슨트_관리자_비밀번호.나 ||
      value === 도슨트_관리자_비밀번호.다 ||
      value === 도슨트_관리자_비밀번호.라
    ) {
      //도슨트용라우트로 이동
    }
  };
  return (
    <div className="w-[400px]">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="py-[40px]">
            <h2 className="text-center text-4xl font-bold pb-8">관리자 패널</h2>
            <div className="flex justify-center  ">
              <div className="w-[320px] rounded-full bg-black">
                <input
                  type="password" // type을 'tel'로 변경하여 시맨틱을 개선합니다.
                  value={phoneNumber}
                  onChange={handleChange}
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
