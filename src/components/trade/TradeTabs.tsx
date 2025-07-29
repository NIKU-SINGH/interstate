import React from 'react';

const tabs = [
  'Trades',
  'Positions',
  'Orders',
  'Holders',
  'Top Traders',
  'Dev Tokens',
];

interface TradeTabsProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const TradeTabs: React.FC<TradeTabsProps> = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className="flex gap-4 pt-2 text-xs border-b border-emerald-950">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`px-3 py-1 font-semibold ${selectedTab === tab ? 'border-b-2 border-neutral-300 text-white' : 'text-neutral-400'}`}
          onClick={() => setSelectedTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TradeTabs; 