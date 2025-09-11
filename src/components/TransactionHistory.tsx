import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TransactionService, Transaction } from '../services/firebaseService';
import { Button } from './ui/Button';

const TransactionHistory: React.FC = () => {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    loadTransactions(user.uid);
    // eslint-disable-next-line
  }, [user]);

  const loadTransactions = async (userId: string) => {
    try {
      setIsLoading(true);
      const userTransactions = await TransactionService.getUserTransactions(userId);
      setTransactions(userTransactions);
    } catch {
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'N/A';
    type ToDateObj = { toDate: () => Date };
    let date: Date;
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as ToDateObj).toDate === 'function') {
      date = (timestamp as ToDateObj).toDate();
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'game_entry': return '🎮';
      case 'game_win': return '🏆';
      case 'bonus': return '🎁';
      default: return '📊';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'game_win':
      case 'bonus':
        return 'text-green-400';
      case 'withdrawal':
      case 'game_entry':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel-cyber p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-4">{authError || error}</p>
          <button onClick={() => navigate('/wallet')} className="btn-modern">
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel-cyber p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">User Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-modern">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate('/wallet')}
        className="back-button"
        aria-label="Go back"
      >
        ←
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="gaming-font text-4xl mb-4 gradient-text">Transaction History</h1>
          <p className="text-slate-300">View all your financial activities</p>
        </div>

        <div className="panel-cyber p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No transactions yet</p>
              <button
                onClick={() => navigate('/wallet')}
                className="btn-modern"
              >
                Go to Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 card-cyber">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
                    <div>
                      <div className="font-semibold text-white">{transaction.description}</div>
                      <div className="text-sm text-slate-400">
                        {transaction.type} • {formatDate(transaction.createdAt)}
                      </div>
                      {transaction.paymentMethod && (
                        <div className="text-xs text-slate-500">
                          Method: {transaction.paymentMethod}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={() => user && loadTransactions(user.uid)}
            variant="cyber"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
