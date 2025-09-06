import { Checkbox } from './Checkbox';

// --- 타입 정의 ---
interface CheckboxOption {
  value: string;
  label: string;
  id?: string;
}

interface CheckboxGroupProps {
  /** 선택된 값들의 배열 */
  selectedValues: string[];
  /** 변경 시 선택된 값들의 새 배열을 반환하는 콜백 */
  onChange: (values: string[]) => void;
  /** 체크박스 옵션 배열 */
  options: CheckboxOption[];
  className?: string;
  itemClassName?: string;
}

export const CheckboxGroup = ({
  selectedValues,
  onChange,
  options,
  className,
  itemClassName,
}: CheckboxGroupProps) => {
  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value) // 있으면 제거
      : [...selectedValues, value]; // 없으면 추가
    onChange(newValues);
  };

  return (
    <div className={className}>
      {options.map((option) => (
        <Checkbox
          key={option.value}
          id={option.id || `checkbox-${option.value}`}
          label={option.label}
          value={option.value}
          checked={selectedValues.includes(option.value)}
          onChange={() => handleToggle(option.value)}
          className={itemClassName}
        />
      ))}
    </div>
  );
};
