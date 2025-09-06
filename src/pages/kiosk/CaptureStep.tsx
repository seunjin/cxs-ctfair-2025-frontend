import { Link, useNavigate } from 'react-router-dom';
import FaceCapture from '../../components/kiosk/FaceCapture';
import { useFaceCapture } from '../../hooks/useFaceCapture';
import { ROUTER_PATH } from '../../router';
import Arrowleft from '../../assets/icons/arrow-narrow-left.svg?react';
import CameraIcon from '../../assets/icons/camera.svg?react';
import CaptureCountdown from '../../components/ui/CaptureCountdown';
import clsx from 'clsx';
import ArrowRight from '../../assets/icons/arrow-narrow-right.svg?react';
import RefreshIcon from '../../assets/icons/refresh.svg?react';
const CaptureStep = () => {
  const {
    webcamRef,
    canvasRef,
    modelsLoaded,
    isFaceAligned,
    capturedImage,
    userMessage,
    debugInfo,
    isCountingDown,
    countdown,
    setIsWebcamReady,
    handleCapture,
    handleRetake,
    handleUsePhoto,
  } = useFaceCapture();

  const navigate = useNavigate();

  const handleConfirmPhoto = () => {
    handleUsePhoto(); // Context에 이미지 저장
    navigate(ROUTER_PATH.KIOSK_KEYWORDS); // 키워드 선택 페이지로 이동
  };

  return (
    <div className="flex h-full flex-col py-[130px] px-20">
      <section>
        <div className="relative pb-[50px]">
          {isCountingDown && <CaptureCountdown count={countdown} />}

          <h2
            className={clsx(
              "flex items-center justify-center h-[140px] text-center  text-white text-5xl font-semibold font-['Pretendard'] leading-[70px] ",
              isCountingDown && 'opacity-0',
              capturedImage && 'opacity-100'
            )}
          >
            {capturedImage ? (
              <>이 사진으로 진행할까요?</>
            ) : (
              <>
                얼굴을 프레임 중앙에 맞추고
                <br />
                정면을 바라본 상태에서 촬영해주세요!
              </>
            )}
          </h2>
        </div>
        <div className="pb-10">
          <FaceCapture
            webcamRef={webcamRef}
            canvasRef={canvasRef}
            userMessage={userMessage}
            debugInfo={debugInfo}
            capturedImage={capturedImage}
            setIsWebcamReady={setIsWebcamReady}
          />
        </div>

        <div
          className={clsx(
            'text-center justify-start text-yellow-300 text-3xl font-bold leading-10',
            isCountingDown && 'opacity-0',
            capturedImage && 'opacity-100'
          )}
        >
          {capturedImage
            ? '* 촬영된 사진은 이미지 생성 후 즉시 파기됩니다.'
            : '* 선글라스, 모자, 마스크 등 얼굴을 가리는 소품은 착용하지 말아주세요.'}
        </div>
      </section>
      <section
        className={clsx(
          'flex-1 flex items-end',
          isCountingDown && 'opacity-0',
          capturedImage && 'opacity-100'
        )}
      >
        {capturedImage ? (
          <div className="mt-6 flex w-full justify-center gap-[30px] ">
            <button
              onClick={handleRetake}
              className="inline-flex justify-center items-center gap-3  flex-1 rounded-full h-40 bg-white text-[50px] font-bold text-blue-700"
            >
              <RefreshIcon /> 재촬영
            </button>
            <button
              onClick={handleConfirmPhoto}
              className="flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-blue-600 text-[50px] font-bold text-white"
            >
              다음 <ArrowRight className="w-13 h-13" />
            </button>
          </div>
        ) : (
          <div
            className={clsx(
              'mt-6 flex w-full justify-center gap-[30px]',
              isCountingDown && 'opacity-0'
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
        )}
      </section>
    </div>
  );
};

export default CaptureStep;
