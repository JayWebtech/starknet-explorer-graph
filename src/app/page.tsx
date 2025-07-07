"use client";

import { useState } from 'react';
import WalletSearch from './components/WalletSearch';
import TransactionGraph from './components/TransactionGraph';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);

  const handleSearch = (address: string) => {
    setWalletAddress(address);
    setIsLoading(true);
    setIsSearchCollapsed(true); // Collapse search when search is initiated
  };

  const handleExpandSearch = () => {
    setIsSearchCollapsed(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Starknet Transaction Explorer
          </h1>
          <p className="text-gray-600 mt-2">
            Visualize wallet transactions in an interactive graph
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!walletAddress ? (
          // Show search prominently when no wallet is selected
          <div className="space-y-8">
            <WalletSearch 
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </div>
        ) : (
          // Show search and graph layout when wallet is selected
          <div className="space-y-6">
            {/* Collapsible Search Section */}
            <div className={`transition-all duration-300 ${isSearchCollapsed ? 'h-16' : 'h-auto'}`}>
              {isSearchCollapsed ? (
                // Collapsed search - just show current wallet and expand button
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-600">
                      Current Wallet:
                    </div>
                    <div className=" text-xs text-black bg-gray-100 px-2 py-1 rounded">
                      {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                    </div>
                  </div>
                  <button
                    onClick={handleExpandSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Change Wallet
                  </button>
                </div>
              ) : (
                // Expanded search
                <div className="grid grid-cols-1">
                  <WalletSearch 
                    onSearch={handleSearch}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>

            {/* Transaction Graph Section */}
            <div className={`transition-all duration-300 ${isSearchCollapsed ? 'w-full' : 'w-full'}`}>
              <TransactionGraph 
                walletAddress={walletAddress}
                onLoadingChange={setIsLoading}
                isSearchCollapsed={isSearchCollapsed}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
