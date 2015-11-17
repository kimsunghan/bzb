// 모듈을 추출합니다.
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path')
var util = require("util");
var mysql = require('mysql');
var app = express();
///////////////////한글 깨짐

////////////////////////////
var client = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'testdb'
});
app.use(express.static(path.join(__dirname, 'public')));
/*client.query('select * from testbook ',function(error,result,fields){

 if(error){
 console.log("쿼리에러")
 }
 else{
 console.log(result)
 }
 });*/
/////////////////////////////////
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())


var server = http.createServer(app).listen(52273, function() {
    console.log('Server running at http://127한글.0.0.1:52273');

});

var io = socketio.listen(server);


var usernames = {};
var rooms = ['room1', 'testroom'];
////////////////////////////////////


app.get('/b/bz', function(req, res) {

    res.sendfile(__dirname + '/bz.html');


});
app.get('/u/user', function(req, res) {

    res.sendfile(__dirname + '/bizvichat.html')

})




var namespaces = [
    io.of('/ff9324712'),
    io.of('/ff1234124'),
    io.of('/f54634634')
];
for (i in namespaces) {
    namespaces[i].on('connection', handleConnection(namespaces[i]));
}

function handleConnection(ns) {
    return function(socket) { //connection

        console.log("connected " + socket);
        socket.on('disconnect', disCallback(socket, ns));
        socket.on('adduser', function(data) {
            adduserCallback(data, socket, ns)
        });
        socket.on('sendchat', function(data, login) {
            sendchatCallback(data, ns, socket, login)
        })
        socket.on('switchRoom', function(newroom) {
            switchRoomCallback(newroom, socket, ns)
        })
        socket.on('sendtoserver', function (data) {
            sendtoservercallback(data,socket,ns)
        })
    };
}
function sendtoservercallback(data,socket,ns){

    //   ns.in(socket.room).emit('updatechat', socket.username, data); 데이터베이스 넣기전 쓰던코드
    ns.in(socket.room).emit('sendtoclient', data);

}

function adduserCallback(username, socket, ns) {

    //emit에서 username이 넘어온다
    console.log("start : adduserCallback")
    // console.log(util.inspect(socket, {showHidden: false, depth: null}));

    //사업자와 방문자를 나눠서 사업자는 대기실(room1),방문자는 자신의 아이피로된 방으로 보낸다
    console.log(username.login)
    if (username.login == '1') {
        // store the username in the socket session for this client
        socket.username = username.myip;
        // store the room name in the socket session for this client
        socket.room = 'room1';
        // add the client's username to the global list
        usernames[username.myip] = username.myip;
        // send client to room 1
        socket.join('room1');

    } else {
        socket.username = username.myip;
        // store the room name in the socket session for this client
        socket.room = username.myip;
        // add the client's username to the global list
        usernames[username.myip] = username.myip;
        rooms.push(username.myip);
        socket.join(username.myip);
        ns.emit('updaterooms', rooms, username.myip);


    }



    // echo to client they've connected
    //   socket.emit('updatechat', 'SERVER', 'you have connected to room1'); //원래 방접속알림코드 insert로 대체
    //  socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room'); //원래 접속 알람코드


    client.query('select * from testbook where roomname=?', [socket.room], function(error, result) {

        if (error) {
            console.log("select query error")
        } else {
            console.log("select success")


            socket.emit('updatechat', result);
        }
    });

    // echo to room 1 that a person has connected to their room



    /*   client.query('select * from testbook where roomname=?',[socket.room],function(error,result){

     if(error){
     console.log("select query error")
     }
     else{
     console.log("select success")


     socket.broadcast.to('room1').emit('updatechat',result); //원래 접속 알람코드
     }
     });*/

    socket.emit('updaterooms', rooms, 'room1'); //안먹히더라


}



function sendchatCallback(data, ns, socket, login) {
    //emit에서 채팅 내용이 넘어온다.
    //서버가져온  username과 socket.room을 이용한다
    //여기서 insert 시키고
    console.log(data)
    client.query('insert into testbook (roomname,username,chatdata) values (?,?,?)', [socket.room, socket.username, data], function(error, result, fields) {

        if (error) {
            console.log("insert query error")
        } else {

        }
    });

    client.query('select * from testbook where roomname=?', [socket.room], function(error, result) {

        if (error) {
            console.log("select query error")
        } else {


            //   ns.in(socket.room).emit('updatechat', socket.username, data); 데이터베이스 넣기전 쓰던코드
            ns.in(socket.room).emit('updatechat', result);

            if (login != '1') {
                ns.emit('updateresnumber', socket.room);
            }
        }
    });

}

function switchRoomCallback(newroom, socket, ns) {

    //  if(socket.username!=1){socket.leave(socket.room);}
    socket.leave(socket.room);
    // join new room, received as function parameter
    socket.join(newroom);
    socket.room = newroom;
    //  socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom); 원래 알람코드

    /* client.query('insert into testbook (roomname,username,chatdata) values (?,?,?)',[socket.room,socket.username,"join!"],function(error,result,fields){

     if(error){
     console.log("insert query error")
     }
     else{

     }
     });
     */
    client.query('select * from testbook where roomname=?', [socket.room], function(error, result) {

        if (error) {
            console.log("select query error")
        } else {


            //   ns.in(socket.room).emit('updatechat', socket.username, data); 데이터베이스 넣기전 쓰던코드
            ns.in(socket.room).emit('updatechat', result);
        }
    });



    // socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left this room'); 원래 알람코드



    // update socket session room title

    //  socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room'); 원래 알람코드

    // socket.emit('updaterooms', rooms, newroom);

}


function disCallback(socket, ns) {

    return function() {

        ns.emit('disconnector', socket.username)
        delete usernames[socket.username];
        // update list of users in chat, client-side
        //  io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        //   socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');// 원래 알람코드
        //   ns.in(socket.room).emit('updatechat', socket.username, data); 데이터베이스 넣기전 쓰던코드

        socket.leave(socket.room);


        console.log("Disconnected ");

    }

}