const axios = require('axios');
const io = require('socket.io')();

// create spotify client
const nodespotify = new (require('node-spotify-api'))({
  id: process.env.SPOTIFYID,
  secret: process.env.SPOTIFYSECRET
});

// initialise empty object
let track = {};

const getTrack = async () => {
  const lastfm = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=itsnewt&api_key=${process.env.LASTFM}&format=json&limit=1`).then(res => res.data);
  const spotify = await nodespotify.search({ type: 'track', query: `${lastfm.recenttracks.track[0].artist['#text']} - ${lastfm.recenttracks.track[0].name}` });
  
  track = {
    album: {
      name: spotify.tracks.items[0].album.name,
      url: spotify.tracks.items[0].album.external_urls.spotify
    },
    song: {
      name: spotify.tracks.items[0].name,
      url: spotify.tracks.items[0].external_urls.spotify,
      preview: spotify.tracks.items[0].preview_url,
      nowPlaying: lastfm.recenttracks.track[0]['@attr'] !== undefined ? true : false                                
    }
  }
  
  track.artists = spotify.tracks.items[0].artists.map(artist => {
    return {
      name: artist.name,
      url: artist.external_urls.spotify
    }
  });
}

io.on('connection', socket => socket.emit('track', track));

io.listen(process.env.PORT);
setInterval(() => getTrack() && console.log(track), 1000);