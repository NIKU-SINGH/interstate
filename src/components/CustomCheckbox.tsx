import React from 'react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export default function CustomCheckbox({ checked, onChange, className = '', disabled = false }: CustomCheckboxProps) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}> 
      <span className="relative w-5 h-5 flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        <span className="block w-5 h-5 border-2 border-emerald-500 rounded-sm bg-transparent transition-colors"></span>
        <span
          className={`absolute left-1/2 top-1/2 w-3 h-3 rounded-xs transition-colors duration-150 transform -translate-x-1/2 -translate-y-1/2 ${checked ? 'bg-emerald-500' : 'bg-transparent'}`}
        ></span>
      </span>
    </label>
  );
} 