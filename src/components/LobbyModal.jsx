import { motion } from 'framer-motion';
import { Play, X, Copy } from 'lucide-react';
import HostSettings from './HostSettings';
import styles from './LobbyModal.module.css';
import { showSuccess } from '../utils/sweetAlert';

const LobbyModal = ({ 
  players, 
  isHost, 
  roomId,
  settings,
  onStartGame, 
  onLeave,
  onSettingsChange
}) => {
  const playerCount = Object.keys(players).length;

  const copyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      showSuccess('Link copied to clipboard!');
    });
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
        <h2 className={styles.title}>
          Game Lobby
          <span className={styles.playerCount}>({playerCount})</span>
        </h2>

        <div className={styles.shareSection}>
          <p className={styles.shareLabel}>Share this link with friends:</p>
          <div className={styles.shareLink} onClick={copyLink}>
            {`${window.location.origin}${window.location.pathname}?room=${roomId}`}
          </div>
        </div>

        <ul className={styles.playerList}>
          {Object.entries(players).map(([id, player]) => (
            <li key={id} className={styles.playerItem}>
              <span className={styles.playerName}>{player.name}</span>
              {player.isHost && <span className={styles.hostBadge}>HOST</span>}
            </li>
          ))}
        </ul>

        {!isHost && (
          <p className={styles.waitingText}>Waiting for host to start the game...</p>
        )}

        <div className={styles.buttons}>
          {isHost && (
            <>
              <HostSettings 
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartGame}
                disabled={playerCount < 2}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                <Play className={styles.buttonIcon} />
                Start Game {playerCount < 2 && '(Need 2+ players)'}
              </motion.button>
            </>
          )}

          <button
            onClick={onLeave}
            className={`${styles.button} ${styles.buttonGhost}`}
          >
            <X className={styles.buttonIcon} />
            Leave Lobby
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LobbyModal;
