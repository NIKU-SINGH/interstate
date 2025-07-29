import React, { useEffect, useState } from 'react';
import InterstatePopout from './InterstatePopout';
import InterstateButton from './InterstateButton';

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!open && !show) return null;

  return (
    <InterstatePopout open={open} onClose={onClose} align="top-right" className="bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm mt-16 mr-8 p-0 relative text-neutral-100" overlayClassName="items-start justify-end">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
        <span className="text-lg font-semibold">Notifications</span>
        <div className="flex items-center gap-4">
          <InterstateButton variant="secondary" size="sm" className="text-xs text-neutral-400 hover:underline bg-transparent border-none shadow-none px-0 py-0 h-auto">Clear All</InterstateButton>
          <InterstateButton variant="icon" size="sm" onClick={onClose} className="text-xl ml-2"><span>×</span></InterstateButton>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-16">
        <span className="text-neutral-500 text-base">No notifications</span>
      </div>
    </InterstatePopout>
  );
} 