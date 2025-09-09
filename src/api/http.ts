import ky from '@toss/ky';

// 응답 형식에 대한 기본 인터페이스
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

const kyOptions = {
  // API 엔드포인트의 기본 URL을 환경 변수에서 가져옵니다.
  prefixUrl: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10초 타임아웃
  hooks: {
    /**
     * 요청이 보내지기 전에 실행됩니다.
     * 주로 인증 토큰을 헤더에 추가하는 데 사용됩니다.
     */
    beforeRequest: [
      (request: Request) => {
        request.headers.set('Authorization', 'bearer 41f065b5-7c8f-4c29-8dad-68478c706778');
        request.headers.set('Content-Type', 'application/json');
      },
    ],
    /**
     * 응답을 받은 후 실행됩니다.
     * 전역적인 에러 처리나 응답 데이터 가공에 사용될 수 있습니다.
     */
    afterResponse: [
      async (_request: Request, _options: any, response: Response) => {
        if (response.status === 401) {
          // 예: 토큰 만료 시 로그인 페이지로 리디렉션
          console.error('인증이 만료되었습니다. 다시 로그인해주세요.');
          // window.location.href = '/login';
        }
        return response;
      },
    ],
  },
  /**
   * HTTP 에러 발생 시 재시도 로직을 설정합니다.
   */
  retry: {
    limit: 2, // 최대 2번 재시도
    methods: ['get', 'head'], // GET, HEAD 메서드에서만 재시도
    statusCodes: [408, 413, 429, 500, 502, 503, 504], // 재시도할 상태 코드
    backoffLimit: 3000, // 재시도 간격 최대 3초
  },
};

// 설정이 적용된 ky 인스턴스 생성
const api = ky.create(kyOptions);

/**
 * DX를 고려한 HTTP 메서드 래퍼
 * - ky의 기본 기능을 사용하면서, 공통 로직과 타입 추론을 강화합니다.
 * - .json<T>() 호출을 내부적으로 처리하여 사용 편의성을 높입니다.
 */
export const http = {
  /**
   * HTTP GET 요청을 보냅니다.
   * @param url 요청할 경로
   * @param options 추가적인 ky 옵션
   * @returns Promise<T> - 제네릭으로 지정된 타입의 데이터
   */
  get: async <T>(url: string, options?: any): Promise<T> => {
    try {
      const response = await api.get(url, options);
      const apiResponse = await response.json<ApiResponse<T>>();
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'API 요청 처리 중 에러가 발생했습니다.');
      }
      return apiResponse.data;
    } catch (error: any) {
      // HTTPError 타입인지 확인하여 더 구체적인 에러 메시지를 제공
      if (error.response) {
        const errorBody = await error.response.json();
        throw new Error(errorBody.message || `HTTP error! status: ${error.response.status}`);
      }
      throw error;
    }
  },

  /**
   * HTTP POST 요청을 보냅니다.
   * @param url 요청할 경로
   * @param json 전송할 데이터
   * @param options 추가적인 ky 옵션
   * @returns Promise<T> - 제네릭으로 지정된 타입의 데이터
   */
  post: async <T, R = T>(url: string, json?: R, options?: any): Promise<T> => {
    try {
      const response = await api.post(url, { json, ...options });
      const apiResponse = await response.json<ApiResponse<T>>();
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'API 요청 처리 중 에러가 발생했습니다.');
      }
      return apiResponse.data;
    } catch (error: any) {
      if (error.response) {
        const errorBody = await error.response.json();
        throw new Error(errorBody.message || `HTTP error! status: ${error.response.status}`);
      }
      throw error;
    }
  },

  /**
   * HTTP PUT 요청을 보냅니다.
   * @param url 요청할 경로
   * @param json 전송할 데이터
   * @param options 추가적인 ky 옵션
   * @returns Promise<T> - 제네릭으로 지정된 타입의 데이터
   */
  put: async <T, R = T>(url: string, json?: R, options?: any): Promise<T> => {
    try {
      const response = await api.put(url, { json, ...options });
      const apiResponse = await response.json<ApiResponse<T>>();
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'API 요청 처리 중 에러가 발생했습니다.');
      }
      return apiResponse.data;
    } catch (error: any) {
      if (error.response) {
        const errorBody = await error.response.json();
        throw new Error(errorBody.message || `HTTP error! status: ${error.response.status}`);
      }
      throw error;
    }
  },

  /**
   * HTTP DELETE 요청을 보냅니다.
   * @param url 요청할 경로
   * @param options 추가적인 ky 옵션
   * @returns Promise<T> - 제네릭으로 지정된 타입의 데이터
   */
  delete: async <T>(url: string, options?: any): Promise<T> => {
    try {
      const response = await api.delete(url, options);
      const apiResponse = await response.json<ApiResponse<T>>();
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'API 요청 처리 중 에러가 발생했습니다.');
      }
      return apiResponse.data;
    } catch (error: any) {
      if (error.response) {
        const errorBody = await error.response.json();
        throw new Error(errorBody.message || `HTTP error! status: ${error.response.status}`);
      }
      throw error;
    }
  },
};
