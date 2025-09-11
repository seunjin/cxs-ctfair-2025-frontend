import { http } from './http';
import type { GenerationsResponse } from './types';

interface GetGenerationsParams {
  lastId?: number;
  limit?: number;
  status?: string; // 예: 필터링을 위한 파라미터
}

const adminApi = {
  /**
   * @description 관리자 페이지에서 세대 목록을 무한 스크롤로 가져옵니다.
   * @param lastId 마지막으로 조회된 항목의 ID
   * @param limit 한 페이지에 가져올 항목 수
   */
  getGenerations: ({ lastId, limit = 24, status }: GetGenerationsParams) => {
    const searchParams = new URLSearchParams();
    if (lastId) {
      searchParams.append('lastId', String(lastId));
    }
    searchParams.append('limit', String(limit));
    if (status) {
      searchParams.append('status', status);
    }

    // http.ts에서 '/api'를 붙여주므로 '/admin/contents'가 맞습니다.
    return http.get<GenerationsResponse>(
      `/api/admin/contents?${searchParams.toString()}`
    );
  },
};

export default adminApi;
