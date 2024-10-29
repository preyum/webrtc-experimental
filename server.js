import express from 'express'
import { Server as SocketServer } from "socket.io";
import { Server as HTTPServer} from 'http';
import {v4 as uuidV4} from 'uuid';

const app = express();
const server = new HTTPServer(app);
const io = new SocketServer(server);

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', (req,res)=>{
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req,res)=>{
  res.render('index', {roomID: req.params.room})
})


io.on("connection", (socket) => {
  socket.on('join-room', (roomID, userID)=>{
    socket.join(roomID)
    socket.roomID = roomID;
    socket.userID = userID;
    socket.broadcast.to(roomID).emit('user-connected', userID);
  })
  socket.on('disconnect', ()=>{
    if(socket.roomID && socket.userID){
      socket.to(socket.roomID).broadcast.emit('user-disconnected', socket.userID);
    }
    
  })
});

server.listen(3000, ()=>{
  console.log('Listening to port: 3000');
  
});