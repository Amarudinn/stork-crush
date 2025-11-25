import { motion } from 'framer-motion';
import { Users, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './StartMenu.module.css';
import { showWarning } from '../utils/sweetAlert';

const StartMenu = ({ onStartSolo, onStartMulti, hasRoomId = false }) => {
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(hasRoomId);

  // Update showNameInput when hasRoomId changes
  useEffect(() => {
    if (hasRoomId) {
      setShowNameInput(true);
    }
  }, [hasRoomId]);

  const handleMultiClick = () => {
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }
    
    if (!playerName.trim()) {
      showWarning('Please enter your username!');
      return;
    }
    
    onStartMulti(playerName.trim());
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
        className={styles.panel}
      >
        <div className={styles.logoWrapper}>
          <img src="/images/6.png" alt="crystal" className={styles.logo} />
        </div>
        
        <h1 className={styles.title}>Stork Crush</h1>
        <p className={styles.subtitle}>
          {hasRoomId ? 'Join your friends!' : 'Match 3 or more to score!'}
        </p>

        {!showNameInput ? (
          <div className={styles.buttons}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartSolo}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              <Play className={styles.buttonIcon} />
              Play Solo
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMultiClick}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              <Users className={styles.buttonIcon} />
              Play with Friends
            </motion.button>
          </div>
        ) : (
          <div className={styles.nameInputWrapper}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter Your Username"
              className={styles.nameInput}
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMultiClick}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              {hasRoomId ? 'Join Lobby' : 'Continue'}
            </motion.button>
            {!hasRoomId && (
              <button
                onClick={() => setShowNameInput(false)}
                className={`${styles.button} ${styles.buttonGhost}`}
              >
                Back
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StartMenu;
