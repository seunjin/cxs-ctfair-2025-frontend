import { Link } from 'react-router-dom';

const InfoStep = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">관객 정보 입력</h1>
      <p className="mt-2 text-lg">
        전시에 사용될 간단한 정보를 입력해주세요.
      </p>
      <div className="mt-8 w-full max-w-md">
        {/* TODO: 실제 폼 구현 */}
        <input
          type="text"
          placeholder="이름 또는 닉네임"
          className="w-full rounded-lg border p-4 text-xl"
        />
        <input
          type="email"
          placeholder="이메일 (선택)"
          className="mt-4 w-full rounded-lg border p-4 text-xl"
        />
      </div>
      <Link
        to="/kiosk/capture"
        className="mt-8 rounded-full bg-blue-600 px-12 py-4 text-2xl font-bold text-white transition-transform hover:scale-105"
      >
        다음 단계로
      </Link>
    </div>
  );
};

export default InfoStep;
