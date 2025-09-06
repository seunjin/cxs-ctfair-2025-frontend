import { Link } from 'react-router-dom';
import FaceCapture from '../../components/kiosk/FaceCapture';
import { useKiosk } from '../../contexts/kiosk';
import { useFaceCapture } from '../../hooks/useFaceCapture';
import { ROUTER_PATH } from '../../router';
import Arrowleft from '../../assets/icons/arrow-narrow-left.svg?react';
import CameraIcon from '../../assets/icons/camera.svg?react';
import CaptureCountdown from '../../components/ui/CaptureCountdown';
import clsx from 'clsx';

const CaptureStep = () => {
  const {
    webcamRef,
    canvasRef,
    modelsLoaded,
    isFaceAligned,
    capturedImage,
    userMessage,
    debugInfo,
    isApiLoading,
    isCountingDown,
    countdown,
    setIsWebcamReady,
    handleCapture,
    handleRetake,
    handleUsePhoto,
  } = useFaceCapture();

  const { sexGroup, ageGroup } = useKiosk();
  console.log('Selected Sex:', sexGroup);
  console.log('Selected Age:', ageGroup);

  // const navigate = useNavigate();

  // TODO: FaceCapture 컴포넌트에서 사진 전송 성공 시 다음 페이지로 이동하는 로직 필요
  // const onCaptureSuccess = (result) => {
  //   navigate('/kiosk/keywords', { state: { result } });
  // };

  return (
    <div className="flex h-full flex-col py-[130px] px-20">
      <section>
        <div className="relative">
          {isCountingDown && <CaptureCountdown count={countdown} />}

          <h2
            className={clsx(
              "text-center justify-start text-white text-5xl font-semibold font-['Pretendard'] leading-[70px] pb-[50px]",
              isCountingDown && 'opacity-0'
            )}
          >
            얼굴을 프레임 중앙에 맞추고
            <br />
            정면을 바라본 상태에서 촬영해주세요!
          </h2>
        </div>
        <div className="pb-10">
          <FaceCapture
            webcamRef={webcamRef}
            canvasRef={canvasRef}
            userMessage={userMessage}
            debugInfo={debugInfo}
            capturedImage={capturedImage}
            isApiLoading={isApiLoading}
            setIsWebcamReady={setIsWebcamReady}
          />
        </div>

        <div
          className={clsx(
            'text-center justify-start text-yellow-300 text-3xl font-bold leading-10',
            isCountingDown && 'opacity-0'
          )}
        >
          * 선글라스, 모자, 마스크 등 얼굴을 가리는 소품은 착용하지 말아주세요.
        </div>
      </section>
      <section className="flex-1 flex items-end">
        {capturedImage && (
          <div className="mt-6 flex w-full justify-center gap-[30px] ">
            <button
              onClick={handleRetake}
              className="inline-flex justify-center items-center gap-3  w-[310px] rounded-full h-40 bg-white text-[50px] font-bold text-blue-700"
              disabled={isApiLoading}
            >
              <Arrowleft className="w-13 h-13" /> 재촬영
            </button>
            <button
              onClick={handleUsePhoto}
              className="w-40 rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isApiLoading}
            >
              {isApiLoading ? '전송 중...' : '사진 사용'}
            </button>
          </div>
        )}
        <div
          className={clsx(
            'mt-6 flex w-full justify-center gap-[30px]',
            isCountingDown && capturedImage && 'opacity-0',
            capturedImage && 'hidden'
          )}
        >
          <Link
            to={ROUTER_PATH.KIOSK_INFO}
            className="inline-flex justify-center items-center gap-3  w-[310px] rounded-full h-40 bg-white text-[50px] font-bold text-blue-700"
          >
            <Arrowleft className="w-13 h-13" /> 이전
          </Link>
          <button
            onClick={handleCapture}
            className="flex  justify-center items-center gap-3 flex-1 rounded-full h-40 bg-blue-600 text-[50px] font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-500 "
            disabled={!modelsLoaded || !isFaceAligned || isCountingDown}
          >
            <CameraIcon /> 촬영하기
          </button>
        </div>
      </section>
    </div>
  );
};

export default CaptureStep;
