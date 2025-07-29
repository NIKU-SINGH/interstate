import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import { getActivePositionsByUser, getStoredWallets, storeWallets } from '~/utils/functions';
import type { PositionRow, Wallet } from '~/utils/functions';
import AddWalletModal from '../components/AddWalletModal';
import WalletRow from '../components/WalletRow';
import ImportExportWalletModal from '../components/ImportExportWalletModal';
import WalletScanPanel from '../components/WalletScanPanel';

const TABS = ['Wallet Manager', 'Live Trades'];
const EMOJIS = ['💰','🚀','🦄','🐉','🦊','🐸','🐼','🐧','🦁','🐵','🐻','🐨','🐯','🦕','🦖','🐙','🐳','🐬','🦋','🌟','🔥','🌈','🍀','🍕','🍔','🍣','🍩','🍦','🎲','🎯','🎮','🎸','🎹','🏆','🥇','🥈','🥉','⚡','💎','🧊','🪐','🌌','🌠','🛸','🛰️','🚁','🚢','✈️','🚗','🏎️','🚓','🚑','🚒','🚜','🚲','🛴','🛵','🏍️','🦽','🦼','🛹','🛶','⛵','🚤','🛥️','🚀'];

export default function TrackersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toast, setToast] = useState('');
  const [scannedWallet, setScannedWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    // Load wallets from localStorage on component mount
    setWallets(getStoredWallets());
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      setLoading(true);
      // Use a hardcoded userId for now
      getActivePositionsByUser('demo-user')
        .then(setPositions)
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleAddWallet = (address: string, name: string) => {
    const newWallet: Wallet = {
      address,
      name: name || `Wallet ${wallets.length + 1}`,
      createdAt: Date.now(),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    };
    const updatedWallets = [...wallets, newWallet];
    setWallets(updatedWallets);
    storeWallets(updatedWallets);
    setShowAddWalletModal(false);
  };

  const handleRemoveWallet = (addressToRemove: string) => {
    let updatedWallets: Wallet[];
    if (addressToRemove === 'all') {
      updatedWallets = [];
    } else {
      updatedWallets = wallets.filter(wallet => wallet.address !== addressToRemove);
    }
    setWallets(updatedWallets);
    storeWallets(updatedWallets);
  };

  // Helper to format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Filter wallets based on search term
  const filteredWallets = wallets.filter(wallet => 
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export: copy addresses to clipboard and show toast
  const handleExportAddresses = () => {
    const addresses = wallets.map(w => w.address).join(', ');
    navigator.clipboard.writeText(addresses);
    setToast('Wallets copied to clipboard');
    setTimeout(() => setToast(''), 2000);
  };

  // Import wallets from JSON file
  const handleImportWallets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setWallets(imported);
          storeWallets(imported);
        } else {
          alert('Invalid wallet file format.');
        }
      } catch {
        alert('Failed to import wallets.');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be imported again if needed
    e.target.value = '';
  };

  return (
    <>
      <Head>
        <title>Trackers | Interstate Memeboard</title>
      </Head>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100">
        <Header />
        <div className="flex-grow w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-2 text-base font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === i 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
                onClick={() => setActiveTab(i)}
              >
                {tab}
                {tab === 'Live Trades' && <span className="ml-1 text-pink-400 text-lg align-top animate-pulse">•</span>}
              </button>
            ))}
            <div className="flex-1" />
            {/* Search and actions */}
            <input
              type="text"
              placeholder="Search by name or addr..."
              className="bg-neutral-900/50 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent w-72 mr-4 backdrop-blur-sm transition-all duration-300"
              disabled={activeTab === 1}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {activeTab === 0 && (
              <>
                <button
                  className="bg-neutral-800/50 hover:bg-neutral-700 text-white font-semibold rounded-lg px-4 py-2 mr-2 transition-all duration-300 backdrop-blur-sm"
                  onClick={() => setShowImportModal(true)}
                >
                  Import
                </button>
                <button
                  className="bg-neutral-800/50 hover:bg-neutral-700 text-white font-semibold rounded-lg px-4 py-2 mr-2 transition-all duration-300 backdrop-blur-sm"
                  onClick={handleExportAddresses}
                >
                  Export
                </button>
                <button 
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-semibold rounded-lg px-4 py-2 shadow-lg shadow-blue-500/20 transition-all duration-300"
                  onClick={() => setShowAddWalletModal(true)}
                >
                  Add Wallet
                </button>
              </>
            )}
          </div>

          {/* Main Content Area: Two Columns */}
          <div className="flex flex-row gap-6 h-full">
            {/* Left Column: Wallet Manager / Live Trades Table */}
            <div className="flex-1 bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 min-h-[700px] h-full border border-neutral-800/50 shadow-xl">
              {activeTab === 0 ? (
                <>
                  <div className="flex items-center border-b border-neutral-800/50 pb-4 mb-4">
                    <div className="flex-1 flex gap-8 text-neutral-400 text-sm">
                      <span className="w-32">Created</span>
                      <span className="flex-1">Name</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-neutral-400 text-sm">Actions</span>
                      <button className="text-neutral-400 hover:text-white transition-colors duration-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.04 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg></button>
                      <button className="text-neutral-400 hover:text-white transition-colors duration-300"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.92c-1.01 0-1.85-.75-1.992-1.874L5.323 6.075m1.022-.165L5.754 5.105a1.125 1.125 0 011.992-.858L12 8.752l3.254-4.505a1.125 1.125 0 011.992.858z" /></svg></button>
                      <button className="ml-4 text-red-400 text-sm font-semibold hover:text-red-300 transition-colors duration-300" onClick={() => handleRemoveWallet('all')}>Remove All</button>
                    </div>
                  </div>
                  {wallets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <span className="text-neutral-400">No wallets added yet.</span>
                    </div>
                  ) : (
                    <table className="w-full text-xs mt-2">
                      <tbody>
                        {filteredWallets.map((wallet) => (
                          <WalletRow key={wallet.address} wallet={wallet} onRemove={handleRemoveWallet} onClick={setScannedWallet} />
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4 mb-4">
                    <div className="flex-1 flex gap-8 text-neutral-400 text-sm">
                      <span className="w-48">Name</span>
                      <span className="w-48">Token</span>
                      <span className="w-32">Amount</span>
                      <span className="w-32">MC</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-neutral-400">Paused</span>
                      <button className="text-neutral-400 hover:text-white transition-colors duration-300">&#9646;&#9646;</button>
                      <span className="text-neutral-400">P1</span>
                      <span className="text-neutral-400">0.0</span>
                      <button className="text-neutral-400 hover:text-white transition-colors duration-300">Customize Feed</button>
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <span className="text-neutral-400">Loading...</span>
                    </div>
                  ) : positions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <span className="text-neutral-400">No transactions yet.</span>
                    </div>
                  ) : (
                    <table className="w-full text-xs mt-2">
                      <tbody>
                        {positions.map((pos, idx) => (
                          <tr key={pos.tokenAddress || idx} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors duration-300">
                            <td className="w-48 px-2 py-2 font-mono">WalletName</td>
                            <td className="w-48 px-2 py-2 font-mono">{pos.tokenAddress}</td>
                            <td className="w-32 px-2 py-2">{pos.remaining}</td>
                            <td className="w-32 px-2 py-2">${pos.remainingUsdValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>

            {/* Right Column: Twitter Alerts */}
            <div className="w-96 bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 min-h-[700px] h-full border border-neutral-800/50 shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4 mb-4">
                <h3 className="text-lg font-semibold text-white">Twitter Alerts</h3>
              </div>
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <span className="text-neutral-400 mb-4">Start tracking accounts to see Twitter alerts!</span>
                <button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-semibold rounded-lg px-6 py-3 shadow-lg shadow-blue-500/20 transition-all duration-300">
                  Add Twitter Handles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddWalletModal
        isOpen={showAddWalletModal}
        onClose={() => setShowAddWalletModal(false)}
        onAddWallet={handleAddWallet}
      />
      <ImportExportWalletModal
        mode={'import'}
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(imported) => { setWallets(imported); storeWallets(imported); }}
        wallets={wallets}
      />
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm animate-fade-in">
          {toast}
        </div>
      )}
      {scannedWallet && (
        <WalletScanPanel wallet={scannedWallet} onClose={() => setScannedWallet(null)} />
      )}

      {/* Bottom Navigation/Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-neutral-900/80 backdrop-blur-md border-t border-emerald-950/50 flex justify-between items-center px-6 py-3 text-xs z-40">
        <div className="flex gap-6">
          <button className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-300">
            <span className="text-lg">📊</span> Wallet Tracker
          </button>
          <button className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold transition-colors duration-300">
            <span className="text-lg">🐦</span> Twitter Tracker
          </button>
          <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300">
            <span className="text-lg">📈</span> PnL Tracker
          </button>
        </div>
        <div className="flex items-center gap-6 text-neutral-400">
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">💰</span> $106.8K
          </span>
          <span className="flex items-center gap-2">
            <span className="text-blue-400">💎</span> $2581
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-400">💸</span> $152.42
          </span>
          <span className="flex items-center gap-2">
            <span className="text-neutral-400">🔗</span> Connection is stable
          </span>
          <span className="flex items-center gap-2">
            <span className="text-neutral-400">🌐</span> US-W
          </span>
          <span className="text-neutral-400 hover:text-white transition-colors duration-300 cursor-pointer">Docs</span>
        </div>
      </div>
    </>
  );
} 