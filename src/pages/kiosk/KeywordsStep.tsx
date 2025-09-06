import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useKiosk } from '../../contexts/kiosk';

const KeywordsStep = () => {
  const { sexGroup, ageGroup, capturedImage } = useKiosk();

  useEffect(() => {
    console.log('--- KeywordsStep 데이터 검증 ---');
    console.log('성별:', sexGroup);
    console.log('나이대:', ageGroup);
    console.log(
      '촬영된 이미지 (첫 50자):',
      capturedImage?.substring(0, 50) + '...'
    );
    console.log('---------------------------------');
  }, [sexGroup, ageGroup, capturedImage]);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">키워드 선택</h1>
      <p className="mt-2 text-lg">
        사진에 적용하고 싶은 키워드를 선택해주세요.
      </p>
      {capturedImage && (
        <div className="my-4">
          <img
            src={capturedImage}
            alt="촬영된 사진"
            className="h-40 w-40 rounded-lg object-cover mx-auto shadow-lg"
          />
        </div>
      )}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {/* TODO: 실제 키워드 데이터 렌더링 */}
        {['환상적인', '몽환적인', '강렬한', '빛나는', '어두운', '복고풍'].map(
          (keyword) => (
            <button
              key={keyword}
              className="rounded-lg bg-gray-200 p-6 text-xl transition-colors hover:bg-blue-500 hover:text-white"
            >
              {keyword}
            </button>
          )
        )}
      </div>
      <Link
        to="/kiosk/complete"
        className="mt-8 rounded-full bg-blue-600 px-12 py-4 text-2xl font-bold text-white transition-transform hover:scale-105"
      >
        이미지 생성하기
      </Link>
    </div>
  );
};

export default KeywordsStep;
