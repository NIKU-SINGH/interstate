import React, { useEffect, useRef, useState } from 'react';

interface InterstatePopoutProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: 'center' | 'top-right';
  className?: string;
  overlayClassName?: string;
  disableClickOutside?: boolean;
}

export default function InterstatePopout({
  open,
  onClose,
  children,
  align = 'center',
  className = '',
  overlayClassName = '',
  disableClickOutside = false,
}: InterstatePopoutProps) {
  const [render, setRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setRender(true);
      requestAnimationFrame(() => setIsVisible(true)); // Wait a tick to allow transition
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setRender(false), 200); // Matches CSS duration
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    if (!open || disableClickOutside) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, disableClickOutside, onClose]);

  if (!render) return null;

  // Overlay classes for centering and background
  const overlayBase = 'fixed inset-0 z-50';
  const overlayCenter = 'flex items-center justify-center bg-black/40';
  const overlayTopRight = 'flex items-start justify-end bg-black/40';

  return (
    <div
      className={
        `${overlayBase} ${align === 'center' ? overlayCenter : overlayTopRight} ${isVisible ? 'visible' : ''} ${overlayClassName}`
      }
    >
      <div
        ref={contentRef}
        className={`interstate-content ${isVisible ? 'visible' : ''} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
