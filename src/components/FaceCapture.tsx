import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// --- 설정 값 (이 값을 조절하여 가이드라인과 인식 민감도를 변경하세요) ---
const GUIDELINE_CONFIG = {
  // 타원 가이드라인의 크기 조절 (값이 작을수록 가이드라인이 커집니다)
  WIDTH_FACTOR: 4.8, // 캔버스 너비 대비 가이드라인의 가로 크기 비율
  HEIGHT_FACTOR: 3.84, // 캔버스 높이 대비 가이드라인의 세로 크기 비율

  // 얼굴 정렬 판정 민감도
  // 얼굴 중심과 가이드라인 중심 사이의 최대 허용 거리 (px 단위, 작을수록 중앙에 더 정확히 위치해야 함)
  MAX_CENTER_DISTANCE: 50,
  // 얼굴 너비가 가이드라인 너비에 대해 차지하는 최소/최대 비율 (얼굴의 확대/축소 정도를 결정)
  MIN_WIDTH_RATIO: 0.6, // 최소 60%
  MAX_WIDTH_RATIO: 1.0, // 최대 100%
  // 얼굴 높이가 가이드라인 높이에 대해 차지하는 최소/최대 비율
  MIN_HEIGHT_RATIO: 0.6,
  MAX_HEIGHT_RATIO: 1.0,
};

const FaceCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null
  );
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // 1. Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    const createFaceLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        '/models' // Path to the WASM files
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
      setFaceLandmarker(landmarker);
      setModelsLoaded(true);
      console.log('MediaPipe FaceLandmarker loaded successfully');
    };
    createFaceLandmarker();
  }, []);

  const predictWebcam = useCallback(async () => {
    if (!faceLandmarker || !webcamRef.current?.video) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = webcamRef.current.video;
    if (video.readyState < 2) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const startTimeMs = performance.now();
    const results = faceLandmarker.detectForVideo(video, startTimeMs);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const centerX = canvasRef.current.width / 2;
        const centerY = canvasRef.current.height / 2;
        const radiusX = canvasRef.current.width / GUIDELINE_CONFIG.WIDTH_FACTOR;
        const radiusY =
          canvasRef.current.height / GUIDELINE_CONFIG.HEIGHT_FACTOR;

        let faceAligned = false;
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          const xs = landmarks.map((p) => p.x * video.videoWidth);
          const ys = landmarks.map((p) => p.y * video.videoHeight);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          const faceWidth = maxX - minX;
          const faceHeight = maxY - minY;
          const faceCenterX = minX + faceWidth / 2;
          const faceCenterY = minY + faceHeight / 2;

          const distance = Math.sqrt(
            Math.pow(faceCenterX - centerX, 2) +
              Math.pow(faceCenterY - centerY, 2)
          );
          const widthRatio = faceWidth / (radiusX * 2);
          const heightRatio = faceHeight / (radiusY * 2);

          if (
            distance < GUIDELINE_CONFIG.MAX_CENTER_DISTANCE &&
            widthRatio > GUIDELINE_CONFIG.MIN_WIDTH_RATIO &&
            widthRatio < GUIDELINE_CONFIG.MAX_WIDTH_RATIO &&
            heightRatio > GUIDELINE_CONFIG.MIN_HEIGHT_RATIO &&
            heightRatio < GUIDELINE_CONFIG.MAX_HEIGHT_RATIO
          ) {
            faceAligned = true;
          }
        }
        setIsFaceAligned(faceAligned);

        ctx.save();
        ctx.translate(canvasRef.current.width, 0);
        ctx.scale(-1, 1);

        ctx.beginPath();
        ctx.strokeStyle = faceAligned ? '#4ade80' : '#f87171';
        ctx.lineWidth = 6;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.restore();
      }
    }

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [faceLandmarker]);

  const handleUserMedia = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [predictWebcam]);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    handleUserMedia();
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      console.log('Using photo:', capturedImage.substring(0, 30) + '...');
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <h2 className="mb-4 h-8 text-center text-2xl font-bold">
        {!modelsLoaded
          ? '얼굴 인식 모델을 불러오는 중...'
          : capturedImage
            ? '촬영된 사진'
            : isFaceAligned
              ? '준비 완료! 촬영 버튼을 누르세요.'
              : '얼굴을 가이드라인에 맞춰주세요'}
      </h2>
      <div className="relative h-96 w-96 overflow-hidden rounded-lg shadow-lg">
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
              onUserMedia={handleUserMedia}
              videoConstraints={{ width: 640, height: 480 }}
            />
            <canvas
              ref={canvasRef}
              className="absolute z-20 h-full w-full"
              width="640"
              height="480"
            />
          </>
        )}
      </div>
      <div className="mt-6 flex w-full justify-center space-x-4">
        {capturedImage ? (
          <>
            <button
              onClick={handleRetake}
              className="w-40 rounded-lg bg-gray-500 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-gray-400"
            >
              다시 찍기
            </button>
            <button
              onClick={handleUsePhoto}
              className="w-40 rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-green-500"
            >
              사진 사용
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

export default FaceCapture;
