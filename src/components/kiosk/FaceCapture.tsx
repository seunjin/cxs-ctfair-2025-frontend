import React from 'react';
import Webcam from 'react-webcam';

const COMPONENT_SIZE_CLASS = 'w-[920px]';

type FaceCaptureProps = {
  webcamRef: React.Ref<Webcam>;
  canvasRef: React.Ref<HTMLCanvasElement>;
  userMessage: string;
  debugInfo: string;
  capturedImage: string | null;
  isApiLoading: boolean;
  setIsWebcamReady: (isReady: boolean) => void;
};

const FaceCapture = ({
  webcamRef,
  canvasRef,
  userMessage,
  debugInfo,
  capturedImage,
  isApiLoading,
  setIsWebcamReady,
}: FaceCaptureProps) => {
  return (
    <div className={`${COMPONENT_SIZE_CLASS} `}>
      <h2 className="mb-4 h-8 text-center text-2xl font-bold">{userMessage}</h2>
      <div
        className="relative w-full overflow-hidden rounded-lg shadow-lg"
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
              className="absolute z-20 h-full w-full"
              width={1920}
              height={1080}
            />
            {/* <div className="absolute bottom-2 left-2 z-30 rounded bg-black bg-opacity-50 p-2 font-mono text-xs text-white">
              {debugInfo}
            </div> */}
          </>
        )}
        {isApiLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
            <div className="h-16 w-16 animate-spin rounded-full border-8 border-t-indigo-500 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
