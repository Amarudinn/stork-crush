import { motion } from 'framer-motion';
import styles from './ScoreBoard.module.css';

const ScoreBoard = ({ score, moves, timeLeft }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={styles.card}
      >
        <div className={styles.section}>
          <div className={styles.content}>
            <span className={styles.label}>Score</span>
            <motion.div
              key={score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={styles.value}
            >
              {score.toLocaleString()}
            </motion.div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.content}>
            <span className={styles.label}>Time</span>
            <div className={`${styles.value} ${timeLeft <= 10 ? styles.valueLow : ''}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.content}>
            <span className={styles.label}>Moves</span>
            <motion.div
              key={moves}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`${styles.value} ${moves <= 5 ? styles.valueLow : ''}`}
            >
              {moves}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreBoard;
