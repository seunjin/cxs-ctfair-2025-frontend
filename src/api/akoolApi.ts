import ky from '@toss/ky';
import { getAkoolToken } from './akoolAuth';
import type { FaceDetectResponse } from './types';

// Akool API 요청에 공통적으로 사용될 인증 훅
const akoolAuthHook = {
  beforeRequest: [
    async (request: Request) => {
      // 토큰 발급 요청 자체에는 인증 헤더를 추가하지 않도록 예외 처리
      if (request.url.includes('getToken')) {
        return;
      }
      const token = await getAkoolToken();
      request.headers.set('Authorization', `Bearer ${token}`);
    },
  ],
};

// face-detect API를 위한 ky 인스턴스 생성
// (별도 도메인을 사용하므로 prefixUrl 없이 생성)
const detectApi = ky.create({
  timeout: 30000,
  hooks: akoolAuthHook,
});

/**
 * Akool API에 얼굴 인식을 요청합니다. (face-detect)
 * @param base64ImageDataUrl base64로 인코딩된 이미지 데이터 URL
 * @returns API 응답 데이터
 */
export const detectFace = async (
  base64ImageDataUrl: string
): Promise<FaceDetectResponse> => {
  const payload = {
    img: base64ImageDataUrl,
    single_face: true,
  };

  const data = await detectApi
    .post('https://sg3.akool.com/detect', {
      json: payload,
    })
    .json<FaceDetectResponse>();

  // API 응답 내용 자체에 에러 코드가 있는지 확인
  if (data.error_code !== 0) {
    // 에러 코드가 0이 아니면, 성공이 아니므로 에러를 발생시킴
    throw new Error(`API Error (${data.error_code}): ${data.error_msg}`);
  }

  return data;
};
