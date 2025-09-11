import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';

const Input = ({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={clsx(
        'h-[38px] px-[18px] text-[15px] bg-white rounded-[8px] border-1 border-[#e9edf0] placeholder:text-[#C3C9CE]',
        className
      )}
      {...rest}
    />
  );
};

export default Input;
