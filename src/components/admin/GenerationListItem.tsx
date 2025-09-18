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
import clsx from 'clsx';
import { Icon } from '../ui/Icon';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
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
  const queryClient = useQueryClient();
  dayjs.extend(utc);
  dayjs.extend(timezone);

  // 한국 시간대 적용
  const formattedDate = dayjs(createdAt)
    .tz('Asia/Seoul')
    .format('YYYY.MM.DD HH:mm:ss');

  const { mutate: retryMutate } = useMutation({
    mutationFn: adminApi.retryVideoGeneration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
    },
  });

  const handleMoveDetailPage = () => {
    if (status == 'COMPLETE')
      router(`${ROUTER_PATH.ADMIN_GENERATIONS}/${String(contentId)}`);
  };
  const handleRetry = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    retryMutate(contentId);
  };
  return (
    <div
      role="button"
      className={clsx(status == 'COMPLETE' && 'cursor-pointer')}
      onClick={handleMoveDetailPage}
    >
      <div className="relative aspect-square rounded-[12px] bg-[#DCE2E6] border-1 border-[#E9E9E9] mb-3 overflow-hidden">
        {/* FAILED */}
        {status === 'FAILED' && (
          <button
            className="inline-flex items-center gap-[5px] absolute top-1/2 left-1/2 -translate-1/2 bg-white border-1 border-[#D3DBE1] rounded-full h-[38px] px-5 text-[#4C5862] text-[14px] font-medium whitespace-pre-wrap"
            onClick={handleRetry}
          >
            <Icon.RotateCcw className="size-[12px]" /> 생성 재시도
          </button>
        )}
        {/* PROCESSING */}
        {status === 'PROCESSING' && (
          <Icon.LoaderCircle className="absolute top-1/2 left-1/2 -translate-1/2 size-[27px] stroke-white animate-spin" />
        )}
        {/* COMPLETE */}
        {status === 'COMPLETE' && <img src={imageUrl} alt="" />}
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
