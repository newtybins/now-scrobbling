// todo: create socket.io server based on https://github.com/tetra-fox/nowplaying/blob/master/server.js

const axios = require('axios');
const cron = require('cron');

const express = require('express');
const app = express();

const getTrack = () => axios
    .get('https://api.spotify.com/v1/me/player/currently-playing', { headers: { 'Authorization': `Bearer ${process.env.AUTH}` }})
    .then(res => console.log(res.data));

getTrack()
// new cron.CronJob('0 */1 * * * *',  () => getTrack(), null, true, 'America/Los_Angeles').start();

// express route
app.get('/', (req, res) => {
  console.log('/ accessed')
  res.send(getTrack());
})