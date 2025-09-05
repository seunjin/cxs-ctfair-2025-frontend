import { Link } from 'react-router-dom';

const PhoneStep = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">휴대폰 번호 입력</h1>
      <p className="mt-2 text-lg">
        결과를 전송받을 휴대폰 번호를 입력해주세요.
      </p>
      <div className="mt-8 w-full max-w-md">
        {/* TODO: 실제 폼 구현 */}
        <input
          type="tel"
          placeholder="'-' 없이 숫자만 입력"
          className="w-full rounded-lg border p-4 text-xl"
        />
      </div>
      <Link
        to="/kiosk" // TODO: 전송 후 완료 페이지나 메인으로 이동
        className="mt-8 rounded-full bg-blue-600 px-12 py-4 text-2xl font-bold text-white transition-transform hover:scale-105"
      >
        전송하기
      </Link>
    </div>
  );
};

export default PhoneStep;
