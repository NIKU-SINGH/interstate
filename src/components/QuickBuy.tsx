import React, { useState } from "react";
import { useQuickBuy } from "./QuickBuyContext";
import type { QuickBuySettings } from "./QuickBuyContext";
import VerticalInput from "./VerticalInput";
import {
  FaRunning,
  FaGasPump,
  FaCoins,
  FaInfoCircle,
  FaBan,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";
import InterstateTooltip from "./InterstateTooltip";
import InterstateButton from "./InterstateButton";
import CustomCheckbox from './CustomCheckbox';

const presetLabels = ["PRESET 1", "PRESET 2", "PRESET 3"];
const mevModes = [
  { label: "Off", value: "off" },
  { label: "Reduced", value: "reduced" },
  { label: "Secure", value: "on" },
];

interface QuickBuyProps {
  hideActionButton?: boolean;
  sideProp?: "buy" | "sell";
  onContinue?: () => void;
  className?: string;
}

const QuickBuy: React.FC<QuickBuyProps> = ({ hideActionButton = false, sideProp, onContinue, className }) => {
  const {
    presets,
    setPresets,
    activePreset,
    setActivePreset,
  } = useQuickBuy();
  const [side, setSide] = useState<"buy" | "sell">(
    sideProp || "buy"
  );
  const [expanded, setExpanded] = useState(false);

  // Helper to update a field in the correct preset and side
  const updateSetting = (key: keyof QuickBuySettings, value: any) => {
    const newPresets = presets.map((p, i) =>
      i === activePreset
        ? {
            ...p,
            quickBuySettings:
              side === "buy"
                ? { ...p.quickBuySettings, [key]: value }
                : p.quickBuySettings,
            quickSellSettings:
              side === "sell"
                ? { ...p.quickSellSettings, [key]: value }
                : p.quickSellSettings,
          }
        : p
    );
    setPresets(newPresets);
  };

  const settings =
    side === "buy"
      ? presets[activePreset].quickBuySettings
      : presets[activePreset].quickSellSettings;

  // Determine the wrapper className
  const defaultClass = "flex flex-col gap-2 rounded-xl border border-neutral-700/90 bg-neutral-900 px-3 py-3 text-neutral-100";
  // If className disables border/bg/rounded, use only className, else merge
  const wrapperClass = className !== undefined ? `flex flex-col gap-2 px-3 py-3 ${className}` : defaultClass;

  return (
    <div className={wrapperClass}>
      {/* Presets */}
      <div className="mb-4 flex gap-2 rounded-xl border border-neutral-700/90 px-1 py-1">
        {presetLabels.map((label, i) => (
          <button
            key={label}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${activePreset === i ? "bg-emerald-300/20 text-emerald-200" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"}`}
            onClick={() => {
              setActivePreset(i);
              setExpanded(true);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Only show the rest if expanded */}
      {expanded && (
        <>
        {/* Buy/Sell Tabs */}
        <div className="flex gap-2 rounded-xl border border-neutral-700/90 px-1 py-1">
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-xs uppercase transition-colors ${side === "buy" ? "bg-emerald-400/20 text-emerald-200" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
            onClick={() => setSide("buy")}
          >
            Buy Settings
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-xs uppercase transition-colors ${side === "sell" ? "bg-red-400/80 text-red-50" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
            onClick={() => setSide("sell")}
          >
            Sell Settings
          </button>
        </div>
        {/* Settings Inputs */}
        <div className="mb-4 grid grid-cols-3 gap-2 px-2">
          <VerticalInput
            label="SLIPPAGE"
            value={settings.maxSlippage}
            setValue={v => updateSetting('maxSlippage', v)}
            icon={<FaRunning />}
          />
          <VerticalInput
            label="PRIORITY"
            value={settings.priority}
            setValue={v => updateSetting('priority', v)}
            icon={<FaGasPump />}
          />
          <VerticalInput
            label="BRIBE"
            value={settings.bribe}
            setValue={v => updateSetting('bribe', v)}
            icon={<FaCoins />}
          />
        </div>
        {/* Auto Fee and Max Fee */}
        <div className="mb-4 flex items-center justify-between gap-2 px-2">
          <label className="flex cursor-pointer items-center gap-2">
            <InterstateTooltip
              label={
                <div className="p-1 text-center">
                  Automatically adjusts priority
                  <br />
                  and bribe fees based on network
                  <br />
                  conditions. Locked upon order
                  <br />
                  creation for limit orders.
                </div>
              }
              widthClass="w-52"
            >
              <span className="flex items-center gap-2">
                <CustomCheckbox checked={settings.autoFee} onChange={e => updateSetting('autoFee', e.target.checked)} className="mr-2" />
                <span className="text-xs font-bold text-neutral-300">
                  Auto Fee
                </span>
              </span>
            </InterstateTooltip>
          </label>
          <div className="rounded-3xl border border-neutral-700/90 px-2 py-1">
            <span className="text-xs text-neutral-600">MAX FEE</span>
            <input
              type="number"
              className="ml-2 w-28 flex-1 text-xs text-neutral-200 outline-none"
              placeholder="MAX FEE"
              value={settings.maxFee}
              onChange={e => updateSetting('maxFee', Number(e.target.value))}
              disabled={settings.autoFee}
            />
          </div>
        </div>
        {/* MEV Mode */}
        <div className="mb-4 flex items-center gap-2 px-2">
          <InterstateTooltip
            widthClass="w-90"
            label={
              <>
                <b>Off</b>
                <br />
                Send trades as fast as possible to all Solana validators
                <br />
                <br />
                <b>Reduced</b>
                <br />
                Avoid sending transactions to blacklisted validators to reduce
                chances of MEV attacks
                <br />
                <br />
                <b>Secure [BETA]</b>
                <br />
                Only sends transactions to whitelisted validators.
                <br />
                This can be slow.
              </>
            }
          >
            <span className="mr-2 flex cursor-pointer items-center text-xs text-neutral-300">
              MEV Mode <FaInfoCircle className="ml-1" />
            </span>
          </InterstateTooltip>
          {mevModes.map((mode) => (
            <button
              key={mode.value}
              className={`flex items-center gap-1 rounded border px-2 py-1 text-xs font-semibold ${settings.mevMode === mode.value ? "text-black bg-neutral-100" : "text-neutral-300 bg-neutral-800 hover:bg-neutral-700"} border border-neutral-100`}
              onClick={() => updateSetting('mevMode', mode.value as any)}
            >
              {mode.value === "off" && <FaBan />}
              {mode.value === "reduced" && <FaShieldAlt />}
              {mode.value === "on" && <FaLock />}
              {mode.label}
            </button>
          ))}
        </div>
        {/* RPC Input */}
        <div className="mb-2 flex flex-row items-center rounded-3xl border border-neutral-700/90 pl-2 px-2">
          <span className="text-xs text-neutral-600">RPC</span>
          <input
            type="text"
            className="w-full px-3 py-2 text-xs text-neutral-300 outline-none"
            placeholder="https://"
            value={settings.rpc || ""}
            onChange={e => updateSetting('rpc', e.target.value)}
          />
        </div>
        {!hideActionButton && (
          <div className="pt-2">
            <InterstateButton onClick={onContinue} className="w-full">Continue</InterstateButton>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default QuickBuy; 