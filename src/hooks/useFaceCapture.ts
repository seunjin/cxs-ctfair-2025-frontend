import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useMutation } from '@tanstack/react-query';
import { detectFace } from '../api/akoolApi';
import { useKiosk } from '../contexts/kiosk';

// --- 에러 코드 한글 메시지 맵 ---
const AKOOL_ERROR_MESSAGES: { [key: number]: string } = {
  1003: '잘못된 요청입니다. 다시 시도해주세요.',
  1005: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  1006: 'API 사용량이 초과되었습니다. 관리자에게 문의하세요.',
  1101: '인증에 실패했습니다. 새로고침 후 다시 시도해주세요.',
  1102: '인증 정보가 없습니다. 새로고침 후 다시 시도해주세요.',
  1200: '사용이 중지된 계정입니다. 관리자에게 문의하세요.',
};
const DEFAULT_ERROR_MESSAGE = '알 수 없는 오류가 발생했습니다.';

// --- 가이드라인 및 정렬 설정 ---
// 웹캠 영상 세로 길이 대비 가이드라인의 지름 비율
const GUIDELINE_DIAMETER_RATIO = 0.4;
const FACE_ALIGNMENT_CONFIG = {
  // 가이드라인 대비 얼굴 크기의 최소 비율 (너무 작으면 인식 불가)
  MIN_FACE_SCALE: 0.6,
  // 가이드라인 대비 얼굴 크기의 최대 비율 (너무 크면 인식 불가)
  MAX_FACE_SCALE: 1.0,
  // 얼굴 중심이 가이드라인 중심에서 벗어날 수 있는 최대 허용치
  CENTER_OFFSET_THRESHOLD: 0.1,
};
// 가이드라인 타원의 스타일 설정
const GUIDELINE_STYLE_CONFIG = {
  radiusX: 270, // 타원의 가로 반지름
  radiusY: 320, // 타원의 세로 반지름
  lineWidth: 2, // 선 굵기
  alignedColor: '#fff', // 얼굴 정렬 시 색상
  unalignedColor: '#fff', // 얼굴 미정렬 시 색상
};

export const useFaceCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState('카메라를 준비하는 중...');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const {
    capturedImage: globalCapturedImage, // [문제 2 해결] 전역 이미지 상태 구독
    setCapturedImage: setGlobalCapturedImage,
    setLandmarks,
    modelsLoaded, // 컨텍스트에서 모델 로딩 상태 가져오기
    faceLandmarker, // 컨텍스트에서 모델 인스턴스 가져오기
  } = useKiosk();

  // [문제 2 해결] 전역 상태가 초기화되면 로컬 상태도 초기화
  useEffect(() => {
    if (globalCapturedImage === null) {
      setCapturedImage(null);
    }
  }, [globalCapturedImage]);

  // --- 재시도 및 상태 초기화 함수 ---
  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setGlobalCapturedImage(null); // 재촬영 시 전역 상태도 초기화
    setCountdown(5);
    setIsCountingDown(false);
  }, [setGlobalCapturedImage]);

  // --- React Query useMutation으로 API 호출 관리 ---
  const { mutate: runFaceDetect, isPending: isDetectingFace } = useMutation({
    mutationFn: detectFace,
    onSuccess: (data) => {
      console.log('✅ Face Detect API 성공:', data);
      setLandmarks(data.landmarks_str);
    },
    onError: (error) => {
      console.error('❌ Face Detect API 실패:', error);

      let alertMessage = DEFAULT_ERROR_MESSAGE;
      if (error instanceof Error && error.message.startsWith('API Error')) {
        const errorCodeMatch = error.message.match(/\((\d+)\)/);
        if (errorCodeMatch) {
          const errorCode = parseInt(errorCodeMatch[1], 10);
          alertMessage =
            AKOOL_ERROR_MESSAGES[errorCode] ||
            `오류가 발생했습니다. (코드: ${errorCode})`;
        }
      } else {
        alertMessage =
          '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      alert(alertMessage);
      resetCapture();
    },
  });

  useEffect(() => {
    if (capturedImage) {
      setUserMessage('이 사진을 사용하시겠습니까?');
    } else if (!modelsLoaded) {
      // 이 메시지는 이제 거의 표시되지 않음
      setUserMessage('얼굴 인식 모델을 불러오는 중...');
    } else if (!isWebcamReady) {
      setUserMessage('카메라를 준비하는 중...');
    } else if (isFaceAligned) {
      setUserMessage('OK');
    } else {
      setUserMessage('얼굴이 프레임 중앙에 오도록 맞춰주세요!');
    }
  }, [modelsLoaded, isWebcamReady, capturedImage, isFaceAligned]);

  const predictWebcam = useCallback(() => {
    if (
      !webcamRef.current?.video ||
      !canvasRef.current ||
      !faceLandmarker.current ||
      capturedImage
    ) {
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

      ctx.save();
      ctx.translate(videoWidth, 0);
      ctx.scale(-1, 1);
      ctx.beginPath();
      ctx.strokeStyle = faceAligned
        ? GUIDELINE_STYLE_CONFIG.alignedColor
        : GUIDELINE_STYLE_CONFIG.unalignedColor;
      ctx.lineWidth = GUIDELINE_STYLE_CONFIG.lineWidth;
      const { radiusX, radiusY } = GUIDELINE_STYLE_CONFIG;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [capturedImage, faceLandmarker]);

  useEffect(() => {
    if (modelsLoaded && isWebcamReady && !capturedImage) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
    }
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [modelsLoaded, isWebcamReady, capturedImage, predictWebcam]);

  const triggerCapture = useCallback(() => {
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
            setGlobalCapturedImage(croppedImageSrc); // [문제 1 해결] 촬영 직후 전역 상태 업데이트
            runFaceDetect(croppedImageSrc);
          }
        };
        image.src = imageSrc;
      }
    }
  }, [runFaceDetect, setGlobalCapturedImage]);

  useEffect(() => {
    if (!isCountingDown) return;
    if (!isFaceAligned) {
      setIsCountingDown(false);
      return;
    }
    if (countdown === 0) {
      triggerCapture();
      setIsCountingDown(false);
      return;
    }
    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [isCountingDown, countdown, isFaceAligned, triggerCapture]);

  const handleCapture = () => {
    if (isFaceAligned) {
      setCountdown(5);
      setIsCountingDown(true);
    }
  };

  // 이제 이 함수는 다음 단계로 넘어가는 역할만 함
  const handleUsePhoto = () => {
    // 전역 상태 설정은 triggerCapture에서 이미 처리됨
  };

  return {
    webcamRef,
    canvasRef,
    isWebcamReady,
    isFaceAligned,
    capturedImage,
    userMessage,
    debugInfo,
    isCountingDown,
    countdown,
    isDetectingFace,
    setIsWebcamReady,
    handleCapture,
    resetCapture,
    handleUsePhoto,
  };
};
