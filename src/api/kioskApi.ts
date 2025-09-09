import { http } from './http';
import type { KioskResult, Keyword } from './types';

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
