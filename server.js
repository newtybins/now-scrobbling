const axios = require("axios");
const express = require('express');
const io = require("socket.io")();

// create spotify client
const nodespotify = new (require("node-spotify-api"))({
  id: process.env.SPOTIFYID,
  secret: process.env.SPOTIFYSECRET
});

// initialise empty object
let track = {};

// get information about the currently scrobbled track
const getTrack = async () => {
  // find my most recently/scrobbled track on lastfm
  const lastfm = await axios
    .get(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${process.env.USERNAME}&api_key=${process.env.LASTFM}&format=json&limit=1`
    )
    .then(res => res.data.recenttracks.track[0]);

  // find more information about the track from spotify
  const spotify = await nodespotify.search({
    type: "track",
    query: `${lastfm.artist["#text"]} - ${lastfm.name}`
  });

  // compile basic information
  track = {
    album: {
      name: spotify.tracks.items[0].album.name,
      url: spotify.tracks.items[0].album.external_urls.spotify
    },
    song: {
      name: spotify.tracks.items[0].name,
      url: spotify.tracks.items[0].external_urls.spotify,
      preview: spotify.tracks.items[0].preview_url,
      nowPlaying: lastfm["@attr"] === undefined ? false : true
    }
  };

  // add information about the artists
  track.artists = await spotify.tracks.items[0].artists.map(artist => {
    return {
      name: artist.name,
      url: artist.external_urls.spotify
    };
  });
};

// when there is a connection to the websocket, emit the track event
io.on("connection", async socket => {
  // run the track fetcher every 1000 ms
  setInterval(async () => {
    await getTrack().catch(err => console.error(err));
    socket.emit("track", track);
    console.log(track);
  }, 1000);
});

// start websocket
io.listen(process.env.PORT);

// make express web server
const app = express();

app.get('/', async (req, res) => res.send(`Hello! Newt is currntly listening to ${(await getTrack()).song.name} by ${(await getTrack()).artists[0].name}.`));

// ping the server to keep it alive
setInterval(() => {
  axios.get(`https://now-scrobbling.glitch.me/`);
  console.log('Ping!');
}, 280000);