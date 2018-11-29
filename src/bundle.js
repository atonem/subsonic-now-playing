
class Subsonic {
  constructor(connection, config) {
    this._nowPlaying =  document.getElementById('nowPlaying');
    this._img =  document.getElementById('coverArt__image');
    this._artist =  document.getElementById('artist');
    this._album =  document.getElementById('album');
    this._title =  document.getElementById('title');

    this._connection = connection;
    this._client = createSubsonicClient(connection);
    this._getNowPlaying();
    this._currentTrack = null;
    console.log('getNowPlaying link', this._client.system.getNowPlaying());

    if (!config.playerFilter) {
      console.error('No filter provided in config');
      return;
    }


    this._filter = player => Object.keys(config.playerFilter).reduce((prev, key) => {
        return prev && config.playerFilter[key] == player[key];
      }, true);
      //(key =>
      //config.playerFilter[key] == player[key])
    setInterval(this._getNowPlaying.bind(this), config.pollInterval * 1000);

    console.log('filter es?', this._filter);
  }

  _hide() {
    this._img.classList.add('hidden');
    this._nowPlaying.classList.add('hidden');
  }

  _getPlayerFromResponse(response) {
    const nowPlaying = response['subsonic-response'].nowPlaying;

    return nowPlaying.entry.find(this._filter);
  }

  _getNowPlaying() {
    const getNowPlaying = this._client.system.getNowPlaying();
    axios.get(getNowPlaying)
      .then(response => response.data)
      .then(this._getPlayerFromResponse.bind(this))
      .then(player => {

        if (!player) {
          this._hide();
          return;
        }

        if (player.id == this._currentTrack) {
          // Track has not changed, do nothing
          return;
        }


        this._currentTrack = player.id;

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
  const subsonic = new Subsonic(connection, config);
})

