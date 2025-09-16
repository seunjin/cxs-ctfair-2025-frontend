import React from 'react';
import Webcam from 'react-webcam';

import FaceFrameGuide from '../../assets/images/kiosk/face-frame-guide.png';
import clsx from 'clsx';
const COMPONENT_SIZE_CLASS = 'w-[70%]';

type FaceCaptureProps = {
  webcamRef: React.Ref<Webcam>;
  capturedImage: string | null;
  isDetectingFace: boolean;
  setIsWebcamReady: (isReady: boolean) => void;
};

const FaceCapture = ({
  webcamRef,
  capturedImage,
  isDetectingFace,
  setIsWebcamReady,
}: FaceCaptureProps) => {
  return (
    <div className={`${COMPONENT_SIZE_CLASS} mx-auto`}>
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
            {!capturedImage && (
              <div className="absolute top-1/2 left-1/2  -translate-1/2 z-100 w-[300px] h-[355px]">
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
