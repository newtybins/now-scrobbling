const axios = require("axios");
const io = require("socket.io")();

// create spotify client
const nodespotify = new (require("node-spotify-api"))({
  id: process.env.SPOTIFYID,
  secret: process.env.SPOTIFYSECRET
});

// when there is a connection to the websocket, emit the track event
io.on("connection", async socket => {
  // initialise empty object
  let track = {};
  let oldData = {};

  // get information about the currently scrobbled track
  const getTrack = async () => {
    if (track === undefined) return;
    oldData = track;

    // find my most recently/scrobbled track on
    const lastfm = await axios
      .get(
        `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=itsnewt&api_key=${process.env.LASTFM}&format=json&limit=1`
      )
      .then(res => res.data.recenttracks.track[0]);

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
    track.artists = spotify.tracks.items[0].artists.map(artist => {
      return {
        name: artist.name,
        url: artist.external_urls.spotify
      };
    });
  };

  // run the track fetcher every 1000 ms
  setInterval(async () => {
    await getTrack();
    socket.emit('track', track);
  }, 1000);
});

// start websocket
io.listen(process.env.PORT);
