import { useState } from 'react';
import { Settings } from 'lucide-react';
import styles from './HostSettings.module.css';

const DIFFICULTY_PRESETS = {
  easy: {
    timeLimit: 180,
    totalMoves: 30,
    label: 'Easy',
    description: '3 min, 30 moves'
  },
  medium: {
    timeLimit: 120,
    totalMoves: 20,
    label: 'Medium',
    description: '2 min, 20 moves'
  },
  hard: {
    timeLimit: 60,
    totalMoves: 10,
    label: 'Hard',
    description: '1 min, 10 moves'
  },
  custom: {
    timeLimit: 120,
    totalMoves: 20,
    label: 'Custom',
    description: 'Set your own'
  }
};

const HostSettings = ({ settings, onSettingsChange }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [showCustom, setShowCustom] = useState(settings.difficulty === 'custom');
  const [customValues, setCustomValues] = useState({
    timeLimit: settings.difficulty === 'custom' ? settings.timeLimit : 120,
    totalMoves: settings.difficulty === 'custom' ? settings.totalMoves : 20
  });

  const handleDifficultyChange = (difficulty) => {
    if (difficulty === 'custom') {
      setShowCustom(true);
      const newSettings = {
        difficulty: 'custom',
        timeLimit: customValues.timeLimit,
        totalMoves: customValues.totalMoves
      };
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);
      return;
    }
    
    setShowCustom(false);
    const preset = DIFFICULTY_PRESETS[difficulty];
    const newSettings = {
      difficulty,
      timeLimit: preset.timeLimit,
      totalMoves: preset.totalMoves
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleCustomChange = (key, value) => {
    const newValue = parseInt(value);
    const newCustomValues = {
      ...customValues,
      [key]: newValue
    };
    setCustomValues(newCustomValues);
    
    const newSettings = {
      difficulty: 'custom',
      timeLimit: newCustomValues.timeLimit,
      totalMoves: newCustomValues.totalMoves
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const currentDifficulty = localSettings.difficulty || 'medium';

  return (
    <div className={styles.container}>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={styles.toggleButton}
      >
        <Settings className={styles.icon} />
        Game Settings
      </button>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <h3 className={styles.title}>Difficulty</h3>
          <div className={styles.difficultyButtons}>
            {Object.entries(DIFFICULTY_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handleDifficultyChange(key)}
                className={`${styles.difficultyButton} ${
                  currentDifficulty === key ? styles.active : ''
                }`}
              >
                <span className={styles.difficultyLabel}>{preset.label}</span>
                <span className={styles.difficultyDesc}>{preset.description}</span>
              </button>
            ))}
          </div>

          {showCustom && (
            <div className={styles.customSettings}>
              <div className={styles.settingRow}>
                <label className={styles.label}>Time Limit (seconds)</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={customValues.timeLimit}
                  onChange={(e) => handleCustomChange('timeLimit', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.settingRow}>
                <label className={styles.label}>Total Moves</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={customValues.totalMoves}
                  onChange={(e) => handleCustomChange('totalMoves', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostSettings;
