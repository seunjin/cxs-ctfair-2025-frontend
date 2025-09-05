import { useQuery } from '@tanstack/react-query';
import { http } from '../api/http';

// API를 통해 가져올 사용자 데이터의 타입을 정의합니다.
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

/**
 * 사용자 정보를 가져오는 API 함수입니다.
 * TanStack Query의 queryFn에서 호출됩니다.
 * @param userId 가져올 사용자의 ID
 */
const fetchUser = (userId: number): Promise<User> => {
  // http.get<User>를 사용하여 특정 타입의 데이터를 요청합니다.
  // 제네릭(<User>)을 통해 반환 데이터의 타입을 지정할 수 있습니다.
  return http.get<User>(`users/${userId}`);
};

/**
 * TanStack Query와 API 래퍼를 함께 사용하는 예시 컴포넌트입니다.
 */
const SampleQuery = () => {
  // useQuery를 사용하여 데이터를 가져옵니다.
  // queryKey: 데이터를 식별하는 고유한 키입니다.
  // queryFn: 데이터를 가져오는 비동기 함수입니다. http 클라이언트를 여기서 사용합니다.
  const { data, error, isLoading, isFetching } = useQuery<User, Error>({
    queryKey: ['user', 1], // 예시로 사용자 ID 1을 가져옵니다.
    queryFn: () => fetchUser(1),
  });

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  // 에러 발생 시 표시할 UI
  if (error) {
    return <div>에러가 발생했습니다: {error.message}</div>;
  }

  return (
    <div>
      <h1>TanStack Query와 @toss/ky 래퍼 사용 예시</h1>
      {isFetching && <div>업데이트 중...</div>}
      {data && (
        <article>
          <h2>사용자 정보</h2>
          <p>
            <strong>ID:</strong> {data.id}
          </p>
          <p>
            <strong>이름:</strong> {data.name}
          </p>
          <p>
            <strong>사용자명:</strong> {data.username}
          </p>
          <p>
            <strong>이메일:</strong> {data.email}
          </p>
        </article>
      )}
    </div>
  );
};

export default SampleQuery;
