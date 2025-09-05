import { Link } from 'react-router-dom';

const CompleteStep = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold">🎉 생성이 완료되었습니다! 🎉</h1>
      <p className="mt-4 text-2xl">결과물을 확인하고 저장하세요.</p>
      <div className="mt-8 h-96 w-96 bg-gray-200">
        {/* TODO: 생성된 이미지 표시 */}
      </div>
      <div className="mt-8 flex space-x-4">
        <Link
          to="/kiosk/phone"
          className="rounded-full bg-green-600 px-10 py-4 text-2xl font-bold text-white transition-transform hover:scale-105"
        >
          문자로 받기
        </Link>
        <Link
          to="/kiosk"
          className="rounded-full bg-gray-500 px-10 py-4 text-2xl font-bold text-white transition-transform hover:scale-105"
        >
          처음으로
        </Link>
      </div>
    </div>
  );
};

export default CompleteStep;
