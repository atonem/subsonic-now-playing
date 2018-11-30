const connection = {
  location: 'localhost',
  username: 'username',
  password: 'password',
  appIdentifier: 'subsonic-now-playing',
  // Thgese are not needed unless other port or older API version
  //port: '4040',
  apiVersion: '1.16.1',
  //format: 'json',
};

const config = {
  pollInterval: 5,
  playerFilter: {
    playerId: 1,
    playerName: 'player-1',
    username: 'username',
  },
  fields: ['title', 'artist', 'album', 'year', 'size', 'suffix', 'duration', 'bitRate'],
};
