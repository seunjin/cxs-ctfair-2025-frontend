import { useMemo } from 'react';
import { RadioGroup } from '../../components/ui/RadioGroup';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';
import { useKiosk } from '../../contexts/kiosk/useKiosk';
import Arrowleft from '../../assets/icons/arrow-narrow-left.svg?react';
import ArrowRighgt from '../../assets/icons/arrow-narrow-right.svg?react';
import { createJob, getKeywords } from '../../api/kioskApi';
import { useMutation, useQuery } from '@tanstack/react-query';

const KeywardSectionLabel = ({ text }: { text: string }) => {
  return (
    <div className="px-7 py-3 bg-white/30 rounded-[99px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px] outline-blue-700 backdrop-blur-[1px] inline-flex justify-center items-center gap-2">
      <div className="text-center justify-start text-[#0033FF] text-[30px] font-bold font-['Pretendard'] leading-10">
        {text}
      </div>
    </div>
  );
};

const KeywordsStep = () => {
  const kiosk = useKiosk();
  const router = useNavigate();
  const {
    id,
    sexGroup,
    ageGroup,
    styleGroup,
    moodGroup,
    capturedImage,
    landmarks,
    setStyleGroup,
    setMoodGroup,
  } = kiosk;

  console.log({
    id,
    sexGroup,
    ageGroup,
    styleGroup,
    moodGroup,
    capturedImage,
    landmarks,
  });
  const { data } = useQuery({
    queryKey: ['keywords'],
    queryFn: getKeywords,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      console.log('SUCCESS : createJob ');
      router(ROUTER_PATH.KIOSK_COMPLETE);
    },
    onError: (error) => {
      // TODO: 사용자에게 에러를 표시하는 UI (예: 토스트 메시지)
      console.error('작업 생성에 실패했습니다:', error);
      alert(`작업 생성에 실패했습니다: ${error.message}`);
    },
  });

  const handleNext = () => {
    if (!capturedImage || !landmarks || !styleGroup || !moodGroup) {
      alert('모든 필수 정보가 선택되지 않았습니다.');
      // TODO: 더 나은 사용자 피드백 UI로 교체
      return;
    }

    mutate({
      id,
      sexGroup,
      ageGroup: Number(ageGroup), // string을 number로 변환
      styleGroup,
      moodGroup,
      base64Image: capturedImage,
      landmarks,
    });
  };

  const styleKeywords = useMemo(
    () =>
      (data ?? [])
        .filter((kw) => kw.type === 'COLOR_AND_STYLE')
        .map((kw) => ({ value: kw.value, label: kw.label })),
    [data]
  );
  const moodKeywords = useMemo(
    () =>
      (data ?? [])
        .filter((kw) => kw.type === 'ATMOSPHERE_AND_MOOD')
        .map((kw) => ({ value: kw.value, label: kw.label })),
    [data]
  );

  return (
    <div className="flex h-full flex-col py-[40px_130px] px-20">
      <section className="">
        <h2 className="pb-15 text-center text-white text-[50px] font-semibold">
          원하는 컨셉의 키워드를 골라주세요!
        </h2>

        <div className="mb-[75px]">
          <div className="flex justify-center mb-[30px]">
            <KeywardSectionLabel text="STYLE" />
          </div>
          <RadioGroup
            name="colorStyle"
            selectedValue={styleGroup}
            onChange={setStyleGroup}
            className="flex justify-center flex-wrap gap-5"
            labelClassName="text-[30px] tracking-[-0.01em]  h-[98px] px-[46px] rounded-[24px] outline outline-[3px]  outline-offset-[-3px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]" // 라벨에 적용할 클래스
            options={styleKeywords}
            // options={[
            //   { value: '', label: '랜덤' },
            //   { value: '', label: '네온' },
            //   { value: '', label: '메탈' },
            //   { value: '', label: '비대칭' },
            //   { value: '', label: '모노톤' },
            //   { value: '', label: '데님' },
            //   { value: '', label: '럭셔리' },
            //   { value: '', label: '스트릿' },
            //   { value: '', label: '테크웨어' },
            // ]}
          />
        </div>

        <div className="">
          <div className="flex justify-center mb-[30px]">
            <KeywardSectionLabel text="MOOD" />
          </div>
          <RadioGroup
            name="moodGroup"
            selectedValue={moodGroup}
            onChange={setMoodGroup}
            className="flex justify-center flex-wrap gap-5"
            labelClassName="text-[30px] tracking-[-0.01em]  h-[98px] px-[46px] rounded-[24px] outline outline-[3px] outline-offset-[-3px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]" // 라벨에 적용할 클래스
            options={moodKeywords}
            // options={[
            //   { value: '', label: '랜덤' },
            //   { value: '', label: '몽환적인' },
            //   { value: '', label: '미래적인' },
            //   { value: '', label: '초현실주의' },
            //   { value: '', label: '다크' },
            //   { value: '', label: '팝아트' },
            //   { value: '', label: '고딕' },
            //   { value: '', label: '해체주의' },
            //   { value: '', label: '실험적인' },
            //   { value: '', label: '사이버펑크' },
            // ]}
          />
        </div>
      </section>

      <section className="flex-1 flex items-end">
        <div className="flex w-full gap-[30px]">
          <Link
            to={ROUTER_PATH.KIOSK_CAPTURE}
            className="inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-white text-[50px] font-bold text-[#0033FF]"
          >
            <Arrowleft /> 이전
          </Link>
          <button
            onClick={handleNext}
            disabled={isPending}
            className="inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-[#0033FF] text-[50px] font-bold text-white disabled:bg-gray-500"
          >
            {isPending ? '처리 중...' : '다음'} <ArrowRighgt />
          </button>
        </div>
      </section>
    </div>
  );
};

export default KeywordsStep;
