import ky from '@toss/ky';

const AKOOL_TOKEN_STORAGE_KEY = 'akool_api_token';

interface GetTokenResponse {
  code: number;
  token: string;
  [key: string]: unknown; // for other potential properties
}

/**
 * localStorage에서 저장된 Akool API 토큰을 가져옵니다.
 * @returns 저장된 토큰 또는 null
 */
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AKOOL_TOKEN_STORAGE_KEY);
};

/**
 * Akool API 토큰을 localStorage에 저장합니다.
 * @param token 저장할 토큰
 */
const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AKOOL_TOKEN_STORAGE_KEY, token);
};

/**
 * Akool API 서버에 새로운 토큰을 요청합니다.
 * @returns 새로 발급받은 API 토큰
 */
const fetchNewToken = async (): Promise<string> => {
  const clientId = import.meta.env.VITE_AKOOL_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_AKOOL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Akool Client ID 또는 Secret이 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  }
  
  if (clientSecret === "여기에_발급받은_AKOOL_CLIENT_SECRET을_입력하세요") {
    throw new Error('Akool Client Secret이 실제 값으로 설정되지 않았습니다. .env.local 파일을 수정해주세요.');
  }

  const response = await ky.post(`${import.meta.env.VITE_AKOOL_API_URL}api/open/v3/getToken`, {
    json: {
      clientId,
      clientSecret,
    },
  }).json<GetTokenResponse>();

  if (response.code !== 1000 || !response.token) {
    throw new Error(`Akool 토큰 발급 실패: (Code: ${response.code})`);
  }

  return response.token;
};

/**
 * 유효한 Akool API 토큰을 가져오는 메인 함수.
 * localStorage에 토큰이 있으면 그것을 반환하고, 없으면 새로 발급받아 저장 후 반환합니다.
 * @returns {Promise<string>} Akool API 토큰
 */
export const getAkoolToken = async (): Promise<string> => {
  const storedToken = getStoredToken();
  if (storedToken) {
    return storedToken;
  }

  const newToken = await fetchNewToken();
  setStoredToken(newToken);
  return newToken;
};
