import { Link } from 'react-router-dom';

const MainStep = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold">AI 페이스 포토존</h1>
      <p className="mt-4 text-2xl">
        AI가 만들어주는 나만의 특별한 사진을 경험해보세요.
      </p>
      <Link
        to="/kiosk/info"
        className="mt-12 rounded-full bg-blue-600 px-12 py-6 text-3xl font-bold text-white transition-transform hover:scale-105"
      >
        시작하기
      </Link>
    </div>
  );
};

export default MainStep;
