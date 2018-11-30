
class Subsonic {
  constructor(connection, config) {
    this._nowPlaying =  document.getElementById('nowPlaying');
    this._img =  document.getElementById('image');

    this._connection = connection;
    this._client = createSubsonicClient(connection);
    this._getNowPlaying();
    this._currentTrack = null;
    console.log('getNowPlaying link', this._client.system.getNowPlaying());

    if (!config.playerFilter) {
      console.error('No filter provided in config');
      return;
    }

    this._fields = {};
    this._renderNowPlaying(config.fields || []);


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
        this._setCoverArt(coverArt, () => this._setNowPlaying(player));


      })
      .catch(err => {
        // TODO: Should probably handle this more graceful
        console.error(err);
        this._hide();
      });
  }

  _setNowPlaying(player) {
    if (player) {
      Object.keys(this._fields).forEach(field => {
        const element = this._fields[field];
        // TODO: If no key, hide field
        let value = player[field];

        if (!value) {
          if (!element.className.includes('hidden')) {
            // No value for this field on this track, and is visible
            element.classList.add('hidden');
          }
          return;
        }

        if (fieldFormatter[field]) {
          // See src/field-formatter.js to add custom formatting of fields
          value = fieldFormatter[field](value);
        }
        // Update element value
        element.textContent = value;

        if (element.className.includes('hidden')) {
          // Element has updated value but has hidden class, remove it
          element.classList.remove('hidden');
        }

      });

      if (this._nowPlaying.className.includes('hidden')) {
        // We have data but nowPlaying dom is hidden, show it
        this._nowPlaying.classList.remove('hidden');
      }
    } else if (!this._nowPlaying.className.includes('hidden')) {
      // No nowPlaying data available, hide nowPlaying dom
      this._nowPlaying.classList.add('hidden');
    }
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

  _getSize() {
    const size = Math.min(window.innerWidth, window.innerHeight);

    return size - 60; // 60 is 2 * the padding of #container
  }

  _renderNowPlaying(fields) {
    fields.forEach(field => {
      const element = document.createElement('div');
      element.setAttribute('id', field);
      element.classList.add('field');

      this._nowPlaying.appendChild(element);
      this._fields[field] = element;
    });
  }
}

window.addEventListener('load', function() {
  const subsonic = new Subsonic(connection, config);
})

