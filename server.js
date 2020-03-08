const axios = require('axios');
const io = require('socket.io')();

let track = {};

const getTrack = () => {
  const axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=itsnewt&api_key=${process.env.LASTFM}&format=json&limit=1`).then(res => res.data);

io.on('connection', socket => socket.emit('track', track));

io.listen(process.env.PORT);
setInterval(() => getTrack() && console.log(track), 1000);