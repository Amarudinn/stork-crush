import { AnimatePresence } from 'framer-motion';
import { useMatch3Logic } from './hooks/useMatch3Logic';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import GameOverModal from './components/GameOverModal';
import styles from './App.module.css';

function App() {
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
  } = useMatch3Logic();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <img src="/images/6.png" alt="crystal" className={`${styles.titleIcon} ${styles.titleIconLeft}`} />
          <h1 className={styles.title}>Stork Crush</h1>
          <img src="/images/6.png" alt="crystal" className={`${styles.titleIcon} ${styles.titleIconRight}`} />
        </div>
        <p className={styles.subtitle}>Match 3 or more crystals to score!</p>
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
            onRestart={resetGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
