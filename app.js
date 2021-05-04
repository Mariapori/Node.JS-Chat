const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var history = [];

io.on('connection', (socket) => {

    GetHistory(socket);
    console.log('Joku liittyi osoitteesta ' + socket.request.socket.remoteAddress);

    socket.on('disconnect', () => {
        console.log('Joku poistui osoitteesta ' + socket.request.socket.remoteAddress);
    });

    socket.on('chat message', (msg, nick) => {
      if(socket.nick == null){
        socket.nick = nick;
        io.to(socket.id).emit('nickname set');
      }
        var now = new Date().toLocaleDateString("fi-FI");
        var nowtime = new Date().toLocaleTimeString("fi-FI");
        console.log(msg + ' osoitteesta ' + socket.request.socket.remoteAddress);
        io.emit('chat message', nowtime + ' ' + msg);
        history.push(now + ' | ' + nowtime + ' ' + msg);
      });

  });
  

server.listen(5665, () => {
  console.log('Kuunnellaan *:5665');
});

function GetHistory(socket){
  io.to(socket.id).emit('history', history);
}