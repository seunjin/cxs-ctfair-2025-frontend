import React from 'react';
import clsx from 'clsx';

export type AdminStatusLabelUiVariant =
  | 'success'
  | 'pending'
  | 'failed'
  | 'warning';

const UI_STYLES: Record<AdminStatusLabelUiVariant, string> = {
  success: 'bg-[#F4F6F7] border border-[#E9EDF0] text-[#4C5154]',
  pending: 'bg-[#F4F6F7] border border-[#E9EDF0] text-[#7A8893]',
  failed: 'bg-[#FFF6F6] border border-[#FFE7E7] text-red-600',
  warning: 'bg-[#F4F6F7] border border-[#E9EDF0] text-[#BDC9D3]',
};

export interface AdminStatusLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** 공통 UI 톤 (서버 상태를 정규화한 값) */
  variant?: AdminStatusLabelUiVariant;
}

const AdminStatusLabel = ({
  variant = 'pending',
  className,
  ...props
}: AdminStatusLabelProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium text-[12px] rounded-[6px] h-6 px-2',
        UI_STYLES[variant],
        className
      )}
      {...props}
    />
  );
};

export default AdminStatusLabel;
