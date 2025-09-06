import AlarmIcon from '../../assets/icons/alarm.svg?react';

const CaptureCountdown = ({ count }: { count: number }) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
      <div className="relative flex items-center">
        <AlarmIcon />
        <div className="absolute top-4/7 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[#0033FF] text-7xl font-extrabold">
          {count}
        </div>
      </div>
    </div>
  );
};

export default CaptureCountdown;
