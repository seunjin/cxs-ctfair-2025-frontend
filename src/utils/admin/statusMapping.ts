/** ──────────────────────────────────────────────
 *  1) 서버 타입 (import로 제공되는 것을 그대로 사용)
 *  SmsStatus = 'SENT' | 'FAILED' | 'PENDING' | 'NOT_FOUND'
 *  AdminContentStatus = 'PROCESSING' | 'COMPLETE' | 'FAILED'
 *  ────────────────────────────────────────────── */

import type {
  AdminContentStatus,
  SmsStatus,
} from '../../components/admin/GenerationListItem';
import type { AdminStatusLabelUiVariant } from '../../components/ui/AdminStatusLabel';

/** 2) 공통 UI 토큰으로 정규화 (도메인별 매퍼) */
const SMS_TO_UI = {
  SENT: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
  NOT_FOUND: 'warning',
} as const satisfies Record<SmsStatus, AdminStatusLabelUiVariant>;

const CONTENT_TO_UI = {
  PROCESSING: 'pending',
  COMPLETE: 'success',
  FAILED: 'failed',
} as const satisfies Record<AdminContentStatus, AdminStatusLabelUiVariant>;

export const normalizeSmsStatus = (s: SmsStatus): AdminStatusLabelUiVariant =>
  SMS_TO_UI[s];
export const normalizeAdminContentStatus = (
  s: AdminContentStatus
): AdminStatusLabelUiVariant => CONTENT_TO_UI[s];

/** 3) 라벨 (도메인별) */
const SMS_LABELS: Record<SmsStatus, string> = {
  SENT: '발송완료',
  FAILED: '발송실패',
  PENDING: '발송대기',
  NOT_FOUND: '없음',
};

const CONTENT_LABELS: Record<AdminContentStatus, string> = {
  PROCESSING: '생성중',
  COMPLETE: '생성완료',
  FAILED: '생성실패',
};

export const getSmsLabel = (s: SmsStatus) => SMS_LABELS[s];
export const getContentLabel = (s: AdminContentStatus) => CONTENT_LABELS[s];
