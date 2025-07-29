import React, { useState } from 'react';

type AddWalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddWallet: (address: string, name: string) => void;
};

const AddWalletModal: React.FC<AddWalletModalProps> = ({ isOpen, onClose, onAddWallet }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletName, setWalletName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWallet(walletAddress, walletName);
    setWalletAddress('');
    setWalletName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-neutral-900 border border-emerald-700 shadow-2xl shadow-emerald-500/20 rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Add Wallet</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="walletAddress" className="block text-sm font-medium text-neutral-400 mb-1">Wallet Address</label>
            <input
              type="text"
              id="walletAddress"
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 w-full text-neutral-200 focus:outline-none focus:border-emerald-500"
              placeholder="Enter wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="walletName" className="block text-sm font-medium text-neutral-400 mb-1">Wallet Name</label>
            <input
              type="text"
              id="walletName"
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 w-full text-neutral-200 focus:outline-none focus:border-emerald-500"
              placeholder="Enter wallet name (optional)"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
          >
            Add Wallet
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWalletModal; 