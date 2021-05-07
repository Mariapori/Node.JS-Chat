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

var users = [];

io.on('connection', (socket) => {

    GetUsername(socket);
    GetHistory(socket);

    socket.on('disconnect', () => {
        io.emit('user left', socket.nick + ' poistui.');
        console.log(socket.nick + ' poistui');
        for (let index = 0; index < users.length; index++) {
          if(users[index].id == socket.id){
            users.splice(index, 1);
          }
        }
    });
    
     socket.on('set user', (nick) => {
        socket.nick = nick;
        users.push({ id : socket.id, nick : nick});
        console.log(nick + ' liittyi');
        socket.broadcast.emit('user welcome', nick + ' liittyi.');
     });

     socket.on('GetUsers', () => {
      io.emit('OnlineUsers', users);
   });

   socket.on('Kuiskaa', (keskustelija, viesti) => {
    var nowtime = new Date().toLocaleTimeString("fi-FI");
    io.to(keskustelija.id).emit('Kuiskaus', nowtime + ' ' + socket.nick + ' kuiskasi: ' + viesti);
    io.to(socket.id).emit('Kuiskaus', nowtime + ' ' + 'Kuiskasit nimimerkille ' + keskustelija.nick + ': ' + viesti);
 });


    socket.on('chat message', (msg, nick) => {
      if(socket.nick == null){
        socket.nick = nick;
      }
        var now = new Date().toLocaleDateString("fi-FI");
        var nowtime = new Date().toLocaleTimeString("fi-FI");
        console.log(msg);
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
function GetUsername(socket){
  io.to(socket.id).emit('user connected');
}