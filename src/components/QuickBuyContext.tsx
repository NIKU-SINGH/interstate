import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type MevMode = 'off' | 'reduced' | 'on';

export interface QuickBuySettings {
  maxSlippage: number;
  priority: number;
  bribe: number;
  mevMode: MevMode;
  autoFee: boolean;
  maxFee: number;
  rpc?: string;
}

export interface QuickBuyContextType {
  quickBuySettings: QuickBuySettings;
  setQuickBuySettings: (settings: QuickBuySettings) => void;
  quickSellSettings: QuickBuySettings;
  setQuickSellSettings: (settings: QuickBuySettings) => void;
  presets: QuickBuyPreset[];
  setPresets: (presets: QuickBuyPreset[]) => void;
  activePreset: number;
  setActivePreset: (idx: number) => void;
}

export interface QuickBuyPreset {
  name: string; // e.g. 'P1', 'P2', 'P3'
  quickBuySettings: QuickBuySettings;
  quickSellSettings: QuickBuySettings;
}

const defaultSettings: QuickBuySettings = {
  maxSlippage: 0.2,
  priority: 0.001,
  bribe: 0.05,
  mevMode: 'off',
  autoFee: false,
  maxFee: 0,
  rpc: undefined,
};

const defaultPresets: QuickBuyPreset[] = [
  { name: 'P1', quickBuySettings: { ...defaultSettings }, quickSellSettings: { ...defaultSettings } },
  { name: 'P2', quickBuySettings: { ...defaultSettings }, quickSellSettings: { ...defaultSettings } },
  { name: 'P3', quickBuySettings: { ...defaultSettings }, quickSellSettings: { ...defaultSettings } },
];

const QuickBuyContext = createContext<QuickBuyContextType | undefined>(undefined);

export function QuickBuyProvider({ children }: { children: ReactNode }) {
  // Load from localStorage if available
  const getInitialState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quickBuySettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            presets: parsed.presets || [...defaultPresets],
            activePreset: typeof parsed.activePreset === 'number' ? parsed.activePreset : 0,
          };
        } catch {
          // ignore parse errors
        }
      }
    }
    return { presets: [...defaultPresets], activePreset: 0 };
  };
  const initial = getInitialState();
  const [quickBuySettings, setQuickBuySettings] = useState<QuickBuySettings>({ ...defaultSettings });
  const [quickSellSettings, setQuickSellSettings] = useState<QuickBuySettings>({ ...defaultSettings });
  const [presets, setPresets] = useState<QuickBuyPreset[]>(initial.presets);
  const [activePreset, setActivePreset] = useState(initial.activePreset);

  // Save to localStorage on change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quickBuySettings', JSON.stringify({ presets, activePreset }));
    }
  }, [presets, activePreset]);

  // Optionally, add localStorage persistence here

  return (
    <QuickBuyContext.Provider value={{ quickBuySettings, setQuickBuySettings, quickSellSettings, setQuickSellSettings, presets, setPresets, activePreset, setActivePreset }}>
      {children}
    </QuickBuyContext.Provider>
  );
}

export function useQuickBuy() {
  const ctx = useContext(QuickBuyContext);
  if (!ctx) throw new Error('useQuickBuy must be used within a QuickBuyProvider');
  return ctx;
} 