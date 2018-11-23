
class Subsonic {
  constructor(connection, config) {
    this._nowPlaying =  document.getElementById('nowPlaying');
    this._img =  document.getElementById('coverArt__image');
    this._artist =  document.getElementById('artist');
    this._album =  document.getElementById('album');
    this._title =  document.getElementById('title');

    console.log('instaniated subsonic', connection);
    this._connection = connection;
    this._client = createSubsonicClient(connection);
    this._getNowPlaying();
    this._currentTrack = null;
    setInterval(this._getNowPlaying.bind(this), config.pollInterval * 1000);
  }

  _hide() {
    this._img.classList.add('hidden');
    this._nowPlaying.classList.add('hidden');
  }

  _getNowPlaying() {
    const getNowPlaying = this._client.system.getNowPlaying();
    axios.get(getNowPlaying)
      .then(response => response.data)
      .then(response => {
        const nowPlaying = response['subsonic-response'].nowPlaying;
        const player = nowPlaying.entry.find(entry => entry.playerName ==
          'jukebox');

        if (player.id == this._currentTrack) {
          console.log('track hasnt changed, do nothing');
          return;
        }

        this._currentTrack = player.id;

        console.log('got response!', player);
        const { coverArt } = player;
        this._setCoverArt(coverArt, () => this._setArtistText(player));


      })
      .catch(err => {
        // TODO: Should probably handle this more graceful
        console.error(err);
        this._hide();
      });
  }

  _setCoverArt(id, cb) {
    const size = this._getSize();
    const getCoverArt = this._client.media.getCoverArt(id, size);

    this._img.setAttribute("src", getCoverArt);
    this._img.onload = () => {
      this._img.style.height = size;
      this._img.style.width = size;
      this._img.classList.remove('hidden');
      cb();
    }
  }

  _setArtistText(nowPlaying) {
    this._artist.textContent = nowPlaying.artist;
    this._album.textContent = nowPlaying.album;
    this._title.textContent = nowPlaying.title;
    this._nowPlaying.classList.remove('hidden');

  }

  _getSize() {
    const size = Math.min(window.innerWidth, window.innerHeight);

    return size - 60; // 60 is 2 * the padding of #container

  }


}

window.addEventListener('load', function() {
  console.log('All assets are loaded')
  console.log('config', connection, config);
  const client = createSubsonicClient(connection);
  console.log('client', client);

  //console.log('MD5: ' + MD5.hex(connection.password))

  const getArtists = client.browsing.getArtists();
  const getMusicFolders = client.browsing.getMusicFolders();
  const jukeboxStatus = client.jukebox.get();
  const jukeboxStart = client.jukebox.start();
  const jukeboxStop = client.jukebox.stop();
  //console.log('getNowPlaying', getNowPlaying);
  //console.log('getArtists', getArtists);
  //console.log('musicFolders', getMusicFolders);
  //console.log('status', jukeboxStatus);
  //console.log('start', jukeboxStart);
  //console.log('stop', jukeboxStop);
  const subsonic = new Subsonic(connection, config);
  console.log('subsonic', subsonic)

  console.log('document', document);


})

