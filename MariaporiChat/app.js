const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    console.log('Joku liittyi osoitteesta ' + socket.request.socket.remoteAddress);
    socket.on('disconnect', () => {
      console.log('Joku poistui osoitteesta ' + socket.request.socket.remoteAddress);
    });
    socket.on('chat message', (msg) => {
        var now = new Date().toLocaleDateString("fi-FI");
        var nowtime = new Date().toLocaleTimeString("fi-FI")
        console.log(msg + ' osoitteesta ' + socket.request.socket.remoteAddress);
        io.emit('chat message', nowtime + ' ' + msg);
      });
  });
  

server.listen(3000,'0.0.0.0', () => {
  console.log('Kuunnellaan *:3000');
});