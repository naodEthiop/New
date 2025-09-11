import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserService, GameService, TransactionService, SupportService, AdminService, UserProfile, Game, Transaction, SupportTicket } from '../services/firebaseService';

const AdminPage: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const p = await UserService.getUserProfile();
        setProfile(p);
        if (p?.isAdmin) {
          await loadAdminData();
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
    // eslint-disable-next-line
  }, [user]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [usersData, gamesData, transactionsData, ticketsData] = await Promise.all([
        UserService.getAllUsers(),
        GameService.getGames(),
        TransactionService.getAllTransactions(),
        SupportService.getAllTickets()
      ]);
      setUsers(usersData);
      setGames(gamesData);
      setTransactions(transactionsData);
      setSupportTickets(ticketsData);
    } catch {
      // Optionally, you could set a local error state here if you want to display a more specific error
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'N/A';
    let date: Date;
    type ToDateObj = { toDate: () => Date };
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as ToDateObj).toDate === 'function') {
      date = (timestamp as ToDateObj).toDate();
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'resolved':
        return 'text-green-400';
      case 'waiting':
      case 'pending':
      case 'open':
        return 'text-yellow-400';
      case 'cancelled':
      case 'failed':
      case 'closed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-4">{authError}</p>
          <button onClick={() => navigate('/')} className="btn-modern">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (user && profile && !profile.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Access Denied</h2>
          <p className="text-slate-300 mb-6">Admin privileges required</p>
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
          <h1 className="gaming-font text-4xl mb-4 gradient-text">Admin Panel</h1>
          <p className="text-slate-300">Manage users, games, and support tickets</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="modern-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{users.length}</div>
            <div className="text-sm text-slate-400">Total Users</div>
          </div>
          <div className="modern-card p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{games.length}</div>
            <div className="text-sm text-slate-400">Total Games</div>
          </div>
          <div className="modern-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{transactions.length}</div>
            <div className="text-sm text-slate-400">Transactions</div>
          </div>
          <div className="modern-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{supportTickets.length}</div>
            <div className="text-sm text-slate-400">Support Tickets</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="modern-card p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {['dashboard', 'users', 'games', 'transactions', 'support'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-modern ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
                aria-label={`Show ${tab} tab`}
                title={`Show ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="modern-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                <div className="flex gap-2">
                  <button
                    onClick={async () => { try { await AdminService.updateLeaderboard('global'); alert('Leaderboard refreshed'); } catch (e) { alert('Failed to refresh leaderboard'); } }}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm shadow hover:opacity-90"
                  >
                    Refresh Leaderboard
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">New Users Today</p>
                    <p className="text-slate-400 text-sm">
                      {users.filter(user => {
                        let userDate: Date;
                        if (user.createdAt && typeof user.createdAt.toDate === 'function') {
                          userDate = user.createdAt.toDate();
                        } else if (typeof user.createdAt === 'string' || typeof user.createdAt === 'number') {
                          userDate = new Date(user.createdAt);
                        } else {
                          userDate = new Date();
                        }
                        const today = new Date();
                        return userDate.toDateString() === today.toDateString();
                      }).length} users registered
                    </p>
                  </div>
                  <div className="text-green-400 font-bold">
                    +{users.filter(user => {
                      let userDate: Date;
                      if (user.createdAt && typeof user.createdAt.toDate === 'function') {
                        userDate = user.createdAt.toDate();
                      } else if (typeof user.createdAt === 'string' || typeof user.createdAt === 'number') {
                        userDate = new Date(user.createdAt);
                      } else {
                        userDate = new Date();
                      }
                      const today = new Date();
                      return userDate.toDateString() === today.toDateString();
                    }).length}
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Active Games</p>
                    <p className="text-slate-400 text-sm">
                      {games.filter(game => game.status === 'active').length} games running
                    </p>
                  </div>
                  <div className="text-blue-400 font-bold">
                    {games.filter(game => game.status === 'active').length}
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Open Support Tickets</p>
                    <p className="text-slate-400 text-sm">
                      {supportTickets.filter(ticket => ticket.status === 'open').length} open tickets
                    </p>
                  </div>
                  <div className="text-yellow-400 font-bold">
                    {supportTickets.filter(ticket => ticket.status === 'open').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="modern-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Users</h3>
            {users.length === 0 ? (
              <div className="text-center text-slate-400">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-300">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Admin</th>
                      <th className="px-4 py-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-white">{user.displayName || user.email}</td>
                        <td className="px-4 py-2 text-slate-300">{user.email}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>{user.isAdmin ? 'Yes' : 'No'}</span>
                        </td>
                        <td className="px-4 py-2 text-slate-400">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="modern-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Games</h3>
            {games.length === 0 ? (
              <div className="text-center text-slate-400">No games found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-300">
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Players</th>
                      <th className="px-4 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => (
                      <tr key={game.id} className="border-b border-slate-700 hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-white">{game.title}</td>
                        <td className={`px-4 py-2 ${getStatusColor(game.status)}`}>{game.status}</td>
                        <td className="px-4 py-2 text-slate-300">{game.players.length}</td>
                        <td className="px-4 py-2 text-slate-400">{formatDate(game.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="modern-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-center text-slate-400">No transactions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-300">
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-700 hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-white">{tx.type}</td>
                        <td className="px-4 py-2 text-green-400">{tx.amount}</td>
                        <td className={`px-4 py-2 ${getStatusColor(tx.status)}`}>{tx.status}</td>
                        <td className="px-4 py-2 text-slate-400">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="modern-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Support Tickets</h3>
            {supportTickets.length === 0 ? (
              <div className="text-center text-slate-400">No support tickets found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-300">
                      <th className="px-4 py-2">Subject</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Priority</th>
                      <th className="px-4 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-slate-700 hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-white">{ticket.subject}</td>
                        <td className={`px-4 py-2 ${getStatusColor(ticket.status)}`}>{ticket.status}</td>
                        <td className="px-4 py-2 text-yellow-400">{ticket.priority}</td>
                        <td className="px-4 py-2 text-slate-400">{formatDate(ticket.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
