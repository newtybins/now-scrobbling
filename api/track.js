const axios = require('axios');
const ms = require('ms');

const nodespotify = new(require('node-spotify-api'))({
    id: process.env.SPOTIFYID,
    secret: process.env.SPOTIFYSECRET
});

module.exports = async (req, res) => {
    // get information about the song
    const lastfm = await axios
        .get(
            `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${process.env.USERNAME}&api_key=${process.env.LASTFM}&format=json&limit=1`
        )
        .then(res => res.data.recenttracks.track[0]);

    const spotify = (await nodespotify.search({
        type: 'track',
        query: `${lastfm.artist['#text']} - ${lastfm.name}`
    })).tracks.items[0];

    // get information about the artists of the song
    const artists = await spotify.artists.map(artist => {
        return {
            name: artist.name,
            url: artist.external_urls.spotify,
            uri: artist.uri,
            id: artist.id,
        };
    });

    // send off the data
    res.send({
        name: spotify.name,
        url: spotify.external_urls.spotify,
        uri: spotify.uri,
        preview: spotify.preview_url,
        id: spotify.id,
        duration: ms(spotify.duration_ms, { long: true }),
        trackNumber: spotify.track_number,
        album: {
            name: spotify.album.name,
            url: spotify.album.external_urls.spotify,
            uri: spotify.album.uri,
            id: spotify.album.id,
            images: spotify.album.images,
            releaseDate: spotify.album.release_date,
            trackCount: spotify.album.total_tracks,
        },
        artists
    });
}