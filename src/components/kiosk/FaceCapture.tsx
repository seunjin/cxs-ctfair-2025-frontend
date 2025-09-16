import React from 'react';
import Webcam from 'react-webcam';
import CautionIcon from '../../assets/icons/caution.svg?react';
import FaceFrameGuide from '../../assets/images/kiosk/face-frame-guide.png';
import clsx from 'clsx';
const COMPONENT_SIZE_CLASS = 'w-[920px]';

type FaceCaptureProps = {
  webcamRef: React.Ref<Webcam>;
  userMessage: string;
  capturedImage: string | null;
  isDetectingFace: boolean;
  setIsWebcamReady: (isReady: boolean) => void;
  zoomCapabilities: { min: number; max: number; step: number } | null;
  currentZoom: number;
  handleZoomChange: (zoomValue: number) => void;
};

const FaceCapture = ({
  webcamRef,
  userMessage,
  capturedImage,
  isDetectingFace,
  setIsWebcamReady,
  zoomCapabilities,
  currentZoom,
  handleZoomChange,
}: FaceCaptureProps) => {
  return (
    <div className={`${COMPONENT_SIZE_CLASS} `}>
      {zoomCapabilities && !capturedImage && (
        <div
          className="fixed top-5 right-5 bg-black bg-opacity-50 p-4 rounded-lg text-white"
          style={{ zIndex: 9999 }}
        >
          <label
            htmlFor="zoom-slider"
            className="block mb-2 text-center font-semibold"
          >
            카메라 줌
          </label>
          <input
            id="zoom-slider"
            type="range"
            min={zoomCapabilities.min}
            max={zoomCapabilities.max}
            step={zoomCapabilities.step}
            value={currentZoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="w-48"
          />
        </div>
      )}
      <div
        className={clsx(
          'relative w-full overflow-hidden bg-[#333333]',

          capturedImage
            ? 'rounded-[60px] shadow-[0px_0px_50px_10px_rgba(208,82,153,0.80)] outline-[10px] outline-blue-700'
            : 'rounded-lg'
        )}
        style={{ aspectRatio: '1 / 1' }}
      >
        {capturedImage ? (
          <>
            {/* API 로딩 상태에 따라 블러 효과를 동적으로 적용하고 트랜지션 효과를 추가합니다. */}
            <div
              className={clsx(
                'absolute inset-0 z-10 flex flex-col items-center justify-center  ',
                isDetectingFace
                  ? 'backdrop-blur-[100px]'
                  : 'backdrop-blur-none duration-500'
              )}
              style={{ transitionProperty: 'backdrop-filter' }}
            >
              {isDetectingFace && (
                <>
                  <div className="mb-8 h-16 w-16 animate-spin rounded-full border-8 border-t-[#0033FF] border-white"></div>
                  <p className="text-4xl font-bold text-white">
                    얼굴을 확인 중입니다.
                  </p>
                </>
              )}
            </div>
            <img
              src={capturedImage}
              alt="Captured face"
              className="h-full w-full object-cover"
            />
          </>
        ) : (
          <>
            {(!capturedImage || !isDetectingFace) && (
              <div className="absolute top-6 left-1/2  -translate-x-1/2 z-100 flex flex-col justify-center">
                <div className="flex justify-center ">
                  <div
                    className={clsx(
                      'px-7 py-3  bg-rose-600 rounded-[99px] inline-flex justify-center items-center gap-2',
                      userMessage === 'OK' || capturedImage ? 'opacity-0' : ''
                    )}
                  >
                    <CautionIcon />
                    <div className="text-center whitespace-nowrap justify-start text-white text-3xl font-bold leading-10">
                      {/* {userMessage} */}
                      얼굴이 프레임 중앙에 오도록 맞춰주세요!
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!capturedImage && (
              <div className="absolute top-1/2 left-1/2  -translate-1/2 z-100 w-[540px] h-[640px]">
                <img src={FaceFrameGuide} alt="face-frame-guide" />
              </div>
            )}
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              className="absolute z-10 h-full w-full object-cover"
              onUserMedia={() => setIsWebcamReady(true)}
              videoConstraints={{ width: 1920, height: 1080 }}
              screenshotFormat="image/jpeg"
              screenshotQuality={1}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
