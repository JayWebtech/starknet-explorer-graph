"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Provider, RpcProvider } from 'starknet';

interface VoyagerTransaction {
  blockId: string;
  blockNumber: number;
  hash: string;
  index: number;
  type: string;
  sender_address: string;
  contract_address: string;
  timestamp: number;
  actual_fee: string;
  execution_status: string;
  status: string;
  operations: string;
  calldata?: {
    type: string;
    data: number[];
  };
}

interface VoyagerResponse {
  items: VoyagerTransaction[];
  lastPage: number;
}

interface TokenTransfer {
  from: string;
  to: string;
  amount: string;
  function: string;
  tokenId: string;
  tokenAddress: string;
  symbol: string;
  decimals: number;
  usd?: string;
  usdPrice?: number;
  fromAlias?: string;
  toAlias?: string;
  tokenName: string;
  tokenLogoUrl?: string;
}

interface TransactionDetails {
  header: {
    blockNumber: number;
    hash: string;
    type: string;
    contract_address: string;
    sender_address: string;
    timestamp: number;
    execution_status: string;
    status: string;
  };
  actualFee: string;
  actualFeeUnit: string;
  receipt: {
    tokensTransferred: TokenTransfer[];
    feeTransferred: TokenTransfer[];
  };
}

interface Transaction {
  transaction_hash: string;
  block_number: number;
  sender_address?: string;
  receiver_address?: string | null;
  amount?: string;
  timestamp?: number;
  type: string;
  fee?: string;
  status?: string;
  operations?: string;
  contract_address?: string;
  details?: TransactionDetails;
  tokenTransfers?: TokenTransfer[];
}

interface GraphNode {
  id: string;
  name: string;
  type: 'wallet' | 'transaction' | 'address' | 'token-transfer';
  amount?: string;
  hash?: string;
  timestamp?: number;
  direction?: 'outgoing' | 'incoming';
  address?: string;
  isExpanded?: boolean;
  isExpandable?: boolean;
  tokenTransfer?: TokenTransfer;
  children?: GraphNode[];
}

interface TransactionGraphProps {
  walletAddress: string;
  onLoadingChange: (loading: boolean) => void;
  isSearchCollapsed?: boolean;
}

interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TokenTransferModalProps {
  tokenTransfer: TokenTransfer | null;
  isOpen: boolean;
  onClose: () => void;
}

