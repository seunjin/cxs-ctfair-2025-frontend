import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// --- 설정 값 (정사각형 UI에 맞게 재조정) ---
const GUIDELINE_CONFIG = {
  // 보이는 정사각형 영역(비디오 높이 기준)에 대한 원의 반지름 비율
  RADIUS_FACTOR: 4, // 값이 클수록 원이 작아짐
  // 얼굴이 가이드라인 안에 얼마나 채워져야 하는지에 대한 비율
  MIN_FACE_SCALE: 0.6,
  MAX_FACE_SCALE: 1.0,
  // 얼굴이 중앙에서 얼마나 떨어져도 되는지에 대한 허용 오차 (보이는 영역 높이 기준)
  CENTER_OFFSET_THRESHOLD: 0.1, // 10%
};

const FaceCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const faceLandmarker = useRef<FaceLandmarker | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // 1. MediaPipe FaceLandmarker 초기화
  useEffect(() => {
    const createFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('/models');
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        faceLandmarker.current = landmarker;
        setModelsLoaded(true);
        console.log('MediaPipe FaceLandmarker loaded successfully');
      } catch (error) {
        console.error('Failed to create FaceLandmarker:', error);
      }
    };
    createFaceLandmarker();

    return () => {
      faceLandmarker.current?.close();
    };
  }, []);

  const predictWebcam = useCallback(() => {
    if (
      !webcamRef.current?.video ||
      !canvasRef.current ||
      !faceLandmarker.current
    ) {
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const results = faceLandmarker.current.detectForVideo(
      video,
      performance.now()
    );
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- 보이는 영역(정사각형)에 대한 계산 ---
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // object-cover로 인해 보이는 정사각형 영역의 크기는 비디오의 높이와 같다.
      const visibleSize = videoHeight;
      // 좌우가 잘려나간 부분의 크기 (한쪽)
      const offsetX = (videoWidth - visibleSize) / 2;

      // 가이드라인 원의 반지름과 중심 좌표
      const guidelineRadius = visibleSize / GUIDELINE_CONFIG.RADIUS_FACTOR;
      const centerX = videoWidth / 2;
      const centerY = videoHeight / 2;

      let faceAligned = false;
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const xs = landmarks.map((p) => p.x * videoWidth);
        const ys = landmarks.map((p) => p.y * videoHeight);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const faceWidth = maxX - minX;
        const faceHeight = maxY - minY;
        const faceCenterX = minX + faceWidth / 2;
        const faceCenterY = minY + faceHeight / 2;

        // 1. 얼굴이 보이는 영역 안에 있는지 확인
        if (faceCenterX > offsetX && faceCenterX < videoWidth - offsetX) {
          // 2. 얼굴이 중앙에 있는지 확인
          const distance = Math.sqrt(
            Math.pow(faceCenterX - centerX, 2) +
              Math.pow(faceCenterY - centerY, 2)
          );
          const maxDistance =
            visibleSize * GUIDELINE_CONFIG.CENTER_OFFSET_THRESHOLD;

          // 3. 얼굴 크기가 적절한지 확인
          const faceScale =
            (faceWidth + faceHeight) / 2 / (guidelineRadius * 2);

          setDebugInfo(
            `D: ${distance.toFixed(0)}/${maxDistance.toFixed(0)} | S: ${faceScale.toFixed(2)}`
          );

          if (
            distance < maxDistance &&
            faceScale > GUIDELINE_CONFIG.MIN_FACE_SCALE &&
            faceScale < GUIDELINE_CONFIG.MAX_FACE_SCALE
          ) {
            faceAligned = true;
          }
        } else {
          setDebugInfo('얼굴이 중앙에 오도록 조절해주세요.');
        }
      } else {
        setDebugInfo('얼굴을 인식할 수 없습니다.');
      }
      setIsFaceAligned(faceAligned);

      // --- 가이드라인 그리기 ---
      ctx.save();
      // 비디오가 좌우 반전되어 있으므로 캔버스도 좌우 반전
      ctx.translate(videoWidth, 0);
      ctx.scale(-1, 1);

      ctx.beginPath();
      ctx.strokeStyle = faceAligned ? '#4ade80' : '#f87171';
      ctx.lineWidth = 6;

      // CSS 왜곡을 보정하기 위해 가로로 넓은 타원을 그린다.
      const radiusY = guidelineRadius;
      const radiusX = radiusY * (videoWidth / videoHeight); // 16:9 비율 적용
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

      ctx.stroke();
      ctx.restore();
    }

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, []);

  // Master useEffect to start/stop detection
  useEffect(() => {
    if (modelsLoaded && isWebcamReady && !capturedImage) {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(predictWebcam);
    } else {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    }

    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [modelsLoaded, isWebcamReady, capturedImage, predictWebcam]);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  };

  const handleRetake = () => setCapturedImage(null);

  const handleUsePhoto = () => {
    if (capturedImage)
      console.log('Using photo:', capturedImage.substring(0, 30) + '...');
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <h2 className="mb-4 h-8 text-center text-2xl font-bold">
        {!modelsLoaded
          ? '얼굴 인식 모델을 불러오는 중...'
          : !isWebcamReady
            ? '카메라를 준비하는 중...'
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
              onUserMedia={() => setIsWebcamReady(true)}
              videoConstraints={{ width: 1280, height: 720 }}
            />
            <canvas
              ref={canvasRef}
              className="absolute z-20 h-full w-full"
              width={1280}
              height={720}
            />
            <div className="absolute bottom-2 left-2 z-30 rounded bg-black bg-opacity-50 p-2 font-mono text-xs text-white">
              {debugInfo}
            </div>
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
