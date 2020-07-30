const axios = require("axios");

// create spotify client
const nodespotify = new(require("node-spotify-api"))({
    id: process.env.SPOTIFYID,
    secret: process.env.SPOTIFYSECRET
});

module.exports = async (req, res) => {
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
    // add information about the artists
    const artists = await spotify.tracks.items[0].artists.map(artist => {
        return {
            name: artist.name,
            url: artist.external_urls.spotify
        };
    });
    res.send({
        album: {
            name: spotify.tracks.items[0].album.name,
            url: spotify.tracks.items[0].album.external_urls.spotify
        },
        song: {
            name: spotify.tracks.items[0].name,
            url: spotify.tracks.items[0].external_urls.spotify,
            preview: spotify.tracks.items[0].preview_url,
            nowPlaying: lastfm["@attr"] === undefined ? false : true
        },
        artists
    });
}