import { Link } from 'react-router-dom';
import SettingIcon from '../../assets/icons/settings.svg?react';
import { ROUTER_PATH } from '../../router';
const MainStep = () => {
  return (
    <div className="flex flex-col h-full pt-76 pb-15">
      <section className="pb-50">
        <h1 className="self-stretch text-center justify-start text-blue-700 text-9xl font-extrabold font-['Pretendard'] leading-[150px] [text-shadow:_0px_0px_15px_rgb(208_82_153_/_1.00)] pb-25">
          SIMULATED
          <br />
          RUNWAY
        </h1>
        <p className="text-center justify-start text-white text-7xl font-extrabold font-['Pretendard'] leading-[98px] pb-10">
          AI로 나만의 런웨이 무대!
          <br />
          지금 바로 주인공이 되어보세요.
        </p>
        <p className="text-center justify-start text-white text-4xl font-semibold font-['Pretendard'] leading-[60px]">
          얼굴을 촬영하고 원하는 의상을 고르면
          <br />
          AI가 런웨이 영상을 만들어드립니다.
        </p>
      </section>
      <section>
        <div className="flex justify-center ">
          <Link
            to={ROUTER_PATH.KIOSK_INFO}
            className="w-[920px] px-2.5 py-12 bg-blue-700 rounded-[32px] mx-auto shadow-[0px_0px_15px_0px_rgba(208,82,153,1.00)]  text-center justify-start text-white text-5xl font-bold font-['Pretendard'] leading-[75px] cursor-pointer"
          >
            체험 시작하기
          </Link>
        </div>
      </section>

      <section className=" flex flex-1 items-end justify-center ">
        <Link
          to={ROUTER_PATH.ADMIN}
          className="inline-flex items-center gap-2 cursor-pointer"
        >
          <SettingIcon className="w-7 h-7" />{' '}
          <span className="text-center justify-start text-zinc-100/90 text-3xl font-semibold ">
            관리자
          </span>
        </Link>
      </section>
    </div>
  );
};

export default MainStep;
