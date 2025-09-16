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
    isFaceAligned,
    capturedImage,
    userMessage,
    isCountingDown,
    countdown,
    isDetectingFace, // react-query가 제공하는 API 로딩 상태
    setIsWebcamReady,
    handleCapture,
    resetCapture,
    handleUsePhoto,
    zoomCapabilities,
    currentZoom,
    handleZoomChange,
  } = useFaceCapture();

  const navigate = useNavigate();

  const handleConfirmPhoto = () => {
    handleUsePhoto();
    navigate(ROUTER_PATH.KIOSK_KEYWORDS);
  };

  return (
    <div className="flex h-full flex-col px-20 py-[40px_130px]">
      {/* 1. 상단 텍스트 영역 */}
      <section>
        <div className="relative pb-[60px]">
          {isCountingDown && <CaptureCountdown count={countdown} />}
          <h2
            className={clsx(
              "flex h-[140px] items-center justify-center text-center text-[50px] font-semibold text-white font-['Pretendard'] leading-[70px]",
              { 'opacity-0': isCountingDown || capturedImage }
            )}
          >
            얼굴을 프레임 중앙에 맞추고
            <br />
            정면을 바라본 상태에서 촬영해주세요!
          </h2>
          <h2
            className={clsx(
              'absolute inset-0 flex h-[140px] items-center justify-center text-center text-[50px] font-semibold text-white font-["Pretendard"] leading-[70px] transition-opacity',
              { 'opacity-0': !capturedImage }
            )}
          >
            이 사진으로 진행할까요? <br />
            다시 촬영하려면 재촬영을 눌러주세요.
          </h2>
        </div>

        {/* 2. 웹캠 / 캡처 이미지 표시 영역 */}
        <div className="relative pb-20">
          <FaceCapture
            webcamRef={webcamRef}
            userMessage={userMessage}
            capturedImage={capturedImage}
            isDetectingFace={isDetectingFace}
            setIsWebcamReady={setIsWebcamReady}
            zoomCapabilities={zoomCapabilities}
            currentZoom={currentZoom}
            handleZoomChange={handleZoomChange}
          />
        </div>

        {/* 3. 하단 주의사항 텍스트 영역 */}
        <div className="text-center text-[40px] font-bold leading-[1.4] text-white">
          {capturedImage ? (
            '* 촬영된 사진은 이미지 생성 후 즉시 파기됩니다.'
          ) : isCountingDown ? (
            ''
          ) : (
            <>
              * 선글라스, 모자, 마스크 등 얼굴을 가리는 소품은 <br />
              착용하지 말아주세요.
            </>
          )}
        </div>
      </section>

      {/* 4. 하단 버튼 영역 */}
      <section className="flex flex-1 items-end">
        {capturedImage ? (
          // 촬영 성공 후 버튼
          <div className="mt-6 flex w-full justify-center gap-[30px]">
            <button
              onClick={resetCapture}
              className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-white h-40 text-[50px] font-bold text-[#0033FF] active:scale-95 duration-100"
            >
              <RefreshIcon /> 재촬영
            </button>
            <button
              onClick={handleConfirmPhoto}
              className="flex flex-1 items-center justify-center gap-3 rounded-full bg-[#0033FF] h-40 text-[50px] font-bold text-white disabled:cursor-not-allowed disabled:text-white/40 not-disabled:active:scale-95 duration-100"
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
              className="inline-flex w-[310px] items-center justify-center gap-3 rounded-full bg-white h-40 text-[50px] font-bold text-[#0033FF] active:scale-95 duration-100"
            >
              <Arrowleft className="h-13 w-13" /> 이전
            </Link>
            <button
              onClick={handleCapture}
              className="flex flex-1 items-center justify-center gap-3 rounded-full bg-[#0033FF] h-40 text-[50px] font-bold text-white disabled:cursor-not-allowed  disabled:text-white/40 not-disabled:active:scale-95 duration-100"
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
