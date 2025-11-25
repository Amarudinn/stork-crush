import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useMatch3Logic } from './hooks/useMatch3Logic';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import GameOverModal from './components/GameOverModal';
import StartMenu from './components/StartMenu';
import LobbyModal from './components/LobbyModal';
import styles from './App.module.css';
import { 
  createRoom, 
  joinRoom, 
  listenToRoom, 
  updatePlayerScore, 
  markPlayerDead, 
  startGame, 
  leaveRoom,
  updateRoomSettings
} from './utils/firebaseMultiplayer';
import { showError, showInfo } from './utils/sweetAlert';

function App() {
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'solo', 'lobby', 'multiplayer'
  const [multiplayerState, setMultiplayerState] = useState({
    roomId: null,
    playerId: null,
    playerName: null,
    isHost: false,
    players: {},
    roomData: null,
    settings: {
      timeLimit: 120,
      totalMoves: 20,
      difficulty: 'medium'
    },
    gameStartTime: null
  });

  // Check for room in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
      setMultiplayerState(prev => ({ ...prev, roomId }));
    }
  }, []);

  // Always define callbacks (Rules of Hooks - must be unconditional)
  const handleScoreUpdate = useCallback((score) => {
    if (multiplayerState.roomId && multiplayerState.playerId) {
      updatePlayerScore(multiplayerState.roomId, multiplayerState.playerId, score);
    }
  }, [multiplayerState.roomId, multiplayerState.playerId]);

  const handleGameOverCallback = useCallback((score) => {
    if (multiplayerState.roomId && multiplayerState.playerId) {
      // Update final score before marking dead
      updatePlayerScore(multiplayerState.roomId, multiplayerState.playerId, score);
      markPlayerDead(multiplayerState.roomId, multiplayerState.playerId);
    }
  }, [multiplayerState.roomId, multiplayerState.playerId]);

  // Only pass config in multiplayer mode
  const multiplayerConfig = gameMode === 'multiplayer' ? {
    onScoreUpdate: handleScoreUpdate,
    onGameOver: handleGameOverCallback,
    settings: multiplayerState.settings,
    gameStartTime: multiplayerState.gameStartTime
  } : null;



  const {
    grid,
    score,
    moves,
    timeLeft,
    selectedCell,
    gameOver,
    highScore,
    floatingTexts,
    shake,
    explodingCells,
    fallingCells,
    handleCellClick,
    resetGame,
  } = useMatch3Logic(multiplayerConfig);

  // Listen to room updates (keep listening even after game over for leaderboard)
  useEffect(() => {
    if (multiplayerState.roomId && (gameMode === 'lobby' || gameMode === 'multiplayer' || (gameMode === 'solo' && multiplayerState.roomId))) {
      const unsubscribe = listenToRoom(multiplayerState.roomId, (data) => {
        if (!data) {
          // Room deleted
          showInfo('Room closed by host').then(() => {
            handleBackToMenu();
          });
          return;
        }

        setMultiplayerState(prev => ({
          ...prev,
          players: data.players || {},
          roomData: data,
          settings: data.settings || prev.settings,
          gameStartTime: data.gameStartTime || null
        }));

        // Start game if status changed to playing
        if (data.status === 'playing' && gameMode === 'lobby') {
          setGameMode('multiplayer');
        }
      });

      return unsubscribe;
    }
  }, [multiplayerState.roomId, gameMode]);

  const handleStartSolo = () => {
    setGameMode('solo');
    resetGame();
  };

  const handleStartMulti = async (playerName) => {
    try {
      let roomData;
      
      if (multiplayerState.roomId) {
        // Join existing room
        roomData = await joinRoom(multiplayerState.roomId, playerName);
      } else {
        // Create new room
        roomData = await createRoom(playerName);
        
        // Update URL with room ID
        const newUrl = `${window.location.pathname}?room=${roomData.roomId}`;
        window.history.pushState({}, '', newUrl);
      }

      setMultiplayerState(prev => ({
        ...prev,
        ...roomData,
        playerName
      }));
      
      setGameMode('lobby');
    } catch (error) {
      showError(error.message);
    }
  };

  const handleStartGameFromLobby = async () => {
    if (multiplayerState.isHost && multiplayerState.roomId) {
      await startGame(multiplayerState.roomId);
    }
  };

  const handleSettingsChange = async (newSettings) => {
    if (multiplayerState.isHost && multiplayerState.roomId) {
      await updateRoomSettings(multiplayerState.roomId, newSettings);
      setMultiplayerState(prev => ({
        ...prev,
        settings: newSettings
      }));
    }
  };

  const handleLeaveLobby = async () => {
    if (multiplayerState.roomId && multiplayerState.playerId) {
      await leaveRoom(
        multiplayerState.roomId, 
        multiplayerState.playerId, 
        multiplayerState.isHost
      );
    }
    handleBackToMenu();
  };

  const handleBackToMenu = () => {
    // Clear URL params
    window.history.pushState({}, '', window.location.pathname);
    
    setGameMode('menu');
    setMultiplayerState({
      roomId: null,
      playerId: null,
      playerName: null,
      isHost: false,
      players: {},
      roomData: null
    });
    resetGame();
  };

  const handleGameOverRestart = () => {
    if (gameMode === 'multiplayer') {
      handleBackToMenu();
    } else {
      resetGame();
    }
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {gameMode === 'menu' && (
          <StartMenu
            onStartSolo={handleStartSolo}
            onStartMulti={handleStartMulti}
            hasRoomId={!!multiplayerState.roomId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameMode === 'lobby' && (
          <LobbyModal
            players={multiplayerState.players}
            isHost={multiplayerState.isHost}
            roomId={multiplayerState.roomId}
            settings={multiplayerState.settings}
            onStartGame={handleStartGameFromLobby}
            onLeave={handleLeaveLobby}
            onSettingsChange={handleSettingsChange}
          />
        )}
      </AnimatePresence>

      {(gameMode === 'solo' || gameMode === 'multiplayer') && (
        <>
          <div className={styles.header}>
            <div className={styles.titleWrapper}>
              <img src="/images/6.png" alt="crystal" className={`${styles.titleIcon} ${styles.titleIconLeft}`} />
              <h1 className={styles.title}>Stork Crush</h1>
              <img src="/images/6.png" alt="crystal" className={`${styles.titleIcon} ${styles.titleIconRight}`} />
            </div>
            <p className={styles.subtitle}>Match 3 or more to score!</p>
          </div>

          <ScoreBoard score={score} moves={moves} timeLeft={timeLeft} />

          <div className={styles.boardWrapper}>
            <GameBoard
              grid={grid}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
              floatingTexts={floatingTexts}
              shake={shake}
              explodingCells={explodingCells}
              fallingCells={fallingCells}
            />
          </div>

          <div className={styles.instructions}>
            <p className={styles.instructionsTitle}>💎 Match 4+ for special items!</p>
            <div className={styles.specialsList}>
              <span className={styles.specialItem}>
                <img src="/images/special/1.png" alt="Line Breaker" className={styles.specialIcon} />
                Line Breaker
              </span>
              <span className={styles.specialItem}>
                <img src="/images/special/2.png" alt="Double Bomber" className={styles.specialIcon} />
                Double Bomber
              </span>
              <span className={styles.specialItem}>
                <img src="/images/special/3.png" alt="Laser Shot" className={styles.specialIcon} />
                Laser Shot
              </span>
              <span className={styles.specialItem}>
                <img src="/images/special/4.png" alt="Chaos Orb" className={styles.specialIcon} />
                Chaos Orb
              </span>
            </div>
          </div>

          <AnimatePresence>
            {gameOver && (
              <GameOverModal
                score={score}
                highScore={highScore}
                onRestart={handleGameOverRestart}
                isMultiplayer={gameMode === 'multiplayer'}
                multiplayerData={gameMode === 'multiplayer' ? multiplayerState : null}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default App;
