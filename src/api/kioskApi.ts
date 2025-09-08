import { http } from './http';
import type { KioskResult } from './types';

/**
 * 키오스크 결과 데이터를 가져옵니다.
 * @param id 해싱된 전화번호
 * @returns Promise<KioskResult>
 */
export const getKioskResult = (id: string): Promise<KioskResult> => {
  return http.get<KioskResult>(`/kiosk/results/${id}`);
};
