import React from 'react';

interface CheckboxProps {
  /** 체크박스의 고유 ID */
  id: string;
  /** 체크박스 옆에 표시될 라벨 */
  label: string;
  /**
   * 체크 상태 (boolean)
   * - 단일 선택: true / false
   * - 복수 선택: 해당 항목이 선택되었는지 여부 (예: `selectedItems.includes(item.id)`)
   */
  checked: boolean;
  /**
   * 상태 변경 콜백 함수
   * - 단일 선택: `(e) => setChecked(e.target.checked)`
   * - 복수 선택: `(e) => handleCheckboxChange(item.id, e.target.checked)`
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * 복수 선택 시 각 체크박스를 식별하기 위한 값
   * `onChange` 이벤트의 `event.target.value`로 전달됩니다.
   */
  value?: string;
  className?: string;
}

export const Checkbox = ({
  id,
  label,
  checked,
  onChange,
  value,
  className,
}: CheckboxProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        value={value}
        className="h-6 w-6" // TODO: 스타일 수정
      />
      <label htmlFor={id} className="ml-3 text-xl">
        {label}
      </label>
    </div>
  );
};
