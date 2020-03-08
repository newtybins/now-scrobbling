const axios = require('axios');
const io = require('socket.io')();

// make an express app
const express = require('express');
const app = express();

// create spotify client
const nodespotify = new (require('node-spotify-api'))({
  id: process.env.SPOTIFYID,
  secret: process.env.SPOTIFYSECRET
});

// initialise empty object
let track = {};

// get information about the currently scrobbled track
const getTrack = async () => {
  // find my most recently/scrobbled track on 
  const lastfm = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=itsnewt&api_key=${process.env.LASTFM}&format=json&limit=1`).then(res => res.data.recenttracks.track[0]);
  const spotify = await nodespotify.search({ type: 'track', query: `${lastfm.artist['#text']} - ${lastfm.name}` });
  
  track = {
    album: {
      name: spotify.tracks.items[0].album.name,
      url: spotify.tracks.items[0].album.external_urls.spotify
    },
    song: {
      name: spotify.tracks.items[0].name,
      url: spotify.tracks.items[0].external_urls.spotify,
      preview: spotify.tracks.items[0].preview_url,
      nowPlaying: lastfm['@attr'] !== undefined ? true : false                                
    }
  }
  
  track.artists = spotify.tracks.items[0].artists.map(artist => {
    return {
      name: artist.name,
      url: artist.external_urls.spotify
    }
  });
};

// webserver

// make express use 'public' as its static folder
app.use(express.static('public'));

// https://now-scrobbling.glitch.me/
app.get('/', (req, res) => {
  console.log('accessed /')
  res.sendFile(`${__dirname}/views/index.html`);
});

// when there is a connection to the websocket, emit the track event
io.on('connection', socket => socket.emit('track', track));

// make the websocket listen on the WSPORT, and the express server on the default PORT
io.listen(process.env.WSPORT);
app.listen(process.env.PORT).then(() => console.log('tes'));

// run the track fetcher every 1000 ms
setInterval(getTrack, 1000);