import FaceCapture from '../../components/kiosk/FaceCapture';
// import { useNavigate } from 'react-router-dom';

const CaptureStep = () => {
  // const navigate = useNavigate();

  // TODO: FaceCapture 컴포넌트에서 사진 전송 성공 시 다음 페이지로 이동하는 로직 필요
  // const onCaptureSuccess = (result) => {
  //   navigate('/kiosk/keywords', { state: { result } });
  // };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <FaceCapture />
    </div>
  );
};

export default CaptureStep;
