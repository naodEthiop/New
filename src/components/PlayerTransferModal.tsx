import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/Dialog';
import { UserService } from '../services/firebaseService';

interface PlayerTransferModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
  currentUserId: string;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  balance: number;
}

const PlayerTransferModal: React.FC<PlayerTransferModalProps> = ({
  onClose,
  onSuccess,
  currentBalance,
  currentUserId
}) => {
  const [amount, setAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      const users = await UserService.searchUsers(searchTerm);
      // Filter out current user and users with no display name
      const filteredUsers = users.filter(user => 
        user.id !== currentUserId && 
        user.displayName && 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleTransfer = async () => {
    if (!selectedRecipient) {
      setError('Please select a recipient');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (transferAmount > currentBalance) {
      setError('Insufficient balance');
      return;
    }

    if (transferAmount < 1) {
      setError('Minimum transfer amount is ETB 1');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      await UserService.transferFunds(selectedRecipient.id, transferAmount);
      
      onSuccess();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectRecipient = (user: UserProfile) => {
    setSelectedRecipient(user);
    setSearchTerm(user.displayName);
    setSearchResults([]);
  };

  const formatBalance = (balance: number) => {
    return `ETB ${balance.toFixed(2)}`;
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogClose asChild>
            <button aria-label="Close" className="text-slate-400 hover:text-white transition-colors">✕</button>
          </DialogClose>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Current Balance */}
        <div className="card-cyber p-4 mb-6">
          <div className="text-sm text-slate-400 mb-1">Available Balance</div>
          <div className="text-2xl font-bold text-green-400">
            {formatBalance(currentBalance)}
          </div>
        </div>

        {/* Recipient Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Recipient
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="input-modern"
            />
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 panel-cyber mt-1 max-h-48 overflow-y-auto z-10">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectRecipient(user)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-600 last:border-b-0"
                  >
                    <div className="text-white font-medium">{user.displayName}</div>
                    <div className="text-sm text-slate-400">{user.email}</div>
                    <div className="text-xs text-slate-500">
                      Balance: {formatBalance(user.balance)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Recipient */}
        {selectedRecipient && (
          <div className="card-cyber p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{selectedRecipient.displayName}</div>
                <div className="text-sm text-slate-400">{selectedRecipient.email}</div>
              </div>
              <button
                onClick={() => {
                  setSelectedRecipient(null);
                  setSearchTerm('');
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Transfer Amount (ETB)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="1"
            max={currentBalance}
            step="0.01"
            className="input-modern"
          />
          <div className="text-xs text-slate-400 mt-1">
            Min: ETB 1.00 | Max: {formatBalance(currentBalance)}
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[10, 50, 100, 200, 500, 1000].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              disabled={quickAmount > currentBalance}
              className="pill disabled:opacity-60"
            >
              ETB {quickAmount}
            </button>
          ))}
        </div>

        {/* Transfer Summary */}
        {selectedRecipient && amount && parseFloat(amount) > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-white mb-2">Transfer Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="text-white">{selectedRecipient.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-green-400">ETB {parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New Balance:</span>
                <span className="text-white">
                  ETB {(currentBalance - parseFloat(amount)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <DialogClose asChild>
            <button className="flex-1 btn-secondary">Cancel</button>
          </DialogClose>
          <button
            onClick={handleTransfer}
            disabled={!selectedRecipient || !amount || parseFloat(amount) <= 0 || isLoading}
            className="flex-1 btn-modern disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerTransferModal;