function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  if (!isOpen || !transaction) return null;

  const openInVoyager = () => {
    const voyagerUrl = `https://sepolia.voyager.online/tx/${transaction.transaction_hash}`;
    window.open(voyagerUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-mono text-xs text-gray-600 break-all">
                {transaction.transaction_hash}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block Number</label>
                  <div className="text-sm text-gray-900">{transaction.block_number}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <div className="text-sm text-gray-900">{transaction.type}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operations</label>
                  <div className="text-sm text-gray-900">{transaction.operations || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
                  <div className="text-sm text-gray-900">
                    {transaction.fee ? `${(parseFloat(transaction.fee) / 1e18).toFixed(6)} ETH` : 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <div className="text-sm text-gray-900">
                    {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender</label>
                  <div className="text-xs font-mono text-gray-600 break-all">
                    {transaction.sender_address}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver</label>
                  <div className="text-xs font-mono text-gray-600 break-all">
                    {transaction.receiver_address || transaction.contract_address || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <button
                onClick={openInVoyager}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open in Voyager</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenTransferModal({ tokenTransfer, isOpen, onClose }: TokenTransferModalProps) {
  if (!tokenTransfer) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Token Transfer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {tokenTransfer.tokenLogoUrl && (
              <img 
                src={tokenTransfer.tokenLogoUrl} 
                alt={tokenTransfer.symbol} 
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold text-black text-lg">{tokenTransfer.tokenName}</h3>
              <p className="text-sm text-gray-600">{tokenTransfer.symbol}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {tokenTransfer.amount} {tokenTransfer.symbol}
              </div>
              {tokenTransfer.usd && (
                <div className="text-lg text-gray-600 mt-1">
                  ≈ {tokenTransfer.usd}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">From:</span>
              <div className="font-mono text-black text-[10px] break-all bg-gray-100 p-2 rounded mt-1">
                {tokenTransfer.from}
              </div>
              {tokenTransfer.fromAlias && (
                <div className=" text-[10px] text-black mt-1">{tokenTransfer.fromAlias}</div>
              )}
            </div>
            
            <div>
              <span className="font-medium text-gray-700">To:</span>
              <div className="text-black font-mono text-[10px] break-all bg-gray-100 p-2 rounded mt-1">
                {tokenTransfer.to}
              </div>
              {tokenTransfer.toAlias && (
                <div className="text-black text-[10px] mt-1">{tokenTransfer.toAlias}</div>
              )}
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Function:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {tokenTransfer.function}
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Token Contract:</span>
              <div className="font-mono text-[10px] text-black break-all bg-gray-100 p-2 rounded mt-1">
                {tokenTransfer.tokenAddress}
              </div>
            </div>
            
            {tokenTransfer.usdPrice && (
              <div>
                <span className="font-medium text-gray-700">Token Price:</span>
                <span className="ml-2 text-sm text-black">${tokenTransfer.usdPrice.toFixed(6)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionGraph({ walletAddress, onLoadingChange, isSearchCollapsed = false }: TransactionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTokenTransfer, setSelectedTokenTransfer] = useState<TokenTransfer | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set());

  const showTokenTransferDetails = (tokenTransfer: TokenTransfer) => {
    setSelectedTokenTransfer(tokenTransfer);
    setIsTokenModalOpen(true);
  };
  const [addressTransactions, setAddressTransactions] = useState<Map<string, Transaction[]>>(new Map());
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<Map<string, TransactionDetails>>(new Map());
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [expandingTransactions, setExpandingTransactions] = useState<Set<string>>(new Set());
  const [expandingAddresses, setExpandingAddresses] = useState<Set<string>>(new Set());

  const fetchTransactions = async (address: string, page: number = 1) => {
    try {
      setIsLoading(true);
      onLoadingChange(true);
      setError('');

      // Fetch transactions where the address is involved (both as sender and receiver)
      const response = await fetch(`https://sepolia.voyager.online/api/txns?to=${address}&ps=${pageSize}&p=${page}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data: VoyagerResponse = await response.json();
      console.log(`Fetched ${data.items.length} transactions for address ${address}`);

      // Convert transactions and properly categorize direction
      const fmtTxns: Transaction[] = data.items.map((voyagerTx: VoyagerTransaction) => {

        return {
          transaction_hash: voyagerTx.hash,
          block_number: voyagerTx.blockNumber,
          sender_address: voyagerTx.sender_address,
          contract_address: voyagerTx.contract_address,
          type: voyagerTx.type,
          timestamp: voyagerTx.timestamp * 1000,
          fee: voyagerTx.actual_fee,
          status: voyagerTx.execution_status,
          operations: voyagerTx.operations,
        };
      });

      const finalTransactions = fmtTxns.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, pageSize);
        
        // Automatically fetch transaction details for transfer transactions
        const transferTransactions = finalTransactions.filter(tx => 
          tx.operations && tx.operations.toLowerCase().includes('transfer')
        );
        
        // Fetch details for transfer transactions
        for (const tx of transferTransactions) {
          if (!transactionDetails.has(tx.transaction_hash)) {
            const details = await fetchTransactionDetails(tx.transaction_hash);
            if (details) {
              const newTransactionDetails = new Map(transactionDetails);
              newTransactionDetails.set(tx.transaction_hash, details);
              setTransactionDetails(newTransactionDetails);
            }
          }
        }
        
        setTransactions(finalTransactions);
        
        // Calculate total pages more accurately
        // Use the minimum of both APIs since we're combining them
        const estimatedTotalPages = Math.min(data.lastPage);
        // Cap at a reasonable number for performance
        setTotalPages(Math.min(estimatedTotalPages, 100));
  

      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching transactions from Voyager:', error);
      setError('Failed to fetch real transactions from Voyager API. Using demo data for visualization.');
      
      setTotalPages(5);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
      setIsLoadingPage(false);
    }
  };

  const fetchTransactionDetails = async (txHash: string): Promise<TransactionDetails | null> => {
    try {
      const response = await fetch(`https://sepolia.voyager.online/api/txn/${txHash}`);
      if (!response.ok) return null;

      const data = await response.json();
      console.log("TXN DETAILS", data)
      return {
        header: data.header,
        actualFee: data.actualFee,
        actualFeeUnit: data.actualFeeUnit,
        receipt: data.receipt
      };
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      return null;
    }
  };

  const fetchTransactionsBetweenAddresses = async (address1: string, address2: string, limit: number = 5) => {
    try {
      const transactions: Transaction[] = [];

      // Try fetching transactions involving both addresses
      const response1 = await fetch(`https://sepolia.voyager.online/api/txns?to=${address1}&ps=${limit}&p=1`);
      const response2 = await fetch(`https://sepolia.voyager.online/api/txns?to=${address2}&ps=${limit}&p=1`);

      if (response1.ok) {
        const data1: VoyagerResponse = await response1.json();
        const relevantTxs = data1.items.filter(tx => 
          tx.sender_address === address2 || tx.contract_address === address2
        );
        transactions.push(...relevantTxs.map((voyagerTx: VoyagerTransaction) => ({
          transaction_hash: voyagerTx.hash,
          block_number: voyagerTx.blockNumber,
          sender_address: voyagerTx.sender_address,
          receiver_address: voyagerTx.contract_address,
          contract_address: voyagerTx.contract_address,
          type: voyagerTx.type,
          timestamp: voyagerTx.timestamp * 1000,
          fee: voyagerTx.actual_fee,
          status: voyagerTx.execution_status,
          operations: voyagerTx.operations,
          direction: 'incoming' as const
        })));
      }

      if (response2.ok) {
        const data2: VoyagerResponse = await response2.json();
        const relevantTxs = data2.items.filter(tx => 
          tx.sender_address === address1 || tx.contract_address === address1
        );
        transactions.push(...relevantTxs.map((voyagerTx: VoyagerTransaction) => ({
          transaction_hash: voyagerTx.hash,
          block_number: voyagerTx.blockNumber,
          sender_address: voyagerTx.sender_address,
          receiver_address: voyagerTx.contract_address,
          contract_address: voyagerTx.contract_address,
          type: voyagerTx.type,
          timestamp: voyagerTx.timestamp * 1000,
          fee: voyagerTx.actual_fee,
          status: voyagerTx.execution_status,
          operations: voyagerTx.operations,
          direction: 'outgoing' as const
        })));
      }

      // Remove duplicates and sort
      const uniqueTransactions = transactions.filter((tx, index, self) => 
        index === self.findIndex(t => t.transaction_hash === tx.transaction_hash)
      );

      return uniqueTransactions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (error) {
      console.error('Error fetching transactions between addresses:', error);
      return [];
    }
  };

  const handleTransactionExpansion = async (txHash: string) => {
    if (expandedTransactions.has(txHash)) {
      // Collapse
      const newExpanded = new Set(expandedTransactions);
      newExpanded.delete(txHash);
      setExpandedTransactions(newExpanded);
    } else {
      // Expand
      const newExpanded = new Set(expandedTransactions);
      newExpanded.add(txHash);
      setExpandedTransactions(newExpanded);

      // Fetch transaction details if not already cached
      if (!transactionDetails.has(txHash)) {
        // Add to expanding set
        const newExpanding = new Set(expandingTransactions);
        newExpanding.add(txHash);
        setExpandingTransactions(newExpanding);

        try {
          const details = await fetchTransactionDetails(txHash);
          if (details) {
            const newTransactionDetails = new Map(transactionDetails);
            newTransactionDetails.set(txHash, details);
            setTransactionDetails(newTransactionDetails);
          }
        } finally {
          // Remove from expanding set
          const newExpanding = new Set(expandingTransactions);
          newExpanding.delete(txHash);
          setExpandingTransactions(newExpanding);
        }
      }
    }
  };

  const handleAddressExpansion = async (address: string) => {
    if (expandedAddresses.has(address)) {
      // Collapse
      const newExpanded = new Set(expandedAddresses);
      newExpanded.delete(address);
      setExpandedAddresses(newExpanded);
    } else {
      // Expand
      const newExpanded = new Set(expandedAddresses);
      newExpanded.add(address);
      setExpandedAddresses(newExpanded);

      // Fetch transactions between this address and the main wallet
      if (!addressTransactions.has(address)) {
        // Add to expanding set
        const newExpanding = new Set(expandingAddresses);
        newExpanding.add(address);
        setExpandingAddresses(newExpanding);

        try {
          // First, try to find the other address in the token transfer context
          let otherAddress = walletAddress;
          
          // Check if this address is part of a token transfer and get the other address
          for (const [txHash, details] of transactionDetails.entries()) {
            for (const transfer of details.receipt.tokensTransferred) {
              if (transfer.from === address) {
                otherAddress = transfer.to;
                break;
              } else if (transfer.to === address) {
                otherAddress = transfer.from;
                break;
              }
            }
          }
          
          const txs = await fetchTransactionsBetweenAddresses(otherAddress, address, 10);
          const newAddressTransactions = new Map(addressTransactions);
          newAddressTransactions.set(address, txs);
          console.log("txn between", newAddressTransactions)
          setAddressTransactions(newAddressTransactions);
        } finally {
          // Remove from expanding set
          const newExpanding = new Set(expandingAddresses);
          newExpanding.delete(address);
          setExpandingAddresses(newExpanding);
        }
      }
    }
  };

  const createGraphData = (transactions: Transaction[]): GraphNode => {
    const root: GraphNode = {
      id: walletAddress,
      name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      type: 'wallet',
      address: walletAddress,
      children: []
    };

    // Add transactions directly to the root, no grouping by direction
    transactions.forEach((tx) => {
      const isExpanded = expandedTransactions.has(tx.transaction_hash);
      const hasTokenTransfers = transactionDetails.has(tx.transaction_hash) && 
        transactionDetails.get(tx.transaction_hash)!.receipt.tokensTransferred.length > 0;
      
      const txNode: GraphNode = {
        id: tx.transaction_hash,
        name: `${tx.operations || tx.type}`,
        type: 'transaction',
        hash: tx.transaction_hash,
        amount: tx.fee ? (parseFloat(tx.fee) / 1e18).toFixed(6) + ' ETH' : undefined,
        timestamp: tx.timestamp,
        isExpandable: hasTokenTransfers,
        isExpanded,
        children: []
      };

      // Add token transfers if transaction is expanded and has token transfers
      if (isExpanded && hasTokenTransfers) {
        const details = transactionDetails.get(tx.transaction_hash)!;
        console.log(transactionDetails);
        details.receipt.tokensTransferred.forEach((transfer, index) => {
          const transferNode: GraphNode = {
            id: `${tx.transaction_hash}-transfer-${index}`,
            name: `${transfer.amount} ${transfer.symbol}`,
            type: 'token-transfer',
            tokenTransfer: transfer,
            children: []
          };

          // Add from and to addresses as children of the token transfer
          const fromAddress = transfer.from;
          const toAddress = transfer.to;
          
          // From address
          transferNode.children!.push({
            id: `${tx.transaction_hash}-transfer-${index}-from`,
            name: `From: ${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}`,
            type: 'address',
            address: fromAddress,
            isExpandable: false,
            isExpanded: false,
            children: []
          });

          // To address
          transferNode.children!.push({
            id: `${tx.transaction_hash}-transfer-${index}-to`,
            name: `To: ${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`,
            type: 'address',
            address: toAddress,
            isExpandable: true,
            isExpanded: expandedAddresses.has(toAddress),
            children: []
          });

          // Add transactions between from and to addresses if either is expanded
          if (expandedAddresses.has(fromAddress) && addressTransactions.has(fromAddress)) {
            const fromTxs = addressTransactions.get(fromAddress)!;
            fromTxs.forEach((subTx, subIndex) => {
              transferNode.children![0].children!.push({
                id: `${fromAddress}-tx-${subIndex}`,
                name: `${subTx.amount || (subTx.fee ? (parseFloat(subTx.fee) / 1e18).toFixed(4) + ' STRK' : 'N/A')} - ${subTx.operations || subTx.type}`,
                type: 'transaction',
                hash: subTx.transaction_hash,
                timestamp: subTx.timestamp,
                children: []
              });
            });
          }

          if (expandedAddresses.has(toAddress) && addressTransactions.has(toAddress)) {
            const toTxs = addressTransactions.get(toAddress)!;
            toTxs.forEach((subTx, subIndex) => {
              transferNode.children![1].children!.push({
                id: `${toAddress}-tx-${subIndex}`,
                name: `${subTx.amount || (subTx.fee ? (parseFloat(subTx.fee) / 1e18).toFixed(4) + ' STRK' : 'N/A')} - ${subTx.operations || subTx.type}`,
                type: 'transaction',
                hash: subTx.transaction_hash,
                timestamp: subTx.timestamp,
                children: []
              });
            });
          }

          txNode.children!.push(transferNode);
        });
      }

      root.children!.push(txNode);
    });

    return root;
  };

  const renderGraph = (data: GraphNode) => {
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    // Use full available width
    const containerWidth = svgRef.current.parentElement?.clientWidth || 1200;
    const width = Math.max(containerWidth, 1200);
    const height = 800;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Add CSS for loading spinner animation
    svg.append("defs")
      .append("style")
      .text(`
        .loading-spinner {
          animation: spin 1s linear infinite;
          transform-origin: center;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create the tree layout
    const treeLayout = d3.tree<GraphNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    // Create hierarchy
    const root = d3.hierarchy(data);
    
    // Generate the tree
    treeLayout(root);

    // Add links
    const links = g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", d => {
        const targetDirection = d.target.data.direction;
        if (targetDirection === 'outgoing') return "#ef4444";
        if (targetDirection === 'incoming') return "#22c55e";
        return "#6b7280";
      })
      .attr("stroke-width", 2)
      .attr("opacity", 0.7)
      .attr("d", d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x));

    // Add nodes
    const nodes = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Add circles for nodes
    nodes.append("circle")
      .attr("r", d => {
        if (d.data.type === 'wallet' && d.depth === 0) return 12; // Center wallet
        if (d.data.type === 'transaction') return 6; // Transaction nodes
        if (d.data.type === 'address') return 7; // Address nodes
        if (d.data.type === 'token-transfer') return 4; // Token transfer nodes
        return 5; // Default
      })
      .attr("fill", d => {
        if (d.data.type === 'wallet' && d.depth === 0) return "#3b82f6"; // Center wallet - blue
        if (d.data.type === 'transaction') {
          return d.data.direction === 'outgoing' ? "#ef4444" : "#22c55e"; // Transactions - red/green
        }
        if (d.data.type === 'address') {
          return (d.data.isExpanded || false) ? "#f59e0b" : "#8b5cf6"; // Addresses - amber/purple
        }
        if (d.data.type === 'token-transfer') {
          return "#10b981"; // Token transfers - emerald
        }
        return "#8b5cf6"; // Default - purple
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", d => (d.data.isExpandable || false) ? "pointer" : "default");

    // Add expand/collapse indicators for expandable nodes
    nodes.filter(d => d.data.isExpandable || false)
      .append("text")
      .attr("dy", "0.31em")
      .attr("text-anchor", "middle")
      .text(d => {
        const isExpanding = (d.data.type === 'transaction' && expandingTransactions.has(d.data.hash || '')) ||
                           (d.data.type === 'address' && expandingAddresses.has(d.data.address || ''));
        if (isExpanding) return "⟳";
        return (d.data.isExpanded || false) ? "−" : "+";
      })
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("pointer-events", "none")
      .classed("loading-spinner", d => {
        const isExpanding = (d.data.type === 'transaction' && expandingTransactions.has(d.data.hash || '')) ||
                           (d.data.type === 'address' && expandingAddresses.has(d.data.address || ''));
        return isExpanding;
      });

    // Add labels
    nodes.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => {
        if (d.data.isExpandable) return (d.data.isExpanded || false) ? -20 : -20;
        return (d.children && d.children.length > 0) ? -15 : 15;
      })
      .attr("text-anchor", d => {
        if (d.data.isExpandable) return "end";
        return (d.children && d.children.length > 0) ? "end" : "start";
      })
      .text(d => d.data.name)
      .style("font-size", d => {
        if (d.data.type === 'wallet' && d.depth === 0) return "14px";
        return "10px";
      })
      .style("font-weight", d => d.data.type === 'wallet' && d.depth === 0 ? "bold" : "normal")
      .style("font-family", "monospace");

    // Add fee labels for transactions
    nodes.filter(d => d.data.type === 'transaction' && Boolean(d.data.amount))
      .append("text")
      .attr("dy", "1.8em")
      .attr("x", d => (d.children && d.children.length > 0) ? -15 : 15)
      .attr("text-anchor", d => (d.children && d.children.length > 0) ? "end" : "start")
      .text(d => `Fee: ${d.data.amount}`)
      .style("font-size", "8px")
      .style("fill", "#666")
      .style("font-family", "monospace");

    // Add interactivity
    nodes
      .style("cursor", d => d.data.hash || d.data.isExpandable || d.data.tokenTransfer ? "pointer" : "default")
      .on("click", (event, d) => {
        if (d.data.type === 'transaction' && d.data.isExpandable) {
          handleTransactionExpansion(d.data.hash!);
        } else if (d.data.isExpandable && d.data.address) {
          handleAddressExpansion(d.data.address);
        } else if (d.data.type === 'token-transfer' && d.data.tokenTransfer) {
          showTokenTransferDetails(d.data.tokenTransfer);
        } else if (d.data.hash) {
          const tx = transactions.find(tx => tx.transaction_hash === d.data.hash);
          if (tx) {
            setSelectedTransaction(tx);
            setIsModalOpen(true);
          }
        }
      });

    // Add zoom controls
    const zoomControls = svg.append("g")
      .attr("class", "zoom-controls")
      .attr("transform", `translate(${width - 100}, 20)`);

    // Zoom in button
    zoomControls.append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#f3f4f6")
      .attr("stroke", "#d1d5db")
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(300).call(
          zoom.scaleBy, 1.5
        );
      });

    zoomControls.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("+")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("pointer-events", "none");

    // Zoom out button
    zoomControls.append("rect")
      .attr("y", 35)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#f3f4f6")
      .attr("stroke", "#d1d5db")
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(300).call(
          zoom.scaleBy, 0.67
        );
      });

    zoomControls.append("text")
      .attr("x", 15)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .text("−")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("pointer-events", "none");

    // Reset zoom button
    zoomControls.append("rect")
      .attr("y", 70)
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#f3f4f6")
      .attr("stroke", "#d1d5db")
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(500).call(
          zoom.transform,
          d3.zoomIdentity
        );
      });

    zoomControls.append("text")
      .attr("x", 15)
      .attr("y", 90)
      .attr("text-anchor", "middle")
      .text("⌂")
      .style("font-size", "12px")
      .style("pointer-events", "none");
  };

  useEffect(() => {
    if (walletAddress) {
      setCurrentPage(1);
      fetchTransactions(walletAddress, 1);
    }
  }, [walletAddress]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && !isLoadingPage) {
      setIsLoadingPage(true);
      fetchTransactions(walletAddress, newPage);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      const graphData = createGraphData(transactions);
      renderGraph(graphData);
    }
  }, [transactions, isSearchCollapsed, expandedAddresses, addressTransactions, expandedTransactions, transactionDetails, expandingTransactions, expandingAddresses]);

  // Trigger re-render when search collapses to adjust width
  useEffect(() => {
    if (transactions.length > 0) {
      setTimeout(() => {
        const graphData = createGraphData(transactions);
        renderGraph(graphData);
      }, 100);
    }
  }, [isSearchCollapsed]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Interactive Transaction Graph
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Found {transactions.length} transactions (Page {currentPage} of {totalPages})
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoadingPage}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 flex items-center space-x-1"
                >
                  {isLoadingPage && currentPage > 1 ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Previous</span>
                  )}
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoadingPage}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 flex items-center space-x-1"
                >
                  {isLoadingPage && currentPage < totalPages ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Using Demo Data
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{error}</p>
                  <p className="mt-1">Showing sample transaction data for demonstration.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full overflow-hidden relative">
          {isLoading ? (
            <div className="border rounded w-full h-96 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">Loading transactions...</p>
                <p className="text-gray-500 text-sm mt-2">Fetching data from Starknet</p>
              </div>
            </div>
          ) : (
            <>
              <svg ref={svgRef} className="border rounded w-full"></svg>
              <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
                Use mouse wheel to zoom • Click and drag to pan
              </div>
            </>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <div className="flex items-center space-x-4 flex-wrap">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Center Address</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Incoming</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>Outgoing</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <span>Connected Address</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <span>Expanded Address</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              <span>Token Transfer</span>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p>Click on transaction nodes (+ symbol) to expand token transfers • Click on address nodes (+ symbol) to expand their transactions</p>
            <p>Click on token transfer nodes to view details • Use zoom controls or mouse wheel to zoom • Click and drag to pan around the graph</p>
          </div>
        </div>
      </div>

      <TransactionModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      <TokenTransferModal
        tokenTransfer={selectedTokenTransfer}
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </>
  );
} 