import ky, { Options, HTTPError } from '@toss/ky';
import { getAkoolToken } from './akoolAuth';

const akoolApiOptions: Options = {
  // Akool API 엔드포인트의 기본 URL을 환경 변수에서 가져옵니다.
  // 예: https://openapi.akool.com/api/open/v3/
  prefixUrl: `${import.meta.env.VITE_AKOOL_API_URL}api/open/v3/`,
  timeout: 30000, // 이미지 처리 등을 고려하여 타임아웃을 30초로 설정
  hooks: {
    /**
     * 요청이 보내지기 전에 실행됩니다.
     * Akool API 토큰을 가져와 인증 헤더를 추가합니다.
     */
    beforeRequest: [
      async (request) => {
        // 토큰 발급 요청 자체에는 인증 헤더를 추가하지 않도록 예외 처리합니다.
        if (request.url.endsWith('getToken')) {
          return;
        }
        
        const token = await getAkoolToken();
        request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
  },
  /**
   * HTTP 에러 발생 시 재시도 로직을 설정합니다.
   * 중요: 생성(POST) 요청 등은 재시도하지 않는 것이 안전할 수 있습니다.
   */
  retry: {
    limit: 1, // 재시도는 1번만 하도록 제한
  },
};

// 설정이 적용된 Akool API용 ky 인스턴스 생성
const akoolApi = ky.create(akoolApiOptions);

// 유틸리티 함수: 데이터 URL(Base64)을 Blob 객체로 변환
const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

/**
 * Akool API에 얼굴 인식을 요청합니다. (face-detect)
 * @param base64ImageDataUrl base64로 인코딩된 이미지 데이터 URL (e.g., 'data:image/jpeg;base64,...')
 * @returns API 응답 데이터
 */
export const detectFace = async (base64ImageDataUrl: string) => {
  // --- 디버깅 로그 추가 ---
  console.log('전송할 데이터 URL:', base64ImageDataUrl.substring(0, 100));
  // --------------------

  const payload = {
    // 데이터 URL 전체를 'img' 파라미터로 전송합니다.
    img: base64ImageDataUrl,
    single_face: true, // 단일 얼굴 감지 모드 활성화
  };

  // face-detect API는 다른 URL을 사용하므로, 별도의 ky 인턴스로 요청합니다.
  // 기존 akoolApiOptions에서 인증 훅만 가져와 사용합니다.
  const api = ky.create({
    timeout: 30000,
    hooks: {
      beforeRequest: akoolApiOptions.hooks!.beforeRequest,
    },
  });

  // POST 요청을 보냅니다. 본문을 JSON 형식으로 전송합니다.
  const response = await api.post('https://sg3.akool.com/detect', {
    json: payload,
  });

  return response.json<unknown>();
};

/**
 * Akool API 호출을 위한 HTTP 메서드 래퍼
 * - FormData 등 다양한 요청 본문을 처리할 수 있도록 유연하게 작성합니다.
 */
export const httpAkool = {
  /**
   * Akool API에 POST 요청을 보냅니다.
   * @param url 요청할 경로 (prefixUrl 이후의 경로, 예: 'face/swap')
   * @param body 전송할 데이터 (예: FormData)
   * @param options 추가적인 ky 옵션
   * @returns Promise<T> - 제네릭으로 지정된 타입의 응답 데이터
   */
  post: async <T>(url: string, body?: unknown, options?: Options): Promise<T> => {
    try {
      // ky는 body가 FormData 인스턴스일 경우 자동으로 Content-Type을 multipart/form-data로 설정합니다.
      // JSON을 보내려면 { json: body } 형태로 전달해야 합니다.
      // 여기서는 body를 직접 전달하여 유연성을 높입니다.
      const response = await akoolApi.post(url, { body, ...options });
      return await response.json<T>();
    } catch (error) {
      if (error instanceof HTTPError) {
        // Akool API의 에러 응답 형식에 맞춰 에러 메시지를 파싱합니다.
        const errorBody = await error.response.text();
        console.error('Akool API Error:', errorBody);
        throw new Error(`Akool API Error: ${error.response.status} ${errorBody}`);
      }
      console.error('An unexpected error occurred:', error);
      throw error;
    }
  },
  // 필요에 따라 get, put, delete 등의 메서드를 추가할 수 있습니다.
};