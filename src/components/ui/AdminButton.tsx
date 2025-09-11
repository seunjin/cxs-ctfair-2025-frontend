import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type AdminButton = {
  variants?: 'primary' | 'secondary' | 'outline';
  size?: 36 | 48 | 50;
  clssName?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;
const AdminButton = ({
  variants = 'primary',
  size = 36,
  clssName,
  ...rest
}: AdminButton) => {
  const variantsPalette = () => {
    if (variants === 'outline') {
      return 'border-1 border-black text-black';
    } else if (variants === 'secondary') {
      return 'bg-black text-white';
    }
    // primary
    return 'bg-cxs-primary text-white';
  };
  const Size = () => {
    if (size === 36) {
      return 'h-[36px] text-[14px]';
    } else if (size === 48) {
      return 'h-[48px] text-[14px]';
    }
    return 'h-[50px]';
  };
  return (
    <button
      className={clsx(
        'rounded-[8px] px-5',
        variantsPalette(),
        Size(),
        clssName
      )}
      {...rest}
    />
  );
};

export default AdminButton;
