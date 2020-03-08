const ws = 'wss://spotify-nowplaying.glitch.me';
const socket = io(ws);

socket.on('connect', () => console.log(`connected to ${ws}`));

socket.on('track', data => {
  console.log(data);
  
  if (data.nowPlaying) {
    const np = `${data.artist.toLowerCase()} - ${data.name.toLowerCase()}`;
    document.querySelector('#np').innterText = np;
  } else {
    document.querySelector('#np').innerText = 'nothing.';
  }
})