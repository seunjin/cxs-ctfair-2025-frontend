import { RadioGroup } from '../../components/ui/RadioGroup';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';
import { useKiosk } from '../../contexts/kiosk/useKiosk';
import Arrowleft from '../../assets/icons/arrow-narrow-left.svg?react';
import ArrowRighgt from '../../assets/icons/arrow-narrow-right.svg?react';

const KeywardSectionLabel = ({ text }: { text: string }) => {
  return (
    <div className="px-7 py-3 bg-white/30 rounded-[99px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)]  outline-[3px] outline-offset-[-3px] outline-blue-700 backdrop-blur-[1px] inline-flex justify-center items-center gap-2">
      <div className="text-center justify-start text-[#0033FF] text-3xl font-bold font-['Pretendard'] leading-10">
        {text}
      </div>
    </div>
  );
};

const KeywordsStep = () => {
  const kiosk = useKiosk();
  const rouer = useNavigate();
  const { styleGroup, setStyleGroup, moodGroup, setMoodGroup } = kiosk;

  const handleNext = () => {
    rouer(ROUTER_PATH.KIOSK_COMPLETE);
  };
  return (
    <div className="flex h-full flex-col py-[40px_130px] px-20">
      <section className="pb-40">
        <h2 className="pb-15 text-center text-white text-5xl font-semibold leading-[70px]">
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
            options={[
              { value: '랜덤', label: '랜덤' },
              { value: '네온', label: '네온' },
              { value: '메탈', label: '메탈' },
              { value: '그라데이션', label: '그라데이션' },
              { value: '비닐', label: '비닐' },
              { value: '비대칭', label: '비대칭' },
              { value: '모노톤', label: '모노톤' },
              { value: '3D', label: '3D' },
              { value: '데님', label: '데님' },
              { value: '바이오', label: '바이오' },
              { value: '럭셔리', label: '럭셔리' },
              { value: '스트릿', label: '스트릿' },
              { value: '테크웨어', label: '테크웨어' },
              { value: '캐주얼', label: '캐주얼' },
              { value: '쉬폰', label: '쉬폰' },
              { value: '패턴', label: '패턴' },
            ]} // API로 받아온 옵션 사용
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
            options={[
              { value: '랜덤', label: '랜덤' },
              { value: '사이버펑크', label: '사이버펑크' },
              { value: '아방가르드', label: '아방가르드' },
              { value: '몽환적인', label: '몽환적인' },
              { value: '미래적인', label: '미래적인' },
              { value: '초현실주의', label: '초현실주의' },
              { value: '다크', label: '다크' },
              { value: '팝아트', label: '팝아트' },
              { value: '고딕', label: '고딕' },
              { value: '해체주의', label: '해체주의' },
              { value: '조형적인', label: '조형적인' },
              { value: '실험적인', label: '실험적인' },
            ]} // API로 받아온 옵션 사용
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
