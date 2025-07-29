import React from 'react';

type InterstateTooltipProps = {
  label: string | React.ReactNode;
  children: React.ReactNode;
  widthClass?: string; // e.g. 'max-w-xs', 'max-w-md'
  xOffset?: string; // e.g., '-translate-x-1/2', 'ml-0', '-ml-8'
  width?: number; // New: direct width in pixels
  height?: number; // New: direct height in pixels
  isDiv?: boolean
};

const InterstateTooltip: React.FC<InterstateTooltipProps> = ({ label, children, widthClass = 'max-w-md', xOffset = '-translate-x-1/2', width, height }) => {
  const [show, setShow] = React.useState(false);

  const tooltipStyle = {
    ...(width && { width: `${width}px` }),
    ...(height && { height: `${height}px` }),
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <span
          className={`absolute top-full left-0 z-50 mt-2 ${xOffset} rounded-lg bg-neutral-900/90 border border-emerald-700 shadow-2xl shadow-emerald-500/20 px-3 py-2 text-xs whitespace-pre-line text-white ${widthClass}`}
          style={tooltipStyle}
        >
          {typeof label === 'string' ? label : label}
        </span>
      )}
    </span>
  );
};

export default InterstateTooltip; 