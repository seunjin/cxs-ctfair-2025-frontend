import React from 'react';
import Webcam from 'react-webcam';
import CautionIcon from '../../assets/icons/caution.svg?react';
import clsx from 'clsx';
const COMPONENT_SIZE_CLASS = 'w-[920px]';

type FaceCaptureProps = {
  webcamRef: React.Ref<Webcam>;
  canvasRef: React.Ref<HTMLCanvasElement>;
  userMessage: string;
  debugInfo: string;
  capturedImage: string | null;
  isDetectingFace: boolean;
  setIsWebcamReady: (isReady: boolean) => void;
};

const FaceCapture = ({
  webcamRef,
  canvasRef,
  userMessage,
  // debugInfo,
  capturedImage,
  isDetectingFace,
  setIsWebcamReady,
}: FaceCaptureProps) => {
  return (
    <div className={`${COMPONENT_SIZE_CLASS} `}>
      <div className="flex justify-center mb-10">
        <div
          className={clsx(
            'px-7 py-3  bg-rose-600 rounded-[99px] inline-flex justify-center items-center gap-2',
            userMessage === 'OK' || capturedImage ? 'opacity-0' : ''
          )}
        >
          <CautionIcon />
          <div className="text-center justify-start text-white text-3xl font-bold leading-10">
            {userMessage}
          </div>
        </div>
      </div>
      <div
        className={clsx(
          'relative w-full overflow-hidden ',

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
                'absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-500',
                isDetectingFace ? 'backdrop-blur-md' : 'backdrop-blur-none'
              )}
            >
              {isDetectingFace && (
                <>
                  <div className="mb-8 h-16 w-16 animate-spin rounded-full border-8 border-t-blue-500 border-white"></div>
                  <p className="text-4xl font-bold text-white">
                    Face Detecting...
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
            <canvas
              ref={canvasRef}
              className="absolute left-1/2 top-1/2 z-20 h-full -translate-x-1/2 -translate-y-1/2"
              style={{ width: `${(16 / 9) * 100}%` }}
              width={1920}
              height={1080}
            />

            {/* <div className="absolute bottom-2 left-2 z-30 rounded bg-black bg-opacity-50 p-2 font-mono text-xs text-white">
              {debugInfo}
            </div> */}
          </>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
