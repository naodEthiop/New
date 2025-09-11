import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SupportService, SupportTicket } from '../services/firebaseService';

const SupportPanel: React.FC = () => {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    loadTickets(user.uid);
    // eslint-disable-next-line
  }, [user]);

  const loadTickets = async (userId: string) => {
    try {
      setIsLoading(true);
      const userTickets = await SupportService.getUserTickets(userId);
      setTickets(userTickets);
    } catch {
      setError('Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const priority = formData.get('priority') as 'low' | 'medium' | 'high';
    try {
      await SupportService.createTicket({
        userId: user.uid,
        subject,
        message,
        priority,
        status: 'open'
      });
      await loadTickets(user.uid);
      setShowCreateTicket(false);
      setError('');
    } catch {
      setError('Failed to create support ticket');
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

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'text-yellow-400';
      case 'in_progress': return 'text-blue-400';
      case 'resolved': return 'text-green-400';
      case 'closed': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-4">{authError || error}</p>
          <button onClick={() => navigate('/')} className="btn-modern">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">User Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-modern">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="back-button"
        aria-label="Go back"
      >
        ←
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="gaming-font text-4xl mb-4 gradient-text">Support Center</h1>
          <p className="text-slate-300">Get help with your account and games</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Quick Help Section */}
        <div className="modern-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">🎯 Quick Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 transform hover:scale-105 transition-transform duration-200">
              <h3 className="font-semibold text-white mb-2">🎮 How to Play</h3>
              <p className="text-slate-300 text-sm">
                Join a game, wait for it to start, and mark numbers on your card as they're called.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 transform hover:scale-105 transition-transform duration-200">
              <h3 className="font-semibold text-white mb-2">💰 Deposits & Withdrawals</h3>
              <p className="text-slate-300 text-sm">
                Use the wallet page to deposit funds or request withdrawals to your bank account.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 transform hover:scale-105 transition-transform duration-200">
              <h3 className="font-semibold text-white mb-2">🏆 Winning</h3>
              <p className="text-slate-300 text-sm">
                Complete a line, column, or diagonal on your bingo card to win the prize pool.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 transform hover:scale-105 transition-transform duration-200">
              <h3 className="font-semibold text-white mb-2">📱 Mobile App</h3>
              <p className="text-slate-300 text-sm">
                Access the game through Telegram Mini App for the best mobile experience.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="modern-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">📞 Contact Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg transform hover:scale-105 transition-transform duration-200">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-semibold text-white mb-2">Email Support</h3>
              <p className="text-slate-300 text-sm mb-3">support@bingogame.com</p>
              <p className="text-slate-400 text-xs">Response within 24 hours</p>
              <button className="btn-modern text-xs mt-2 w-full">Send Email</button>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg transform hover:scale-105 transition-transform duration-200">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-slate-300 text-sm mb-3">Available 24/7</p>
              <p className="text-slate-400 text-xs">Instant response</p>
              <button className="btn-modern text-xs mt-2 w-full">Start Chat</button>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg transform hover:scale-105 transition-transform duration-200">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-white mb-2">Telegram</h3>
              <p className="text-slate-300 text-sm mb-3">@BingoGameSupport</p>
              <p className="text-slate-400 text-xs">Direct messaging</p>
              <button className="btn-modern text-xs mt-2 w-full">Message Us</button>
            </div>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="modern-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">🎫 My Support Tickets</h2>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="btn-modern"
            >
              ✨ Create Ticket
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-slate-400 mb-4">No support tickets yet</p>
              <button
                onClick={() => setShowCreateTicket(true)}
                className="btn-modern"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-slate-800/50 rounded-lg p-4 transform hover:scale-102 transition-transform duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{ticket.subject}</h3>
                      <p className="text-slate-300 text-sm mt-1">{ticket.message}</p>
                      <p className="text-slate-400 text-xs mt-2">
                        Created: {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                      <div className={`text-xs mt-1 ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority} priority
                      </div>
                    </div>
                  </div>
                  {ticket.adminResponse && (
                    <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        <strong>Admin Response:</strong> {ticket.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full relative">
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
                onClick={() => setShowCreateTicket(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-xl font-semibold text-white mb-4">Create Support Ticket</h3>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="modern-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    required
                    className="modern-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">Priority</label>
                  <select name="priority" className="modern-input w-full" defaultValue="medium">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => setShowCreateTicket(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-modern flex-1"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPanel;