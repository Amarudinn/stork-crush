import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Share2 } from 'lucide-react';
import styles from './GameOverModal.module.css';

const GameOverModal = ({ score, highScore, onRestart }) => {
  const isNewHighScore = score === highScore && score > 0;

  const shareToTwitter = () => {
    const text = `I just scored ${score} in Stork Crush Match-3! Can you beat me? #IndieGame #ReactJS #Match3Game`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.overlay}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={styles.modal}
      >
        <div className={styles.content}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={styles.iconWrapper}
          >
            <Trophy className={styles.trophy} />
          </motion.div>

          <h2 className={styles.title}>Game Over!</h2>
          
          {isNewHighScore && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={styles.newHighScore}
            >
              🎉 New High Score! 🎉
            </motion.p>
          )}

          <div className={styles.scoreCard}>
            <p className={styles.scoreLabel}>Final Score</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className={styles.finalScore}
            >
              {score}
            </motion.p>
            <p className={styles.highScoreText}>High Score: {highScore}</p>
          </div>

          <div className={styles.buttons}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              <RotateCcw className={styles.buttonIcon} />
              Play Again
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareToTwitter}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              <Share2 className={styles.buttonIcon} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameOverModal;
