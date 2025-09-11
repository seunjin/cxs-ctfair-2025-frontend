import { useParams } from 'react-router-dom';

const GenerationDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>AI 생성 상세 페이지</h1>
      <p>Item ID: {id}</p>
      {/* TODO: 상세 정보 구현 */}
    </div>
  );
};

export default GenerationDetailPage;
