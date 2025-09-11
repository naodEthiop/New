import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, Trophy, Zap, Volume2, VolumeX, Settings, Crown, Star } from 'lucide-react';
import { GameService } from '../services/firebaseService';
import { VoiceService } from '../services/voiceService';
import { websocketService } from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';
import EnhancedBingoCard from './EnhancedBingoCard';
import GameChat from './GameChat';
import ChapaPaymentModal from './ChapaPaymentModal';
import { GameRoom, Player, ChatMessage, BingoCard as BingoCardType } from '../types/game';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

const EnhancedGameRoom: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userBingoCard, setUserBingoCard] = useState<BingoCardType | null>(null);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !gameId) return;
    loadGame();
    connectWebSocket();
  }, [user, gameId]);

  const connectWebSocket = async () => {
    try {
      await websocketService.connect(gameId);
      websocketService.on('chat_message', handleChatMessage);
      websocketService.on('game_update', handleGameUpdate);
      websocketService.joinGame(gameId!);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      toast.error('Failed to connect to game server');
    }
  };

  const loadGame = async () => {
    if (!gameId) return;
    try {
      setIsLoading(true);
      const gameData = await GameService.getGame(gameId);
      if (!gameData) {
        setError('Game not found');
        return;
      }
      
      setGame(gameData);
      setCalledNumbers(gameData.calledNumbers || []);
      setIsGameStarted(gameData.status === 'playing');
      
      if (user && gameData.players.some(p => p.id === user.uid)) {
        const card = generateBingoCard();
        setUserBingoCard(card);
      }
      
      const unsubscribe = GameService.onGameUpdate(gameId, (updatedGame) => {
        setGame(updatedGame);
        setCalledNumbers(updatedGame.calledNumbers || []);
        setIsGameStarted(updatedGame.status === 'playing');
      });
      
      return unsubscribe;
    } catch {
      setError('Failed to load game');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBingoCard = (): BingoCardType => {
    return {
      id: `card_${user?.uid}_${Date.now()}`,
      playerId: user?.uid || '',
      B: generateColumn(1, 15),
      I: generateColumn(16, 30),
      N: generateColumn(31, 45),
      G: generateColumn(46, 60),
      O: generateColumn(61, 75),
      powerUps: [],
      patterns: []
    };
  };

  const generateColumn = (min: number, max: number) => {
    const numbers: any[] = [];
    const availableNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const number = availableNumbers.splice(randomIndex, 1)[0];
      numbers.push({
        number,
        marked: false,
        called: false
      });
    }
    
    return numbers;
  };

  const handleChatMessage = (data: any) => {
    if (data.gameId === gameId) {
      setChatMessages(prev => [...prev, data]);
    }
  };

  const handleGameUpdate = (data: any) => {
    if (data.gameId === gameId) {
      toast.info(`Game update: ${data.updateType}`);
    }
  };

  const handleMarkSquare = (column: any, index: number) => {
    if (!userBingoCard || !isGameStarted) return;
    
    const updatedCard = { ...userBingoCard };
    updatedCard[column][index].marked = !updatedCard[column][index].marked;
    setUserBingoCard(updatedCard);
  };

  const handleUsePowerUp = (powerUpId: string) => {
    websocketService.usePowerUp(gameId!, powerUpId);
    toast.success('Power-up used!');
  };

  const handleSendMessage = (message: string) => {
    websocketService.sendChatMessage({
      message,
      gameId: gameId!,
      type: 'text'
    });
  };

  const handlePaymentSuccess = (data: any) => {
    toast.success('Payment successful!');
    setShowPaymentModal(false);
    loadGame();
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="aurora-layer"></div>
        <div className="glow-orb left-[-60px] top-[120px]"></div>
        <div className="glow-orb right-[-80px] bottom-[160px]"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-indigo-400 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading game…</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="aurora-layer"></div>
        <div className="glow-orb left-[-60px] top-[120px]"></div>
        <div className="glow-orb right-[-80px] bottom-[160px]"></div>
        <div className="relative z-10 text-center">
          <p className="text-red-400 text-lg mb-4">{error || 'Game not found'}</p>
          <Button onClick={() => navigate('/games')} variant="cyber">Back to Games</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4">
      <div className="aurora-layer"></div>
      <div className="glow-orb left-[-60px] top-[120px]"></div>
      <div className="glow-orb right-[-80px] bottom-[160px]"></div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="panel-cyber rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">{game.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                game.status === 'playing' ? 'bg-green-500 text-white' :
                game.status === 'waiting' ? 'bg-yellow-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {(() => { const s = game.status ?? 'waiting'; return s.slice(0,1).toUpperCase() + s.slice(1); })()}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {voiceEnabled ? (
                  <Volume2 className="w-5 h-5 text-white" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white" />
                )}
              </button>
              
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-white">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{game.players.length}/{game.maxPlayers} Players</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span>{game.prizePool} ETB Prize Pool</span>
              </div>
            </div>
            
            {game.entryFee > 0 && (
              <Button onClick={() => setShowPaymentModal(true)} variant="cyber" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Join Game ({game.entryFee} ETB)
              </Button>
            )}
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players List */}
          <div className="lg:col-span-1">
            <div className="panel-cyber rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Players</h2>
              <div className="space-y-3">
                {game.players.map((player, index) => (
                  <motion.div
                    key={player.id ?? (player as any).playerId ?? `${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      player.id === user.uid ? 'bg-blue-500/20 border border-blue-400' :
                      player.id === game.hostId ? 'bg-yellow-500/20 border border-yellow-400' :
                      'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {(player.name?.[0] || player.displayName?.[0] || player.email?.[0] || 'P').toUpperCase()}
                      </div>
                      {player.id === game.hostId && (
                        <Crown className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{player.name || player.displayName || player.email || 'Player'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.isOnline && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                      {player.id === user.uid && (
                        <span className="text-blue-400 text-sm">You</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bingo Card */}
          <div className="lg:col-span-1">
            {userBingoCard ? (
              <EnhancedBingoCard
                card={userBingoCard}
                calledNumbers={calledNumbers}
                onMarkSquare={handleMarkSquare}
                onUsePowerUp={handleUsePowerUp}
                disabled={!isGameStarted}
                gameMode="classic"
                showPowerUps={true}
                autoMark={false}
              />
            ) : (
              <div className="panel-cyber rounded-lg p-8 text-center">
                <p className="text-white text-lg mb-4">You need to join this game to get a bingo card</p>
                {game.entryFee > 0 ? (
                  <Button onClick={() => setShowPaymentModal(true)} variant="cyber">
                    Join Game ({game.entryFee} ETB)
                  </Button>
                ) : (
                  <Button>Join Free Game</Button>
                )}
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            {showChat && (
              <GameChat
                gameId={gameId!}
                messages={chatMessages}
                isEnabled={game.chatEnabled}
                onSendMessage={handleSendMessage}
              />
            )}
          </div>
        </div>

        {/* Called Numbers */}
        {calledNumbers.length > 0 && (
          <div className="mt-6 panel-cyber rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Called Numbers</h3>
            <div className="flex flex-wrap gap-2">
              {calledNumbers.map((number, index) => (
                <motion.div
                  key={`${number}-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                    index === calledNumbers.length - 1 ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'
                  }`}
                >
                  {number}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <ChapaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        paymentType="game_entry"
        amount={game.entryFee}
        title="Join Game"
        description={`Join ${game.name} for ${game.entryFee} ETB`}
        metadata={{
          gameId: game.id,
          gameName: game.name
        }}
      />
    </div>
  );
};

export default EnhancedGameRoom;
