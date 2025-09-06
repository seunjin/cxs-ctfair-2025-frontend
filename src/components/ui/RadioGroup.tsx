import { createContext, useContext } from 'react';

// --- 타입 정의 ---
interface RadioOption {
  value: string;
  label: string;
  id?: string;
}

interface RadioGroupContextValue {
  name: string;
  selectedValue: string | null;
  onChange: (value: string) => void;
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// --- RadioGroup 컴포넌트 ---
interface RadioGroupProps {
  name: string;
  selectedValue: string | null;
  onChange: (value: string) => void;
  /** 옵션 배열을 전달하면 자동으로 Radio 아이템들을 렌더링합니다. */
  options?: RadioOption[];
  /** options prop을 사용하지 않을 경우, 수동으로 Radio 아이템을 넣습니다. */
  children?: React.ReactNode;
  className?: string;
  itemClassName?: string; // 각 아이템에 적용될 클래스
  labelClassName?: string; // 각 아이템의 라벨에 적용될 클래스
}

export const RadioGroup = ({
  name,
  selectedValue,
  onChange,
  options,
  children,
  className,
  itemClassName,
  labelClassName,
}: RadioGroupProps) => {
  const contextValue = { name, selectedValue, onChange };
  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div role="radiogroup" className={className}>
        {/* options prop이 있으면 자동 렌더링, 없으면 children 렌더링 */}
        {options
          ? options.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                label={option.label}
                id={option.id}
                className={itemClassName}
                labelClassName={labelClassName}
              />
            ))
          : children}
      </div>
    </RadioGroupContext.Provider>
  );
};

// --- Radio 아이템 컴포넌트 ---
interface RadioProps {
  value: string;
  label: string;
  id?: string;
  className?: string;
  labelClassName?: string; // 라벨에 적용될 클래스
}

export const Radio = ({
  value,
  label,
  id,
  className,
  labelClassName,
}: RadioProps) => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('Radio 컴포넌트는 RadioGroup 내에서 사용해야 합니다.');
  }

  const { name, selectedValue, onChange } = context;
  const isChecked = selectedValue === value;
  const finalId = id || `${name}-${value}`;

  return (
    <div className={`flex items-center  ${className}`}>
      <input
        type="radio"
        id={finalId}
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => onChange(value)}
        className="sr-only peer"
      />
      <label
        htmlFor={finalId}
        className={`font-semibold inline-flex items-center justify-center text-white text-center outline-white backdrop-blur-sm shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] peer-checked:bg-[#0033FF] peer-checked:outline-[#355EFF] ${labelClassName}`}
      >
        <span>{label}</span>
      </label>
    </div>
  );
};
