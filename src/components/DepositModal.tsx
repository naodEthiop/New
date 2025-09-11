import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/Dialog';
import { useAuth } from '../contexts/AuthContext';

interface DepositModalProps {
  onClose: () => void;
  userId: string;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, userId }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      setError('Please enter a valid amount (minimum ETB 10)');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const token = await user?.getIdToken();
      const response = await fetch(`${backendUrl}/api/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: numAmount,
          email: user?.email || `${userId}@example.com`,
          first_name: user?.displayName || 'Player',
          last_name: 'Player',
          phone: user?.phoneNumber || '0911000000'
        }),
      });
      const result = await response.json();
      const checkoutUrl = result.checkout_url || result?.data?.checkout_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError(result.error || result.message || 'Payment initialization failed');
      }
    } catch (err) {
      setError('Failed to create deposit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="panel-cyber">
        <DialogHeader>
          <div>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>Instantly top up your wallet</DialogDescription>
          </div>
          <DialogClose asChild>
            <button aria-label="Close" className="text-slate-400 hover:text-white transition-colors">✕</button>
          </DialogClose>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 font-medium mb-3">Amount (ETB)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              min="1"
              step="0.01"
              required
              className="input-modern"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-3">Quick Amounts</label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  onClick={() => setAmount(presetAmount.toString())}
                  className="pill"
                >
                  ETB {presetAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <DialogClose asChild>
              <button type="button" className="flex-1 btn-secondary">
                Cancel
              </button>
            </DialogClose>
            <button type="submit" className="flex-1 btn-modern" disabled={isLoading || !amount}>
              {isLoading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
