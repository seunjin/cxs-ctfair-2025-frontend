import { Link } from 'react-router-dom';
import { ROUTER_PATH } from '../router';

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">홈페이지</h1>
      <ul>
        <li className="text-blue-600 underline">
          <Link to={ROUTER_PATH.KIOSK}>키오스트</Link>
        </li>
        <li className="text-blue-600 underline">
          <Link to={ROUTER_PATH.ADMIN}>관리자</Link>
        </li>
        <li className="text-blue-600 underline">
          <Link to={ROUTER_PATH.DISPLAY}>디스플레이</Link>
        </li>
      </ul>
    </div>
  );
}
