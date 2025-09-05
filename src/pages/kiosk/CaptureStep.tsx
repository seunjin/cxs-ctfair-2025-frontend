import FaceCapture from '../../components/kiosk/FaceCapture';
import { useKiosk } from '../../contexts/KioskContext';
import { useFaceCapture } from '../../hooks/useFaceCapture';
// import { useNavigate } from 'react-router-dom';

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
      <FaceCapture
        webcamRef={webcamRef}
        canvasRef={canvasRef}
        userMessage={userMessage}
        debugInfo={debugInfo}
        capturedImage={capturedImage}
        isApiLoading={isApiLoading}
        setIsWebcamReady={setIsWebcamReady}
      />
      <div className="mt-6 flex w-full max-w-lg justify-center space-x-4">
        {capturedImage ? (
          <>
            <button
              onClick={handleRetake}
              className="w-40 rounded-lg bg-gray-500 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isApiLoading}
            >
              다시 찍기
            </button>
            <button
              onClick={handleUsePhoto}
              className="w-40 rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isApiLoading}
            >
              {isApiLoading ? '전송 중...' : '사진 사용'}
            </button>
          </>
        ) : (
          <button
            onClick={handleCapture}
            className="w-48 rounded-lg bg-indigo-600 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:opacity-70"
            disabled={!modelsLoaded || !isFaceAligned}
          >
            촬영하기
          </button>
        )}
      </div>
    </div>
  );
};

export default CaptureStep;
