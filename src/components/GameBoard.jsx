import { motion, AnimatePresence } from 'framer-motion';
import styles from './GameBoard.module.css';

const GameBoard = ({ 
  grid, 
  selectedCell, 
  onCellClick, 
  floatingTexts,
  shake,
  explodingCells = new Set(),
  fallingCells = new Set()
}) => {
  const getCellImage = (value) => {
    if (value >= 1 && value <= 6) {
      return `/images/${value}.png`;
    }
    if (value >= 7 && value <= 10) {
      return `/images/special/${value - 6}.png`;
    }
    return null;
  };

  const isSpecial = (value) => value > 6;

  return (
    <div className={styles.container}>
      <motion.div
        animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
        className={styles.board}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isExploding = explodingCells.has(`${rowIndex}-${colIndex}`);
            const isFalling = fallingCells.has(`${rowIndex}-${colIndex}`);
            const imgSrc = getCellImage(cell);

            const cellClasses = [
              styles.cell,
              isSelected && styles.cellSelected,
              isSpecial(cell) && styles.cellSpecial,
              isExploding && styles.exploding,
              isFalling && styles.falling
            ].filter(Boolean).join(' ');

            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                layoutId={`cell-${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                className={cellClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: isExploding ? 0 : 1, 
                  scale: isExploding ? 0.8 : 1,
                  filter: isExploding ? 'blur(4px) brightness(1.5)' : 'blur(0px) brightness(1)',
                  y: isFalling ? [0, 5, 0] : 0
                }}
                transition={{ 
                  duration: isExploding ? 0.5 : isFalling ? 0.3 : 0.2,
                  ease: isExploding ? 'easeOut' : isFalling ? [0.34, 1.56, 0.64, 1] : 'easeInOut',
                  repeat: isFalling ? 1 : 0
                }}
              >
                {imgSrc && (
                  <motion.img
                    src={imgSrc}
                    alt={`cell-${cell}`}
                    className={styles.cellImage}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: isExploding ? 0 : 1,
                      scale: isExploding ? 1.2 : 1
                    }}
                    transition={{ 
                      duration: isExploding ? 0.5 : 0.2,
                      ease: 'easeOut'
                    }}
                  />
                )}
                {isSpecial(cell) && !isExploding && (
                  <motion.div
                    className={styles.specialGlow}
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                )}
                {isExploding && (
                  <>
                    <motion.div
                      className={styles.fadeGlow}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.5, 2]
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <motion.div
                      className={styles.fadeParticle}
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ 
                        opacity: [1, 0.6, 0],
                        scale: [1, 0.5, 0.2],
                        y: [0, -10, -20]
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </>
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {floatingTexts.map((ft) => {
          const getSpecialIcon = (type) => {
            if (type === 'combo') return null;
            if (type >= 7 && type <= 10) {
              return `/images/special/${type - 6}.png`;
            }
            return null;
          };

          const specialIcon = getSpecialIcon(ft.specialType);

          return (
            <motion.div 
              key={ft.id}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Floating Score Text */}
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -50, scale: 1.2 }}
                transition={{ duration: 1 }}
                className={styles.floatingText}
                style={{
                  left: `clamp(15%, ${ft.col * 60 + 30}px, 85%)`,
                  top: `clamp(20%, ${ft.row * 60 + 30}px, 80%)`,
                }}
              >
                {ft.text}
              </motion.div>

              {/* Floating Special Icon (separate, HUGE) */}
              {specialIcon && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 1.2,
                    times: [0, 0.25, 0.6, 1],
                    ease: 'easeOut'
                  }}
                  onAnimationComplete={() => {
                    // Force remove after animation
                  }}
                  className={styles.floatingSpecialIcon}
                >
                  <img 
                    src={specialIcon} 
                    alt="special" 
                    className={styles.specialIconImage}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;
