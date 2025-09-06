import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useFaceCapture } from '../../hooks/useFaceCapture';
import { ROUTER_PATH } from '../../router';

import FaceCapture from '../../components/kiosk/FaceCapture';
import CaptureCountdown from '../../components/ui/CaptureCountdown';
import Arrowleft from '../../assets/icons/arrow-narrow-left.svg?react';
import CameraIcon from '../../assets/icons/camera.svg?react';
import ArrowRight from '../../assets/icons/arrow-narrow-right.svg?react';
import RefreshIcon from '../../assets/icons/refresh.svg?react';

const CaptureStep = () => {
  const {
    webcamRef,
    canvasRef,
    isFaceAligned,
    capturedImage,
    userMessage,
    debugInfo,
    isCountingDown,
    countdown,
    isDetectingFace, // react-query가 제공하는 API 로딩 상태
    setIsWebcamReady,
    handleCapture,
    resetCapture,
    handleUsePhoto,
  } = useFaceCapture();

  const navigate = useNavigate();

  const handleConfirmPhoto = () => {
    handleUsePhoto();
    navigate(ROUTER_PATH.KIOSK_KEYWORDS);
  };

  return (
    <div className="flex h-full flex-col px-20 py-[130px]">
      {/* 1. 상단 텍스트 영역 */}
      <section>
        <div className="relative pb-[50px]">
          {isCountingDown && <CaptureCountdown count={countdown} />}
          <h2
            className={clsx(
              "flex h-[140px] items-center justify-center text-center text-5xl font-semibold text-white font-['Pretendard'] leading-[70px]",
              { 'opacity-0': isCountingDown || capturedImage }
            )}
          >
            얼굴을 프레임 중앙에 맞추고
            <br />
            정면을 바라본 상태에서 촬영해주세요!
          </h2>
          <h2
            className={clsx(
              'absolute inset-0 flex h-[140px] items-center justify-center text-center text-5xl font-semibold text-white font-["Pretendard"] leading-[70px] transition-opacity',
              { 'opacity-0': !capturedImage }
            )}
          >
            이 사진으로 진행할까요?
          </h2>
        </div>

        {/* 2. 웹캠 / 캡처 이미지 표시 영역 */}
        <div className="relative pb-10">
          <FaceCapture
            webcamRef={webcamRef}
            canvasRef={canvasRef}
            userMessage={userMessage}
            debugInfo={debugInfo}
            capturedImage={capturedImage}
            isDetectingFace={isDetectingFace}
            setIsWebcamReady={setIsWebcamReady}
          />
        </div>

        {/* 3. 하단 주의사항 텍스트 영역 */}
        <div className="text-center text-3xl font-bold leading-10 text-yellow-300">
          {capturedImage
            ? '* 촬영된 사진은 이미지 생성 후 즉시 파기됩니다.'
            : isCountingDown
              ? ''
              : '* 선글라스, 모자, 마스크 등 얼굴을 가리는 소품은 착용하지 말아주세요.'}
        </div>
      </section>

      {/* 4. 하단 버튼 영역 */}
      <section className="flex flex-1 items-end">
        {capturedImage ? (
          // 촬영 성공 후 버튼
          <div className="mt-6 flex w-full justify-center gap-[30px]">
            <button
              onClick={resetCapture}
              className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-white h-40 text-[50px] font-bold text-[#0033FF]"
            >
              <RefreshIcon /> 재촬영
            </button>
            <button
              onClick={handleConfirmPhoto}
              className="flex flex-1 items-center justify-center gap-3 rounded-full bg-[#0033FF] h-40 text-[50px] font-bold text-white disabled:cursor-not-allowed disabled:text-white/40"
              disabled={isDetectingFace} // API 로딩 중에는 '다음' 버튼 비활성화
            >
              다음{' '}
              <ArrowRight className={clsx(isDetectingFace && 'opacity-40')} />
            </button>
          </div>
        ) : (
          // 촬영 준비 버튼
          <div
            className={clsx('mt-6 flex w-full justify-center gap-[30px]', {
              'opacity-0': isCountingDown,
            })}
          >
            <Link
              to={ROUTER_PATH.KIOSK_INFO}
              className="inline-flex w-[310px] items-center justify-center gap-3 rounded-full bg-white h-40 text-[50px] font-bold text-[#0033FF]"
            >
              <Arrowleft className="h-13 w-13" /> 이전
            </Link>
            <button
              onClick={handleCapture}
              className="flex flex-1 items-center justify-center gap-3 rounded-full bg-[#0033FF] h-40 text-[50px] font-bold text-white disabled:cursor-not-allowed  disabled:text-white/40 "
              disabled={!isFaceAligned}
            >
              <CameraIcon className={clsx(!isFaceAligned && 'opacity-40')} />{' '}
              촬영하기
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default CaptureStep;
