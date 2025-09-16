// import { useParams } from 'react-router-dom';
import DownloadIcon from '../../assets/icons/download.svg?react';
import { useQuery } from '@tanstack/react-query';
import { getKioskResult } from '../../api/kioskApi';
import { useParams } from 'react-router-dom';

function ResultPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isError, error } = useQuery({
    queryKey: ['kioskResult', id],
    queryFn: () => {
      if (!id) {
        throw new Error('ID가 제공되지 않았습니다.');
      }
      return getKioskResult(id);
    },
    enabled: !!id, // id가 있을 때만 쿼리 실행
  });

  const handleDownload = async (url: string, filename: string) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
    }
  };

  if (isError) {
    return <div>오류가 발생했습니다: {error.message}</div>;
  }

  return (
    <div className="bg-[url('/src/assets/images/kiosk/kiosk-simple-bg.png')] bg-cover  bg-center min-h-[100dvh] grid ">
      <div className="w-[min(768px,calc(100%-36px))] mx-auto h-full border-gray-300 py-[30px_60px]">
        <h1 className="text-center text-[#0033FF] text-3xl font-extrabold  [text-shadow:_0px_0px_14px_rgb(208_82_153_/_0.76)] pb-3">
          SIMULATED RUNWAY
        </h1>
        <h2 className="text-center justify-start text-white text-xl font-semibold leading-tight pb-5">
          생성된 이미지와 영상을 저장해주세요.
        </h2>
        <p className="text-center justify-start text-white text-xs font-normal leading-tight pb-[30px]">
          * 데이터는 보안을 위해 ??시간 후 자동 삭제되며,
          <br />
          이후에는 다운로드가 불가능합니다.
        </p>
        <div className="pb-5">
          <div className="flex items-center gap-3 max-w-[340px] mx-auto">
            <a
              href={data?.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-13 bg-white/5 rounded-xl shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] outline-1 outline-offset-[-1px] outline-white backdrop-blur-sm flex justify-center items-center gap-2"
            >
              <div className="flex items-center gap-2 text-center justify-start text-white text-base font-semibold leading-none">
                <DownloadIcon /> 이미지 저장
              </div>
            </a>
            <button
              onClick={() =>
                handleDownload(data?.videoUrl ?? '', 'generated-video.mp4')
              }
              disabled={!data?.videoUrl}
              className="flex-1 h-13 bg-white/5 rounded-xl shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] outline-1 outline-offset-[-1px] outline-white backdrop-blur-sm flex justify-center items-center gap-2"
            >
              <div className="flex items-center gap-2 text-center justify-start text-white text-base font-semibold leading-none">
                <DownloadIcon /> 비디오 저장
              </div>
            </button>
          </div>
        </div>
        <section className="flex flex-col items-center  w-full gap-3 ">
          <div className="aspect-square w-[min(340px,100%)] bg-gray-300">
            <img
              src={data?.imageUrl}
              alt="합성된 이미지"
              style={{ maxWidth: '100%' }}
            />
          </div>
          <div className="aspect-square w-[min(340px,100%)] bg-gray-300">
            {/* <h2>합성된 비디오</h2> */}
            <video controls src={data?.videoUrl} style={{ maxWidth: '100%' }} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResultPage;
