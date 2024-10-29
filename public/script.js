const socket = io('/')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = []

// mute button
const muteButton = document.getElementById('mute-button');
let audioEnabled = true;



navigator.mediaDevices.getUserMedia({
  video: false,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })



  socket.on('user-connected', userID => {
    connectToNewUser(userID, stream)

  })


  // mute button clicked
  muteButton.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    console.log("mute button clicked ", audioEnabled);
    stream.getAudioTracks()[0].enabled = audioEnabled;


    if (audioEnabled) {
      muteButton.innerText = "Mute";
    } else {
      muteButton.innerText = "Unmute";
    }
  });
  
});
socket.on('user-disconnected', (userID) => {
  if (peers[userID]) peers[userID].close()
})
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})



function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video);
}

function connectToNewUser(userID, stream) {
  const call = myPeer.call(userID, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove();
  })
  peers[userID] = call;
}