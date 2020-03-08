const axios = require('axios');
const io = require('socket.io')();

const getTrack = () => axios
    .get('https://api.spotify.com/v1/me/player/currently-playing', { headers: { 'Authorization': `Bearer ${process.env.AUTH}` }})
    .then(res => console.log(res.data));

io.on('connection', socket => socket.emit('track', track));