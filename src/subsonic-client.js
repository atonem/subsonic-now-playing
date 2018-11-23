const createSubsonicClient = (conn) => {
  validateConnection(conn);
  const baseUrl = getBaseUrl(conn);
  const defaultParamstring = getDefaultParamString(conn);

  const url = (endpoint, params = {}, additionalParams) => {
    let result = `${baseUrl}/${endpoint}.view?${defaultParamstring}`;
    result += buildParams(params);
    result += buildParams(additionalParams);
    return result;
  };

  const system = {};
  const browsing = {};
  const list = {};
  const search = {};
  const playlist = {};
  const media = {};
  const annotation = {};
  const sharing = {};
  const podcast = {};
  const jukebox = {};
  const radio = {};
  const chat = {};
  const user = {};
  const bookmark = {};

  system.ping = () => url('ping');
  system.getLicense = () => url('getLicense');
  system.getNowPlaying = () => url('getNowPlaying');

  browsing.getMusicFolders = () => url('getMusicFolders');
  browsing.getIndexes = (musicFolderId) => url('getIndexes', { musicFolderId });
  browsing.getMusicDirectory = (id) => url('getMusicDirectory', { id });
  browsing.getGenres = () => url('getGenres');
  browsing.getArtists = () => url('getArtists');
  browsing.getArtist = (id) => url('getArtist', { id });
  browsing.getAlbum = (id) => url('getAlbum', { id });
  browsing.getSong = (id) => url('getSong', { id });
  browsing.getVideos = () => url('getVideos');
  browsing.getVideoInfo = (id) => url('getVideoInfo', { id });
  browsing.getArtistInfo = (id) => url('getArtistInfo', { id });
  browsing.getArtistInfo2 = (id) => url('getArtistInfo2', { id });
  browsing.getAlbumInfo = (id) => url('getAlbumInfo', { id });
  browsing.getAlbumInfo2 = (id) => url('getAlbumInfo2', { id });
  browsing.getSimilarSongs = (id, count) => url('getSimilarSongs', { id, count });
  browsing.getSimilarSongs2 = (id, count) => url('getSimilarSongs2', { id, count });
  browsing.getTopSongs = (artist, count) => url('getTopSongs', { artist, count });

  list.getAlbumList = (type, params) => url('getAlbumList', { type }, params);
  list.getAlbumList2 = (type, params) => url('getAlbumList2', { type }, params);
  list.getRandomSongs = (params) => url('getRandomSongs', params);
  list.getSongsByGenre = (genre, params) => url('getSongsByGenre', { genre }, params);
  list.getNowPlaying = (params) => url('getNowPlaying', params);
  list.getStarred = (musicFolderId) => url('getStarred', { musicFolderId });
  list.getStarred2 = (musicFolderId) => url('getStarred2', { musicFolderId });

  search.search2 = (query, params) => url('search2', { query }, params);
  search.search3 = (query, params) => url('search3', { query }, params);

  playlist.getPlaylists = (username) => url('getPlaylists', { username });
  playlist.getPlaylist = (id) => url('getPlaylist', { id });
  playlist.createPlaylist = (params) => url('createPlaylist', params);
  playlist.updatePlaylist = (playlistId, params) => url('updatePlaylist', { playlistId }, params);
  playlist.deletePlaylist = (id) => url('deletePlaylist', { id });

  media.stream = (id, params) => url('stream', { id }, params);
  media.download = (id) => url('download', { id });
  media.hls = (id, params) => url('hls', { id }, params);
  media.getCaptions = (id, format) => url('getCaptions', { id, format });
  media.getCoverArt = (id, size) => url('getCoverArt', { id, size });
  media.getLyrics = (params) => url('getLyrics', params);
  media.getAvatar = (username) => url('getAvatar', username);

  annotation.star = (params) => url('star', params);
  annotation.unstar = (params) => url('unstar', params);
  annotation.setRating = (id, rating) => url('setRating', { id, rating });
  annotation.scrobble = (id, params) => url('scrobble', { id }, params);

  sharing.getShares = () => url('getShares');
  sharing.createShare = (id, params) => url('createShare', { id }, params);
  sharing.updateShare = (id, params) => url('updateShare', { id }, params);
  sharing.deleteShare = (id) => url('deleteShare', { id });

  // TODO: Podcasts

  jukebox.get = () => url('jukeboxControl', { action: 'get' });
  jukebox.status = () => url('jukeboxControl', { action: 'status' });
  jukebox.set = (id) => url('jukeboxControl', { action: 'set', id });
  jukebox.start = () => url('jukeboxControl', { action: 'start' });
  jukebox.stop = () => url('jukeboxControl', { action: 'stop' });
  jukebox.skip = (params) => url('jukeboxControl', { action: 'skip' }, params);
  jukebox.add = (id) => url('jukeboxControl', { action: 'add', id });
  jukebox.clear = (index) => url('jukeboxControl', { action: 'clear', index });
  jukebox.remove = () => url('jukeboxControl', { action: 'remove' });
  jukebox.shuffle = () => url('jukeboxControl', { action: 'shuffle' });
  jukebox.setGain = (gain) => url('jukeboxControl', { action: 'setGain', gain });

  // TODO: radio
  //
  // TODO: chat
  //
  // TODO: users
  //
  // TODO: bookmarks


  return { system, browsing, list, search, playlist, media, annotation, sharing, podcast, jukebox, radio, chat, user, bookmark };
}


const validateConnection = (conn) => {
  if(!conn.location) throw new Error('No location in options');
  if(!conn.username) throw new Error('No username in options');
  if(!conn.password) throw new Error('No password in options');
  if(!conn.appIdentifier) throw new Error('No appIdentifier in options');
  if(!conn.port) conn.port = '4040';
  if(!conn.apiVersion) conn.apiVersion = '1.12.0';
  if(!conn.format) conn.format = 'json';
}

const generateSalt = () => Math.random().toString(36).substring(7);

const md5 = new Hashes.MD5;

const getAuthentication = (conn) => {
  const salt = generateSalt();
  const token = md5.hex(conn.password + salt);
  return { salt, token };
}

const getLocation = (conn) => (conn.location.substr(0, 7) === 'http://') ? `${conn.location}:${conn.port}` : `http://${conn.location}:${conn.port}`;

const getDefaultParamString = (conn) => {
  const { salt, token } = getAuthentication(conn);

  return `u=${conn.username}&s=${salt}&t=${token}&c=${conn.appIdentifier}&v=${conn.apiVersion}&f=${conn.format}`;
}

const getBaseUrl = (conn) => `${getLocation(conn)}/rest`;

const buildParams = (params) => {
  if(!params) return '';
  var result = '';
  for(let key in params) {
    if(params[key] === undefined) continue;
    // NOTE: This is a hacky fix, since subsonic want's multiple parameters of the same name
    result += Array.isArray(params[key]) ? `&${key}=${params[key].join('&' + key + '=')}` : `&${key}=${params[key]}`;
  }
  return result;
}
