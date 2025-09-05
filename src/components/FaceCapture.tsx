import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useMutation } from '@tanstack/react-query';
import { httpAkool } from '../api/akoolApi';

// --- API 요청 타입 정의 ---
// Akool API 문서에 따라 응답 타입을 정의합니다. (예시)
interface AkoolApiResponse {
  job_id: string;
  status: string;
  // ... 기타 응답 필드
}

// --- 유틸리티 함수 ---
// 데이터 URL을 Blob 객체로 변환하는 함수
const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

// --- 컴포넌트 스타일 설정 ---
const COMPONENT_SIZE_CLASS = 'max-w-lg';

// --- 가이드라인 설정 ---
const GUIDELINE_DIAMETER_RATIO = 0.5;

const FACE_ALIGNMENT_CONFIG = {
  MIN_FACE_SCALE: 0.6,
  MAX_FACE_SCALE: 1.0,
  CENTER_OFFSET_THRESHOLD: 0.1,
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
  const [userMessage, setUserMessage] = useState(
    '얼굴 인식 모델을 불러오는 중...'
  );

  // Akool API 호출을 위한 useMutation 설정
  const akoolApiMutation = useMutation<
    AkoolApiResponse,
    Error,
    { imageBlob: Blob }
  >({
    mutationFn: async ({ imageBlob }) => {
      const formData = new FormData();
      // Akool API 문서에 명시된 파라미터 이름으로 변경해야 합니다.
      // 예: 'source_image', 'face_image' 등
      formData.append('face_image', imageBlob, 'captured_face.jpg');
      // 다른 파라미터가 있다면 함께 추가합니다.
      // formData.append('target_video', videoFile);

      // httpAkool 클라이언트를 사용하여 API 호출
      // 엔드포인트 URL은 Akool 문서에 따라 수정해야 합니다. (예: 'face/swap')
      return httpAkool.post<AkoolApiResponse>('face/swap', formData);
    },
    onSuccess: (data) => {
      console.log('Akool API 응답:', data);
      setUserMessage('이미지 전송 성공!');
      // 성공 후 다음 단계로 넘어가는 로직 (예: 페이지 이동)
      // navigate(`/result/${data.job_id}`);
    },
    onError: (error) => {
      console.error('Akool API 에러:', error);
      setUserMessage(`에러 발생: ${error.message}`);
    },
  });

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
          numFaces: 2,
        });
        faceLandmarker.current = landmarker;
        setModelsLoaded(true);
      } catch (error) {
        console.error('Failed to create FaceLandmarker:', error);
      }
    };
    createFaceLandmarker();
    return () => faceLandmarker.current?.close();
  }, []);

  useEffect(() => {
    if (akoolApiMutation.isPending) {
      setUserMessage('이미지를 서버로 전송하는 중...');
    } else if (capturedImage) {
      setUserMessage('이 사진을 사용하시겠습니까?');
    } else if (!modelsLoaded) {
      setUserMessage('얼굴 인식 모델을 불러오는 중...');
    } else if (!isWebcamReady) {
      setUserMessage('카메라를 준비하는 중...');
    } else {
      setUserMessage('얼굴을 가이드라인에 맞춰주세요');
    }
  }, [
    modelsLoaded,
    isWebcamReady,
    capturedImage,
    akoolApiMutation.isPending,
  ]);

  const predictWebcam = useCallback(() => {
    if (
      !webcamRef.current?.video ||
      !canvasRef.current ||
      !faceLandmarker.current
    ) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    if (video.readyState < 2 || video.videoWidth === 0) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const results = faceLandmarker.current.detectForVideo(
      video,
      performance.now()
    );
    const ctx = canvas.getContext('2d');
    const detectedFacesCount = results.faceLandmarks.length;
    let faceAligned = false;

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { videoWidth, videoHeight } = video;
      const visibleSize = videoHeight;
      const offsetX = (videoWidth - visibleSize) / 2;
      const guidelineRadius = (visibleSize * GUIDELINE_DIAMETER_RATIO) / 2;
      const centerX = videoWidth / 2;
      const centerY = videoHeight / 2;

      if (detectedFacesCount === 1) {
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

        if (faceCenterX > offsetX && faceCenterX < videoWidth - offsetX) {
          const distance = Math.sqrt(
            Math.pow(faceCenterX - centerX, 2) +
              Math.pow(faceCenterY - centerY, 2)
          );
          const maxDistance =
            visibleSize * FACE_ALIGNMENT_CONFIG.CENTER_OFFSET_THRESHOLD;
          const faceScale =
            (faceWidth + faceHeight) / 2 / (guidelineRadius * 2);

          setDebugInfo(
            `D: ${distance.toFixed(0)}/${maxDistance.toFixed(0)} | S: ${faceScale.toFixed(2)}`
          );

          if (
            distance < maxDistance &&
            faceScale > FACE_ALIGNMENT_CONFIG.MIN_FACE_SCALE &&
            faceScale < FACE_ALIGNMENT_CONFIG.MAX_FACE_SCALE
          ) {
            faceAligned = true;
            if (!capturedImage && !akoolApiMutation.isPending) {
              setUserMessage('준비 완료! 촬영 버튼을 누르세요.');
            }
          } else {
            if (!capturedImage && !akoolApiMutation.isPending) {
              setUserMessage('얼굴을 가이드라인에 맞춰주세요');
            }
          }
        } else {
          setDebugInfo('얼굴이 중앙에 오도록 조절해주세요.');
        }
      } else if (detectedFacesCount > 1) {
        setUserMessage('한 명만 화면에 나오도록 해주세요.');
        setDebugInfo(`${detectedFacesCount}개의 얼굴이 감지되었습니다.`);
      } else {
        setUserMessage('얼굴을 가이드라인에 맞춰주세요');
        setDebugInfo('얼굴을 인식할 수 없습니다.');
      }

      setIsFaceAligned(faceAligned);

      ctx.save();
      ctx.translate(videoWidth, 0);
      ctx.scale(-1, 1);
      ctx.beginPath();
      ctx.strokeStyle = faceAligned ? '#4ade80' : '#f87171';
      ctx.lineWidth = 6;
      const radiusY = guidelineRadius;
      const radiusX = radiusY * (videoWidth / videoHeight);
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [setUserMessage, capturedImage, akoolApiMutation.isPending]);

  useEffect(() => {
    if (modelsLoaded && isWebcamReady && !capturedImage) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
    }
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [modelsLoaded, isWebcamReady, capturedImage, predictWebcam]);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 1920,
        height: 1080,
      });
      if (imageSrc) {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const size = image.height;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const offsetX = (image.width - size) / 2;
            ctx.drawImage(image, offsetX, 0, size, size, 0, 0, size, size);
            const croppedImageSrc = canvas.toDataURL('image/jpeg', 1.0);
            setCapturedImage(croppedImageSrc);
          }
        };
        image.src = imageSrc;
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    akoolApiMutation.reset(); // 이전 API 호출 상태 초기화
  };

  const handleUsePhoto = async () => {
    if (capturedImage) {
      try {
        const imageBlob = await dataUrlToBlob(capturedImage);
        akoolApiMutation.mutate({ imageBlob });
      } catch (error) {
        console.error('이미지 변환 실패:', error);
        setUserMessage('이미지 처리 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div
      className={`flex w-full ${COMPONENT_SIZE_CLASS} flex-col items-center`}
    >
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
            <div className="absolute bottom-2 left-2 z-30 rounded bg-black bg-opacity-50 p-2 font-mono text-xs text-white">
              {debugInfo}
            </div>
          </>
        )}
        {akoolApiMutation.isPending && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
            <div className="h-16 w-16 animate-spin rounded-full border-8 border-t-indigo-500 border-white"></div>
          </div>
        )}
      </div>
      <div className="mt-6 flex w-full justify-center space-x-4">
        {capturedImage ? (
          <>
            <button
              onClick={handleRetake}
              className="w-40 rounded-lg bg-gray-500 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={akoolApiMutation.isPending}
            >
              다시 찍기
            </button>
            <button
              onClick={handleUsePhoto}
              className="w-40 rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={akoolApiMutation.isPending}
            >
              {akoolApiMutation.isPending ? '전송 중...' : '사진 사용'}
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
