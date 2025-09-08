import { Link } from 'react-router-dom';
import { ROUTER_PATH } from '../router';

export default function HomePage() {
  const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_AKOOL_API_URL: import.meta.env.VITE_AKOOL_API_URL,
    VITE_AKOOL_CLIENT_ID: import.meta.env.VITE_AKOOL_CLIENT_ID,
    VITE_AKOOL_CLIENT_SECRET: import.meta.env.VITE_AKOOL_CLIENT_SECRET,
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">홈페이지</h1>
      <ul className="mb-8">
        <li className="text-blue-600 underline">
          <Link to={ROUTER_PATH.KIOSK}>키오스크</Link>
        </li>
        <li className="text-blue-600 underline">
          <Link to={ROUTER_PATH.ADMIN}>관리자</Link>
        </li>
        <li className="text-blue-600 underline">
          <Link to={ROUTER_PATH.DISPLAY}>디스플레이</Link>
        </li>
      </ul>

      <div className="mt-8 p-4 border rounded bg-gray-50">
        <h2 className="text-2xl font-semibold mb-3">환경 변수 확인</h2>
        <ul>
          {Object.entries(envVars).map(([key, value]) => (
            <li key={key} className="font-mono">
              <span className="font-bold">{key}:</span> {value || <span className="text-red-500">undefined</span>}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          <strong>주의:</strong> 이 정보는 디버깅 목적으로만 표시됩니다. 프로덕션 환경에서는 노출되지 않도록
          주의하세요.
        </p>
      </div>
    </div>
  );
}
