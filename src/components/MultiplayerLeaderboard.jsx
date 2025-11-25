import styles from './MultiplayerLeaderboard.module.css';

const MultiplayerLeaderboard = ({ players, currentPlayerId }) => {
  const sortedPlayers = Object.entries(players)
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => b.score - a.score);

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  return (
    <div className={styles.leaderboard}>
      <h3 className={styles.title}>Final Leaderboard</h3>
      <div className={styles.list}>
        {sortedPlayers.map((player, index) => {
          const medal = getMedal(index);
          const isCurrentPlayer = player.id === currentPlayerId;
          
          return (
            <div key={player.id} className={styles.row}>
              <div className={styles.leftSide}>
                {medal ? (
                  <span className={styles.medal}>{medal}</span>
                ) : (
                  <span className={styles.rank}>#{index + 1}</span>
                )}
                <span className={styles.playerName}>
                  {player.name}
                  <span className={
                    isCurrentPlayer 
                      ? styles.statusYou 
                      : player.isDead 
                        ? styles.statusDead 
                        : styles.statusAlive
                  }>
                    {isCurrentPlayer 
                      ? ' (Your Score)' 
                      : player.isDead 
                        ? ' (Final)' 
                        : ' (Playing...)'}
                  </span>
                </span>
              </div>
              <span className={styles.score}>{player.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiplayerLeaderboard;
