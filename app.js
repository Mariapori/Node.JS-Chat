const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
const logStream = fs.createWriteStream('log.txt', {flags: 'a'});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var history = [];

var users = [];

io.on('connection', (socket) => {

    GetUsername(socket);
    GetHistory(socket);

    socket.on('disconnect', () => {
        var now = new Date().toLocaleDateString("fi-FI");
        var nowtime = new Date().toLocaleTimeString("fi-FI");
        io.emit('user left', socket.nick + ' poistui.');
        console.log(socket.nick + ' poistui');
        logStream.write(now + ' | ' + nowtime + ' ' + nick + ' poistui\n');
        for (let index = 0; index < users.length; index++) {
          if(users[index].id == socket.id){
            users.splice(index, 1);
          }
        }
    });
    
     socket.on('set user', (nick) => {
        var now = new Date().toLocaleDateString("fi-FI");
        var nowtime = new Date().toLocaleTimeString("fi-FI");
        socket.nick = nick;
        users.push({ id : socket.id, nick : nick});
        console.log(nick + ' liittyi');
        logStream.write(now + ' | ' + nowtime + ' ' + nick + ' liittyi\n');
        socket.broadcast.emit('user welcome', nick + ' liittyi.');
     });

     socket.on('GetUsers', () => {
      io.emit('OnlineUsers', users);
   });

   socket.on('CheckNick', (nick) => {
    for (let index = 0; index < users.length; index++) {
      if(users[index].nick == nick){
        io.to(socket.id).emit("Nick exist");
      }
    }
 });



    socket.on('chat message', (msg, nick) => {
      if(socket.nick == null){
        socket.nick = nick;
      }
        var now = new Date().toLocaleDateString("fi-FI");
        var nowtime = new Date().toLocaleTimeString("fi-FI");
        console.log(msg);
        io.emit('chat message', nowtime + ' ' + msg);
        logStream.write(now + ' | ' + nowtime + ' ' + msg + '\n');
        history.push(now + ' | ' + nowtime + ' ' + msg);
      });

  });
  

server.listen(5666, () => {
  console.log('Kuunnellaan *:5666');
});

function GetHistory(socket){
  io.to(socket.id).emit('history', history);
}
function GetUsername(socket){
  io.to(socket.id).emit('user connected');
}