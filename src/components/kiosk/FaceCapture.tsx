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
  setIsWebcamReady: (isReady: boolean) => void;
};

const FaceCapture = ({
  webcamRef,
  canvasRef,
  userMessage,
  // debugInfo,
  capturedImage,
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
        className="relative w-full overflow-hidden rounded-lg"
        style={{ aspectRatio: '1 / 1' }}
      >
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured face"
            className="h-full w-full object-cover"
          />
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
