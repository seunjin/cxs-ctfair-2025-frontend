import { Link } from 'react-router-dom';

const KioskHeader = () => {
  return (
    <header className="sticky z-100 top-0 w-full h-[136px] flex items-center justify-between px-10">
      <h1 className="text-center justify-start text-[#0033FF] text-[50px] font-extrabold   [text-shadow:_0px_0px_15px_rgb(208_82_153_/_1.00)] ">
        SIMULATED RUNWAY
      </h1>
      <Link
        to="/kiosk"
        className="text-white text-3xl font-bold border-[2px] border-white leading-10 px-6 py-3 rounded-[99px]  outline-2 outline-offset-[-2px] outline-white/80 inline-flex justify-center items-center gap-2.5
"
      >
        처음으로
      </Link>
    </header>
  );
};

export default KioskHeader;
