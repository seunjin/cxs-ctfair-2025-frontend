import { http } from './http';
import type {
  GenerationsResponse,
  KeywordsResponse,
  UpdateKeywordsPayload,
  GenerationDetail,
  AddFixedContentPayload,
} from './types';

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

    // http.ts에서 '/api'를 붙여주지 않으므로 전체 경로를 명시해야 합니다.
    return http.get<GenerationsResponse>(
      `/api/admin/contents?${searchParams.toString()}`
    );
  },

  /**
   * @description 키워드 목록을 가져옵니다.
   */
  getKeywords: () => {
    return http.get<KeywordsResponse>('/api/admin/keywords');
  },

  /**
   * @description 키워드 목록을 업데이트합니다.
   */
  updateKeywords: (keywords: UpdateKeywordsPayload) => {
    // http.put의 두 번째 인자로 payload를 직접 전달합니다.
    return http.put('/api/admin/keywords', keywords);
  },

  /**
   * @description contentId로 생성 상세 정보를 가져옵니다.
   */
  getGenerationDetail: (contentId: string) => {
    return http.get<GenerationDetail>(`/api/admin/contents/${contentId}`);
  },

  /**
   * @description fixedContentId로 고정 영상을 삭제합니다.
   */
  deleteFixedContent: (fixedContentId: number) => {
    return http.delete(`/api/admin/fixed-contents/${fixedContentId}`);
  },

  /**
   * @description 새로운 고정 영상을 추가합니다.
   */
  addFixedContent: (payload: AddFixedContentPayload) => {
    return http.post('/api/admin/fixed-content', payload);
  },
};

export default adminApi;
