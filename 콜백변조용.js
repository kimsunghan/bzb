// ����� �����մϴ�.
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path')
var util = require("util");
var mysql = require('mysql');
var app = express();
///////////////////�ѱ� ����

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
 console.log("��������")
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
    console.log('Server running at http://127�ѱ�.0.0.1:52273');

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

    //   ns.in(socket.room).emit('updatechat', socket.username, data); �����ͺ��̽� �ֱ��� �����ڵ�
    ns.in(socket.room).emit('sendtoclient', data);

}

function adduserCallback(username, socket, ns) {

    //emit���� username�� �Ѿ�´�
    console.log("start : adduserCallback")
    // console.log(util.inspect(socket, {showHidden: false, depth: null}));

    //����ڿ� �湮�ڸ� ������ ����ڴ� ����(room1),�湮�ڴ� �ڽ��� �����Ƿε� ������ ������
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
    //   socket.emit('updatechat', 'SERVER', 'you have connected to room1'); //���� �����Ӿ˸��ڵ� insert�� ��ü
    //  socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room'); //���� ���� �˶��ڵ�


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


     socket.broadcast.to('room1').emit('updatechat',result); //���� ���� �˶��ڵ�
     }
     });*/

    socket.emit('updaterooms', rooms, 'room1'); //�ȸ�������


}



function sendchatCallback(data, ns, socket, login) {
    //emit���� ä�� ������ �Ѿ�´�.
    //����������  username�� socket.room�� �̿��Ѵ�
    //���⼭ insert ��Ű��
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


            //   ns.in(socket.room).emit('updatechat', socket.username, data); �����ͺ��̽� �ֱ��� �����ڵ�
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
    //  socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom); ���� �˶��ڵ�

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


            //   ns.in(socket.room).emit('updatechat', socket.username, data); �����ͺ��̽� �ֱ��� �����ڵ�
            ns.in(socket.room).emit('updatechat', result);
        }
    });



    // socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left this room'); ���� �˶��ڵ�



    // update socket session room title

    //  socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room'); ���� �˶��ڵ�

    // socket.emit('updaterooms', rooms, newroom);

}


function disCallback(socket, ns) {

    return function() {

        ns.emit('disconnector', socket.username)
        delete usernames[socket.username];
        // update list of users in chat, client-side
        //  io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        //   socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');// ���� �˶��ڵ�
        //   ns.in(socket.room).emit('updatechat', socket.username, data); �����ͺ��̽� �ֱ��� �����ڵ�

        socket.leave(socket.room);


        console.log("Disconnected ");

    }

}