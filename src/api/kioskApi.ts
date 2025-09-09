import { http } from './http';
import type { KioskResult, Keyword, CreateJobPayload, UpdateUserPhonePayload } from './types';

/**
 * 키오스크 결과 데이터를 가져옵니다.
 * @param id 해싱된 전화번호
 * @returns Promise<KioskResult>
 */
export const getKioskResult = (id: string): Promise<KioskResult> => {
  return http.get<KioskResult>(`/kiosk/results/${id}`);
};

/**
 * 키워드 목록을 가져옵니다.
 * @returns Promise<Keyword[]>
 */
export const getKeywords = (): Promise<Keyword[]> => {
  return http.get<Keyword[]>('/api/contents/keywords');
};

/**
 * 새로운 AI 작업을 생성합니다.
 * @param payload 작업 생성에 필요한 데이터
 * @returns Promise<unknown> - 서버 응답 타입이 정해지면 수정
 */
export const createJob = (payload: CreateJobPayload): Promise<unknown> => {
  return http.post('/api/jobs', payload);
};

/**
 * 사용자의 전화번호를 업데이트합니다.
 * @param payload 사용자 ID와 전화번호
 * @returns Promise<unknown>
 */
export const updateUserPhone = (payload: UpdateUserPhonePayload): Promise<unknown> => {
  return http.patch('/api/jobs/user-phone', payload);
};
