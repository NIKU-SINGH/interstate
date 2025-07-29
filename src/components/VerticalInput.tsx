import React from 'react';

interface VerticalInputProps {
  label: string;
  value: number;
  setValue: (v: number) => void;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
}

// Prevent scrollwheel changing number input
function preventWheelChange(e: React.WheelEvent<HTMLInputElement>) {
  (e.target as HTMLInputElement).blur();
}

const VerticalInput: React.FC<VerticalInputProps> = ({ label, value, setValue, className = '', inputClassName = '', icon }) => (
  <div className={`flex flex-col items-center rounded-lg border border-neutral-700/90 ${className}`}>
    <input
      type="number"
      className={`w-full bg-neutral-800 text-center text-white py-1 text-sm outline-none border-b border-neutral-700/90 no-scrollbar rounded-t-lg ${inputClassName}`}
      value={value}
      onChange={e => setValue(Number(e.target.value))}
      onWheel={preventWheelChange}
    />
    <span className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1 rounded-b-lg">{icon}{label}</span>
  </div>
);

export default VerticalInput; 