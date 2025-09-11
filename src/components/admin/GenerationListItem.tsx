import {
  normalizeAdminContentStatus,
  getContentLabel,
  normalizeSmsStatus,
  getSmsLabel,
} from '../../utils/admin/statusMapping';
import AdminStatusLabel from '../ui/AdminStatusLabel';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';
export type SmsStatus = 'SENT' | 'FAILED' | 'PENDING' | 'NOT_FOUND';

export type AdminContentStatus = 'PROCESSING' | 'COMPLETE' | 'FAILED';
interface GenerationsListItemType {
  contentId: number;
  imageUrl?: string;
  smsStatus: SmsStatus;
  status: AdminContentStatus;
  createdAt: Date;
}

const GenerationsListItem = ({
  contentId,
  imageUrl,
  smsStatus,
  status,
  createdAt,
}: GenerationsListItemType) => {
  const router = useNavigate();
  dayjs.extend(utc);
  dayjs.extend(timezone);

  // 한국 시간대 적용
  const formattedDate = dayjs(createdAt)
    .tz('Asia/Seoul')
    .format('YYYY.MM.DD HH:mm:ss');

  return (
    <div
      className="cursor-pointer"
      onClick={() =>
        router(`${ROUTER_PATH.ADMIN_GENERATIONS}/${String(contentId)}`)
      }
    >
      <div className="aspect-square rounded-[12px] bg-[#DCE2E6] border-1 border-[#E9E9E9] mb-3 overflow-hidden">
        <img src={imageUrl} alt="" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          {/* AI 생성 상태 */}
          <AdminStatusLabel variant={normalizeAdminContentStatus(status)}>
            {getContentLabel(status)}
          </AdminStatusLabel>
          {/* 문자 발송 상태 (smsStatus가 있을 경우에만 렌더링) */}
          {
            <AdminStatusLabel variant={normalizeSmsStatus(smsStatus)}>
              {getSmsLabel(smsStatus)}
            </AdminStatusLabel>
          }
        </div>
        <span className="text-[14px] text-[#c3c9ce]">{formattedDate}</span>
      </div>
    </div>
  );
};

export default GenerationsListItem;
