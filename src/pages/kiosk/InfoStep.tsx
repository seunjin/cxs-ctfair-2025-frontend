import { useState } from 'react';
import { RadioGroup } from '../../components/ui/RadioGroup';
import Arrowleft from '../../assets/icons/arrow-narrow-left.svg?react';
import ArrowRighgt from '../../assets/icons/arrow-narrow-right.svg?react';
import { Link } from 'react-router-dom';
import { ROUTER_PATH } from '../../router';
const InfoStep = () => {
  const [sexGroup, setSexGroup] = useState<string | null>('male');
  const [ageGroup, setAgeGroup] = useState<string | null>('20');

  return (
    <div className="flex h-full flex-col  py-[130px] px-20">
      <section className="pb-40">
        <h2 className="pb-15 text-center text-white text-5xl font-semibold">
          1. 체험하실 성별을 선택해 주세요.
        </h2>
        <RadioGroup
          name="sexGroup"
          selectedValue={sexGroup}
          onChange={setSexGroup}
          className="flex justify-center flex-wrap gap-6"
          labelClassName="text-5xl w-[246px] h-[150px] rounded-[32px] outline outline-[3px] outline-offset-[-3px] " // 라벨에 적용할 클래스
          options={[
            { value: 'male', label: '남성' },
            { value: 'female', label: '여성' },
          ]} // API로 받아온 옵션 사용
        />
      </section>

      <section className="pb-40">
        <h2 className="pb-15 text-center text-white text-5xl font-semibold">
          1. 체험하실 성별을 선택해 주세요.
        </h2>
        <RadioGroup
          name="ageGroup"
          selectedValue={ageGroup}
          onChange={setAgeGroup}
          className="flex justify-center flex-wrap gap-6 "
          labelClassName="text-5xl w-[246px] h-[150px] rounded-[32px] outline outline-[3px] outline-offset-[-3px] " // 라벨에 적용할 클래스
          options={[
            { value: '20', label: '20대' },
            { value: '30', label: '30대' },
            { value: '40', label: '40대' },
            { value: '50', label: '50대' },
            { value: '60', label: '60대' },
          ]} // API로 받아온 옵션 사용
        />
      </section>

      <section className="flex-1 flex items-end">
        <div className="flex w-full gap-[30px]">
          <Link
            to={ROUTER_PATH.KIOSK}
            className="inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-white text-[50px] font-bold text-blue-700"
          >
            <Arrowleft className="w-13 h-13" /> 이전
          </Link>
          <Link
            to={ROUTER_PATH.KIOSK_CAPTURE}
            className="inline-flex justify-center items-center gap-3 flex-1 rounded-full h-40 bg-blue-600 text-[50px] font-bold text-white"
          >
            다음 <ArrowRighgt className="w-13 h-13" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default InfoStep;
