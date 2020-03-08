const axios = require('axios');
const io = require('socket.io')();
const nodespotify = new (require('node-spotify-api'))({
  id: process.env.SPOTIFYID,
  secret: process.env.SPOTIFYSECRET
});

let track = {};

const getTrack = async () => {
  const lastfm = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=itsnewt&api_key=${process.env.LASTFM}&format=json&limit=1`).then(res => res.data);
  const spotify = await nodespotify.search({ type: 'track', query: lastfm.recenttracks.track[0].name });
  console.log(spotify.tracks.items[0])
}

io.on('connection', socket => socket.emit('track', track));

io.listen(process.env.PORT);
setInterval(() => getTrack(), 1000);