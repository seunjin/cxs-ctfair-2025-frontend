import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useMutation } from '@tanstack/react-query';
import { detectFace } from '../api/akoolApi';
import { useKiosk } from '../contexts/kiosk';
import { openDialog } from '../lib/dialogs';

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

export const useFaceCapture = () => {
  const webcamRef = useRef<Webcam>(null);

  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const isFaceAligned = true; // 항상 true로 설정
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState('카메라를 준비하는 중...');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const {
    capturedImage: globalCapturedImage,
    setCapturedImage: setGlobalCapturedImage,
    setLandmarks,
    modelsLoaded,
  } = useKiosk();

  useEffect(() => {
    if (globalCapturedImage === null) {
      setCapturedImage(null);
    }
  }, [globalCapturedImage]);

  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setGlobalCapturedImage(null);
    setCountdown(5);
    setIsCountingDown(false);
  }, [setGlobalCapturedImage]);

  const { mutate: runFaceDetect, isPending: isDetectingFace } = useMutation({
    mutationFn: detectFace,
    onSuccess: (data) => {
      console.log('✅ Face Detect API 성공:', data);
      if (!data.landmarks_str || data.landmarks_str.length === 0) {
        openDialog({
          type: 'alert',
          form: 'kiosk',
          message: '얼굴 인식에 실패했습니다. 다시 시도해주세요.',
        });
        resetCapture();
      } else {
        setLandmarks(data.landmarks_str);
      }
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
      setUserMessage('얼굴 인식 모델을 불러오는 중...');
    } else if (!isWebcamReady) {
      setUserMessage('카메라를 준비하는 중...');
    } else {
      // isFaceAligned가 항상 true이므로 'OK' 메시지는 제거
      setUserMessage('정면을 보고 촬영 버튼을 눌러주세요.');
    }
  }, [modelsLoaded, isWebcamReady, capturedImage]);

  // 실시간 얼굴 인식 로직 (predictWebcam 및 관련 useEffect) 제거

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
            setGlobalCapturedImage(croppedImageSrc);
            runFaceDetect(croppedImageSrc);
          }
        };
        image.src = imageSrc;
      }
    }
  }, [runFaceDetect, setGlobalCapturedImage]);

  useEffect(() => {
    if (!isCountingDown) return;
    // isFaceAligned 조건 제거
    if (countdown === 0) {
      triggerCapture();
      setIsCountingDown(false);
      return;
    }
    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [isCountingDown, countdown, triggerCapture]);

  const handleCapture = () => {
    // isFaceAligned 조건 제거
    setCountdown(3);
    setIsCountingDown(true);
  };

  const handleUsePhoto = () => {
    // 동작 없음
  };

  return {
    webcamRef,
    canvasRef: null, // canvasRef 더 이상 사용 안함
    isWebcamReady,
    isFaceAligned,
    capturedImage,
    userMessage,
    debugInfo: '', // debugInfo 더 이상 사용 안함
    isCountingDown,
    countdown,
    isDetectingFace,
    setIsWebcamReady,
    handleCapture,
    resetCapture,
    handleUsePhoto,
  };
};
