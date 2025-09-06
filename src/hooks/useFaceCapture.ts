import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useMutation } from '@tanstack/react-query';
import { httpAkool } from '../api/akoolApi';

// --- API 요청 타입 정의 ---
interface AkoolApiResponse {
  job_id: string;
  status: string;
  // ... 기타 응답 필드
}

// --- 유틸리티 함수 ---
const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

// --- 가이드라인 및 정렬 설정 ---
const GUIDELINE_DIAMETER_RATIO = 0.5;
const FACE_ALIGNMENT_CONFIG = {
  MIN_FACE_SCALE: 0.6,
  MAX_FACE_SCALE: 1.0,
  CENTER_OFFSET_THRESHOLD: 0.1,
};

// 새로운 가이드라인 스타일 설정 객체
const GUIDELINE_STYLE_CONFIG = {
  radiusX: 270, // 타원 가로 반지름 (전체 너비 600px)
  radiusY: 320, // 타원 세로 반지름 (전체 높이 640px)
  lineWidth: 2, // 선 두께
  alignedColor: '#fff', // 정렬되었을 때 색상
  unalignedColor: '#fff', // 정렬되지 않았을 때 색상
};

export const useFaceCapture = () => {
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

  const akoolApiMutation = useMutation<
    AkoolApiResponse,
    Error,
    { imageBlob: Blob }
  >({
    mutationFn: async ({ imageBlob }) => {
      const formData = new FormData();
      formData.append('face_image', imageBlob, 'captured_face.jpg');
      return httpAkool.post<AkoolApiResponse>('face/swap', formData);
    },
    onSuccess: (data) => {
      console.log('Akool API 응답:', data);
      setUserMessage('이미지 전송 성공!');
      // 성공 후 로직 (예: onSuccess 콜백 호출)
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
      setUserMessage('얼굴이 프레임 중앙에 오도록 맞춰주세요!');
    }
  }, [modelsLoaded, isWebcamReady, capturedImage, akoolApiMutation.isPending]);

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
          }
        }
      }
      setIsFaceAligned(faceAligned);

      // --- 가이드라인 그리기 시작 ---
      // 현재 캔버스 상태를 저장합니다. (좌표계 변환 등을 복원하기 위해)
      ctx.save();

      // 캔버스의 좌표계를 좌우로 뒤집습니다.
      // 웹캠 영상이 좌우 반전(mirrored)되어 있기 때문에, 캔버스도 동일하게 반전시켜
      // 영상과 가이드라인이 올바르게 겹쳐 보이도록 합니다.
      ctx.translate(videoWidth, 0);
      ctx.scale(-1, 1);

      // 새로운 경로(도형) 그리기를 시작합니다.
      ctx.beginPath();

      // 얼굴 정렬 상태(faceAligned)에 따라 가이드라인 색상을 설정합니다.
      // 설정 객체(GUIDELINE_STYLE_CONFIG)에 정의된 색상 값을 사용합니다.
      ctx.strokeStyle = faceAligned
        ? GUIDELINE_STYLE_CONFIG.alignedColor
        : GUIDELINE_STYLE_CONFIG.unalignedColor;

      // 가이드라인의 선 두께를 설정 객체 값으로 설정합니다.
      ctx.lineWidth = GUIDELINE_STYLE_CONFIG.lineWidth;

      // 설정 객체에서 타원의 가로/세로 반지름 값을 가져옵니다.
      const { radiusX, radiusY } = GUIDELINE_STYLE_CONFIG;

      // ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
      // (x, y): 타원 중심의 x, y 좌표
      // radiusX, radiusY: 타원의 가로, 세로 반지름
      // rotation: 타원의 회전 각도 (라디안 단위)
      // startAngle, endAngle: 타원을 그리기 시작하고 끝내는 각도 (0부터 2 * PI는 전체 타원)
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

      // 설정된 경로(타원)를 실제로 캔버스에 그립니다.
      ctx.stroke();

      // 이전에 저장했던 캔버스 상태(좌표계 등)를 복원합니다.
      // 이렇게 해야 다른 그리기 작업에 영향을 주지 않습니다.
      ctx.restore();
      // --- 가이드라인 그리기 종료 ---
    }

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, []);

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
    akoolApiMutation.reset();
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

  return {
    webcamRef,
    canvasRef,
    modelsLoaded,
    isWebcamReady,
    isFaceAligned,
    capturedImage,
    userMessage,
    debugInfo,
    isApiLoading: akoolApiMutation.isPending,
    setIsWebcamReady,
    handleCapture,
    handleRetake,
    handleUsePhoto,
  };
};
