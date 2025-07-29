import React from 'react';

export type InterstateButtonVariant = 'primary' | 'secondary' | 'danger' | 'icon';
export type InterstateButtonSize = 'sm' | 'md' | 'lg';

export interface InterstateButtonProps {
  variant?: InterstateButtonVariant;
  size?: InterstateButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

const base = 'rounded-full font-semibold transition focus:outline-none flex items-center justify-center';
const variants = {
  primary: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow',
  secondary: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  icon: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700',
};
const sizes = {
  sm: 'px-3 py-1 text-sm h-8',
  md: 'px-4 py-1.5 text-base h-10',
  lg: 'px-6 py-2 text-lg h-12',
};

export default function InterstateButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  title,
}: InterstateButtonProps) {
  return (
    <button
      type={type}
      className={[
        base,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        loading ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
    >
      {icon && <span className={children ? 'mr-2 flex-shrink-0' : ''}>{icon}</span>}
      {loading ? <span>Loading...</span> : children}
    </button>
  );
} 