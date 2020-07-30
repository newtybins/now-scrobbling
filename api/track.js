const axios = require('axios');
const ms = require('ms');
const allowCors = require('../allowCors');

const nodespotify = new(require('node-spotify-api'))({
    id: process.env.SPOTIFYID,
    secret: process.env.SPOTIFYSECRET
});

module.exports = allowCors(async (_req, res) => {
    // get information about the song
    const recentTrack = await axios
        .get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${process.env.USERNAME}&api_key=${process.env.LASTFM}&format=json&limit=1` )
        .then(res => res.data.recenttracks.track[0]);

    const spotify = (await nodespotify.search({
        type: 'track',
        query: `${recentTrack.artist['#text']} - ${recentTrack.name}`
    })).tracks.items[0];

    const lastfm = await axios
        .get(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${process.env.LASTFM}&artist=${recentTrack.artist['#text']}&track=${recentTrack.name}&format=json`)
        .then(res => res.data.track);

    // get information about the artists of the song
    const artists = await spotify.artists.map(artist => {
        return {
            name: artist.name,
            url: artist.external_urls.spotify,
            uri: artist.uri,
            id: artist.id,
        };
    });

    const nowPlaying = recentTrack["@attr"].nowplaying === "true";

    // send off the data
    if (nowPlaying) {
        res.send({
            name: spotify.name,
            url: spotify.external_urls.spotify,
            uri: spotify.uri,
            preview: spotify.preview_url,
            id: spotify.id,
            duration: ms(spotify.duration_ms, { long: true }),
            trackNumber: spotify.track_number,
            listeners: parseInt(lastfm.listeners),
            playcount: parseInt(lastfm.playcount),
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
    } else {
        res.send({ message: 'newt is not currently listening to anything!' });
    }
});