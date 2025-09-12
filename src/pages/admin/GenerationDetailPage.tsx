import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import AdminStatusLabel from '../../components/ui/AdminStatusLabel';
import {
  getSmsLabel,
  normalizeSmsStatus,
} from '../../utils/admin/statusMapping';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import AdminVideo from '../../components/ui/AdminVideo';

const InfoLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="inline-flex items-center h-6 font-medium text-[12px] text-[#8e9aa4] bg-[#F4F4F4] border-1 border-[#e9edf0] rounded-[6px] px-2">
      {children}
    </span>
  );
};

const GenerationDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['generationDetail', id],
    queryFn: () => adminApi.getGenerationDetail(id!),
    enabled: !!id,
  });

  if (!id) {
    return <div className="text-center p-10">잘못된 접근입니다.</div>;
  }

  if (isPending) {
    return <div className="text-center p-10">상세 정보를 불러오는 중...</div>;
  }

  if (isError) {
    return (
      <div className="text-center p-10 text-red-500">
        오류가 발생했습니다: {error.message}
      </div>
    );
  }
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const formattedDate = dayjs(data.createdAt)
    .tz('Asia/Seoul')
    .format('YYYY.MM.DD HH:mm:ss');

  return (
    <main className="py-[40px_120px] bg-[#F1F3F5]">
      <div className="w-[min(calc(100%-100px),1040px)] h-full mx-auto">
        <div className="grid grid-cols-[1fr_400px] items-start gap-5">
          {/* Video */}
          {data.videoUrl && <AdminVideo videoUrl={data.videoUrl} />}
          
          {/* Info */}
          <div className="bg-white px-5 py-6 rounded-[16px] border-1 border-[#f0f0f0]">
            <header className="flex items-center justify-between pb-[30px]">
              <h2 className="font-semibold text-[18px]">생성완료</h2>
              <span className="text-[14px] text-[#c3c9ce]">
                {formattedDate}
              </span>
            </header>
            <section className="flex flex-col gap-[30px]">
              <article>
                <h3 className="texxt-[14px] font-medium text-[#5a646c] pb-3">
                  관객 정보
                </h3>
                <div className="flex gap-1">
                  <InfoLabel>
                    {data.sexGroup === 'man' ? '남성' : '여성'}
                  </InfoLabel>
                  <InfoLabel>{data.ageGroup}대</InfoLabel>
                </div>
              </article>
              <article>
                <h3 className="texxt-[14px] font-medium text-[#5a646c] pb-3">
                  의상 키워드
                </h3>
                <p className="text-[#8E9AA4] text-[12px] font-medium leading-[1.2]">
                  {data.keyword}
                </p>
              </article>
              <article>
                <h3 className="texxt-[14px] font-medium text-[#5a646c] pb-3">
                  SMS 문자발송
                </h3>
                <AdminStatusLabel variant={normalizeSmsStatus(data.smsStatus)}>
                  {getSmsLabel(data.smsStatus)}
                </AdminStatusLabel>
              </article>
              <article>
                <h3 className="texxt-[14px] font-medium text-[#5a646c] pb-3">
                  생성 이미지
                </h3>
                <img
                  src={data.imageUrl}
                  alt="Generated"
                  className="w-[255px] object-cover rounded-[12px]"
                />
              </article>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GenerationDetailPage;
