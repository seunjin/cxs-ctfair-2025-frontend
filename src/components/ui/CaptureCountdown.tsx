import AlarmIcon from '../../assets/icons/alarm.svg?react';
const CaptureCountdown = () => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-1/2  ">
      <div
        className="flex items-center 
             relative "
      >
        <AlarmIcon />
        <div className="absolute top-4/7 left-1/2 -translate-1/2 text-center justify-start text-blue-700 text-7xl font-extrabold ">
          5
        </div>
      </div>
    </div>
  );
};

export default CaptureCountdown;
