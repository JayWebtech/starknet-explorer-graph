"use client";

import { useState } from 'react';

interface WalletSearchProps {
  onSearch: (address: string) => void;
  isLoading: boolean;
}

export default function WalletSearch({ onSearch, isLoading }: WalletSearchProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const validateStarknetAddress = (addr: string): boolean => {
    // Starknet addresses are 64 characters long (with 0x prefix) or 66 characters
    const cleanAddr = addr.trim();
    if (!cleanAddr.startsWith('0x')) {
      return false;
    }
    return cleanAddr.length >= 64 && cleanAddr.length <= 66;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!validateStarknetAddress(address)) {
      setError('Please enter a valid Starknet address (starts with 0x and 64-66 characters)');
      return;
    }

    onSearch(address.trim());
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Search Wallet Address
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Starknet Wallet Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x0123456789abcdef..."
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </div>
          ) : (
            'Explore Transactions'
          )}
        </button>
      </form>

    </div>
  );
} 