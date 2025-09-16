import { useMemo } from 'react';
import { RadioGroup } from '../../components/ui/RadioGroup';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';
import { useKiosk } from '../../contexts/kiosk/useKiosk';
import Arrowleft from '../../assets/icons/arrow-narrow-left.svg?react';
import ArrowRighgt from '../../assets/icons/arrow-narrow-right.svg?react';
// import { createDocentJob, getKeywords } from '../../api/kioskApi'; // 도슨트용 API 함수로 교체 (가정)
import { getKeywords } from '../../api/kioskApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import LoaderIcon from '../../assets/icons/loader.svg?react';
import clsx from 'clsx';
import adminApi from '../../api/adminApi';

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
    styleGroup,
    moodGroup,
    // capturedImage,
    // landmarks,
    docentTeam, // 컨텍스트에서 docentTeam 가져오기
    setStyleGroup,
    setMoodGroup,
  } = kiosk;

  const { data } = useQuery({
    queryKey: ['keywords'],
    queryFn: getKeywords,
  });

  // 도슨트 모드에서는 API 호출을 주석 처리합니다.
  // 로딩 상태(isPending)는 버튼 비활성화 등을 위해 유지합니다.
  const { mutate, isPending } = useMutation({
    mutationFn: adminApi.createDocentJob, // 도슨트용 API 함수 (가상)
    onSuccess: () => {
      console.log('SUCCESS : createDocentJob (Simulated)');
      // 도슨트 모드의 다음 경로로 이동합니다.
      router(ROUTER_PATH.DOCENT_COMPLETE);
    },
    onError: (error) => {
      console.error('도슨트 작업 생성에 실패했습니다 (Simulated):', error);
      alert(`도슨트 작업 생성에 실패했습니다: ${error.message}`);
    },
  });

  const handleNext = () => {
    // 도슨트 모드에서는 capturedImage와 landmarks 검사를 하지 않습니다.
    if (!styleGroup || !moodGroup) {
      alert('모든 키워드를 선택해주세요.');
      return;
    }

    mutate({ docent: docentTeam! });

    // 우선 API 호출 없이 다음 단계로 바로 이동하도록 처리
    // 위 mutate 로직은 나중에 실제 API가 준비되면 활성화합니다.
    console.log('도슨트 모드 다음 단계로 이동. 전송될 데이터:', {
      docent: docentTeam,
    });
    router(ROUTER_PATH.DOCENT_COMPLETE);
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
    <>
      <div className="flex h-full flex-col py-[40px_130px] px-20">
        <section className="flex  flex-col justify-centerr flex-1 gap-20">
          <h2 className="pb-15  text-center text-white text-[50px] font-semibold">
            원하는 컨셉의 키워드를 골라주세요!
          </h2>
          <div>
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
                labelClassName="text-[30px] tracking-[-0.01em]  h-[98px] px-[46px] rounded-[24px] outline outline-[3px]  outline-offset-[-3px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]" // 라벨에 적용할 클래스
                options={moodKeywords}
              />
            </div>
          </div>
        </section>

        <section className=" flex items-end">
          <div className="flex w-full gap-[30px]">
            <Link
              to={ROUTER_PATH.DOCENT_CAPTURE}
              className="inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-white text-[50px] font-bold text-[#0033FF]"
            >
              <Arrowleft /> 이전
            </Link>
            <button
              onClick={handleNext}
              disabled={isPending || !styleGroup || !moodGroup}
              className="peer inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-[#0033FF] text-[50px] font-bold text-white disabled:text-white/40"
            >
              다음{' '}
              <ArrowRighgt
                className={clsx(
                  (isPending || !styleGroup || !moodGroup) && 'opacity-40'
                )}
              />
            </button>
          </div>
        </section>
      </div>
      {isPending && (
        <div className="fixed inset-0 z-100 bg-black/70 flex items-center justify-center ">
          <LoaderIcon className="w-13 h-13 animate-spin opacity-100" />
        </div>
      )}
    </>
  );
};

export default KeywordsStep;
