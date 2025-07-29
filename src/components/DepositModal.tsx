"use client";

import React, { useEffect, useState } from "react";
import { FaCopy, FaTimes } from "react-icons/fa";
import Cookies from "js-cookie";
import QRCode from "qrcode";
import { useUser } from "./UserContext";
import InterstatePopout from './InterstatePopout';
import InterstateButton from './InterstateButton';

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ open, onClose }) => {
  const { user, loading: userLoading, refreshUser, solBalance } = useUser();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    if (user?.publicKey) {
      QRCode.toDataURL(user.publicKey, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          setQrCodeDataUrl("");
        });
    } else {
      setQrCodeDataUrl("");
    }
  }, [user?.publicKey]);

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch((err) => {
          console.error("Clipboard write failed:", err);
        });
    } else {
      console.warn("Clipboard API not available.");
    }
  };

  if (!open && !show) return null;

  return (
    <InterstatePopout open={open} onClose={onClose} align="center" className="relative mx-4 w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-6 py-4 text-neutral-100 shadow-2xl">
      <div className="mb-2 flex flex-row items-center justify-between">
        <h2 className="text-xl font-bold text-white">Deposit</h2>
        <InterstateButton variant="icon" size="sm" onClick={onClose} className="text-xl"><FaTimes size={20} /></InterstateButton>
      </div>
      <hr className="-mx-6 mb-2 border-neutral-600" />
      <div className="space-y-4">
        {userLoading ? (
          <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4 text-center">
            <div className="text-sm text-neutral-300">Loading user data...</div>
          </div>
        ) : !user ? (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center">
            <div className="text-sm text-red-400">Please login first to view your deposit address</div>
            {Cookies.get("token") && (
              <InterstateButton variant="primary" size="sm" onClick={refreshUser} className="mt-2">Refresh User Data</InterstateButton>
            )}
          </div>
        ) : user.publicKey ? (
          <>
            <div className="flex w-full flex-row items-center gap-2">
              <div className="flex h-10 w-full flex-row items-center gap-2 rounded border border-neutral-600 p-2 text-sm">
                <img src="https://www.pngall.com/wp-content/uploads/10/Solana-Crypto-Logo-PNG-File.png" className="h-6 w-6" />
                Solana
              </div>
              <div className="flex h-10 w-full flex-row items-center justify-between gap-2 rounded border border-neutral-600 p-2 text-sm">
                <span className="text-neutral-500">Balance: </span>
                <span className="">{solBalance.toFixed(2)} SOL</span>
              </div>
            </div>
            <label className="mb-3 block text-sm text-neutral-400">Only deposit SOL through the Solana Network for this address.</label>
            <div className="space-y-3">
              <div className="rounded-lg border border-neutral-700 p-1">
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="Deposit Address QR Code" className="h-40 w-40 rounded border border-neutral-600" />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded bg-neutral-700">
                        <span className="text-xs text-neutral-400">Generating QR...</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex flex-1 flex-col">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-neutral-300">Deposit Address:</span>
                    </div>
                    <div className="relative flex items-start gap-2">
                      <code onClick={() => copyToClipboard(user.publicKey)} className="flex-1 cursor-pointer rounded bg-neutral-800 px-2 py-1 text-sm leading-relaxed break-all text-emerald-400 hover:bg-neutral-700">{user.publicKey}</code>
                      <div className="relative flex items-center">
                        <InterstateButton variant="icon" size="sm" onClick={() => copyToClipboard(user.publicKey)} className="mt-1" title="Copy address"><FaCopy size={14} /></InterstateButton>
                        {copied && (
                          <span className="absolute -top-7 left-1/2 z-20 -translate-x-1/2 rounded bg-neutral-800 px-3 py-1 text-xs whitespace-nowrap text-emerald-400 opacity-100 shadow transition-opacity duration-300">Address copied successfully!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-neutral-500">Don't have any Solana? <span className="text-blue-400">Buy through Coinbase.</span></div>
            <hr className="-mx-6 mb-2 border-neutral-600" />
            <div className="pt-4">
              <InterstateButton fullWidth onClick={() => copyToClipboard(user.publicKey)}>Copy Deposit Address</InterstateButton>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4 text-center">
            <div className="mb-3 text-sm text-yellow-400">No deposit address found for your account</div>
            <div className="text-xs text-neutral-400">Please contact support to set up your deposit address</div>
          </div>
        )}
      </div>
    </InterstatePopout>
  );
};

export default DepositModal;
