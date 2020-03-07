const axios = require('axios');
const cron = require('cron');

new cron.CronJob('* * * * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles').start();

axios
  .get('https://api.spotify.com/v1/me/player/currently-playing', { headers: { 'Authorization': `Bearer ${process.env.AUTH}` }})
  .then(res => console.log(res.data));