import { useMemo } from 'react';
import { RadioGroup } from '../../components/ui/RadioGroup';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';
import { useKiosk } from '../../contexts/kiosk/useKiosk';
import Arrowleft from '../../assets/icons/arrow-narrow-left.svg?react';
import ArrowRighgt from '../../assets/icons/arrow-narrow-right.svg?react';
import { getKeywords } from '../../api/kioskApi';
import type { Keyword } from '../../api/types';
import { useQuery } from '@tanstack/react-query';

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
  const rouer = useNavigate();
  const { styleGroup, setStyleGroup, moodGroup, setMoodGroup } = kiosk;

  const { data } = useQuery({
    queryKey: ['keywords'],
    queryFn: getKeywords,
  });

  const handleNext = () => {
    rouer(ROUTER_PATH.KIOSK_COMPLETE);
  };

  const styleKeywords = useMemo(
    () => (data ?? []).filter((kw) => kw.type === 'COLOR_AND_STYLE').map((kw) => ({ value: kw.value, label: kw.label })),
    [data],
  );
  const moodKeywords = useMemo(
    () =>
      (data ?? []).filter((kw) => kw.type === 'ATMOSPHERE_AND_MOOD').map((kw) => ({ value: kw.value, label: kw.label })),
    [data],
  );

  return (
    <div className="flex h-full flex-col py-[40px_130px] px-20">
      <section className="">
        <h2 className="pb-15 text-center text-white text-[50px] font-semibold leading-[70px]">
          원하는 의상 컨셉의
          <br />
          키워드를 골라주세요!
        </h2>

        <div className="mb-[75px]">
          <div className="flex justify-center mb-[30px]">
            <KeywardSectionLabel text="색감&스타일" />
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
            <KeywardSectionLabel text="분위기&무드" />
          </div>
          <RadioGroup
            name="moodGroup"
            selectedValue={moodGroup}
            onChange={setMoodGroup}
            className="flex justify-center flex-wrap gap-5"
            labelClassName="text-[30px] tracking-[-0.01em]  h-[98px] px-[46px] rounded-[24px] outline outline-[3px] outline-offset-[-3px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]" // 라벨에 적용할 클래스
            options={moodKeywords}
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
            className="inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-[#0033FF] text-[50px] font-bold text-white"
          >
            다음 <ArrowRighgt />
          </button>
        </div>
      </section>
    </div>
  );
};

export default KeywordsStep;
