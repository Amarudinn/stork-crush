export const createRoom = async (playerName) => {
  if (!window.firebaseDB) {
    throw new Error('Firebase not initialized');
  }

  const roomId = 'room_' + Math.floor(Math.random() * 100000);
  const playerId = 'host_' + Date.now();

  const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}`);
  
  await window.firebaseSet(roomRef, {
    status: 'lobby',
    createdAt: Date.now(),
    settings: {
      timeLimit: 120,
      totalMoves: 20,
      difficulty: 'medium'
    },
    gameStartTime: null,
    players: {
      [playerId]: {
        name: playerName,
        score: 0,
        isHost: true,
        isDead: false,
        joinedAt: Date.now()
      }
    }
  });

  return { roomId, playerId, isHost: true };
};

export const joinRoom = async (roomId, playerName) => {
  if (!window.firebaseDB) {
    throw new Error('Firebase not initialized');
  }

  // Check if room exists
  const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}`);
  const snapshot = await window.firebaseGet(roomRef);
  
  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const roomData = snapshot.val();
  
  // Check for duplicate names (case insensitive)
  const existingPlayers = Object.values(roomData.players || {});
  const nameTaken = existingPlayers.some(
    p => p.name.toLowerCase() === playerName.toLowerCase()
  );
  
  if (nameTaken) {
    throw new Error('Username already taken in this room');
  }

  const playerId = 'p_' + Date.now();
  const playerRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}/players/${playerId}`);
  
  await window.firebaseSet(playerRef, {
    name: playerName,
    score: 0,
    isHost: false,
    isDead: false,
    joinedAt: Date.now()
  });

  return { roomId, playerId, isHost: false };
};

export const listenToRoom = (roomId, callback) => {
  if (!window.firebaseDB) return () => {};

  const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}`);
  return window.firebaseOnValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const updatePlayerScore = async (roomId, playerId, score) => {
  if (!window.firebaseDB) return;

  const playerRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}/players/${playerId}`);
  await window.firebaseUpdate(playerRef, { score });
};

export const markPlayerDead = async (roomId, playerId) => {
  if (!window.firebaseDB) return;

  const playerRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}/players/${playerId}`);
  await window.firebaseUpdate(playerRef, { isDead: true });
};

export const startGame = async (roomId) => {
  if (!window.firebaseDB) return;

  const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}`);
  await window.firebaseUpdate(roomRef, { 
    status: 'playing',
    gameStartTime: Date.now()
  });
};

export const updateRoomSettings = async (roomId, settings) => {
  if (!window.firebaseDB) return;

  const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}/settings`);
  await window.firebaseUpdate(roomRef, settings);
};

export const leaveRoom = async (roomId, playerId, isHost) => {
  if (!window.firebaseDB) return;

  if (isHost) {
    // Host leaves, delete entire room
    const roomRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}`);
    await window.firebaseRemove(roomRef);
  } else {
    // Client leaves, just remove player
    const playerRef = window.firebaseRef(window.firebaseDB, `rooms/${roomId}/players/${playerId}`);
    await window.firebaseRemove(playerRef);
  }
};
