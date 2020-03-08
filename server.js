const axios = require('axios');
const io = require('socket.io')();

let track = {};

const getTrack = () => axios
    .get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 
        'Authorization': `Bearer ${process.env.AUTH}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(res => { track = res.data; });

io.on('connection', socket => socket.emit('track', track));

io.listen(process.env.PORT);
setInterval(getTrack, 1000);