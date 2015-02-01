var WebSocketServer = require('ws').Server,
    http = require('http'),
    express = require('express'),
    app = express();

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(8080);
console.log("holla, Snake Server is running");

var room = {};
var wss = new WebSocketServer({
    server: server
});
//wss.broadcast = function (data) {
//    for (var i in this.clients)
//        this.clients[i].send(data);
//};

wss.on('connection', function (ws) {

    ws.on('message', function (message) {
        console.log(JSON.stringify(message), message);
        if (typeof message != Object) {
            console.log("check this out", message, typeof message);
           var mess = JSON.parse(message);
        } else{
            var mess = message;
        }
        console.log("mess", mess);
        if (mess.hasOwnProperty('type')) {
            console.log("mes-sdfs", mess.type, mess.room);
            ////            if (mess.type == "join") {
            //                if (room.hasOwnProperty(mess.room)) {
            //
            //                } else {
            //                    room[mess.room] = []
            ////                    roo{
            ////                        'ws': ws,
            ////                        id: 1,
            ////                        name: mess.name
            ////                    }];
            //                    ws.send(JSON.stringify({ "type": "join", "join": 1, "name": mess.name, "room": mess.room}));
            ////                    ws.send({
            ////                        "type": "setid",
            ////                        'id': 1,
            ////                        "name": mess.name,
            ////                        "room": mess.room
            ////                    });
            //              //  }
            //            } else if (mess.type == "move") {
            //
            //            }
            //        }

            if (mess.hasOwnProperty('type')) {
                switch (mess.type) {
                case "join":
                    if (room.hasOwnProperty(mess.room)) {
                        if (room[mess.room].length > 1) {
                            ws.send(JSON.stringify({
                                "type": "error",
                                'error': 'Room is Full'
                            }));
                        } else {
                            room[mess.room].push({
                                'id': 2,
                                'ws': ws,
                                'score': 0
                            });
                            console.log(room[mess.room], room[mess.room].length)
                            room[mess.room][0].ws.send(JSON.stringify({
                                "type": "join",
                                // "list": room[mess.room],
                                "join": 2,
                                "name": mess.name
                            }));
                            room[mess.room][1].ws.send(JSON.stringify({
                                "type": "join",
                                // "list": room[mess.room],
                                "join": 2,
                                "name": mess.name
                            }));
                            ws.send(JSON.stringify({
                                "type": "setid",
                                'id': 2,
                                'name': mess.name,
                                'room': mess.room
                            }));
                        }
                    } else {
                        room[mess.room] = [{
                            'id': 1,
                            'ws': ws,
                            'score': 0,
                            'minas': 1
                                        }];

                        room[mess.room][0].ws.send(JSON.stringify({
                            "type": "join",
                            // "list": room[mess.room],
                            "join": 1,
                            "name": mess.name
                        }));
                        ws.send(JSON.stringify({
                            "type": "setid",
                            'id': 1,
                            'name': mess.name,
                            'room': mess.room
                        }));
                    }
                    break;
                case "move":
                    if (room.hasOwnProperty(mess.room) && room[mess.room].length == 2) {
                        console.log("move");
                        if (mess.hasOwnProperty('room')) {
                            room[mess.room][0].ws.send(JSON.stringify({
                                "type": "move",
                                "move": mess.move,
                                "name": mess.name,
                                "snake": mess.snake,
                                "id": mess.id
                            }));
                            room[mess.room][1].ws.send(JSON.stringify({
                                "type": "move",
                                "move": mess.move,
                                "name": mess.name,
                                "snake": mess.snake,
                                "id": mess.id
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                "type": "error",
                                'error': 'Please Use a Room'
                            }));
                        }
                        break;
                    }
                case "food":
                    if (room.hasOwnProperty(mess.room) && room[mess.room].length == 2) {

                        if(room[mess.room][0].minas){
                            room[mess.room][0].minas =0;
                            var rooma =mess.room; 
                                var k = setInterval( function(){                                  
                                  room[rooma][0].ws.send(JSON.stringify({"type": "render"}))
                                  room[rooma][1].ws.send(JSON.stringify({"type": "render"}))
                             }, 300);
                                    var l = setInterval( function(){                                  
                                  room[rooma][0].ws.send(JSON.stringify({"type": "length"}))
                                  room[rooma][1].ws.send(JSON.stringify({"type": "length"}))
                             }, 1000);
                        }
                        console.log("food");
                        if (mess.hasOwnProperty('room')) {
                            if(mess.score > 0){
                                room[mess.room][mess.score-1].score += 1;
                            }
                            room[mess.room][0].ws.send(JSON.stringify({
                                "type": "food",
                                "food": mess.food,
                                "name": mess.name,
                                "id": mess.id,
                                "mscore": mess.score,
                                "score": [room[mess.room][0].score,room[mess.room][1].score]
                            }));
                            room[mess.room][1].ws.send(JSON.stringify({
                                "type": "food",
                                "food": mess.food,
                                "name": mess.name,
                                "id": mess.id,
                                "mscore": mess.score,
                                "score":  [room[mess.room][1].score,room[mess.room][0].score]
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                "type": "error",
                                'error': 'Please Use a Room'
                            }));
                        }
                        break;
                    } else {
                        console.log("waiting for player");
                    }
                    case "position":
                    if (room.hasOwnProperty(mess.room) && room[mess.room].length == 2) {
                        console.log("position");
                        if (mess.hasOwnProperty('room')) {
                            room[mess.room][0].ws.send(JSON.stringify({
                                "type": "position",
                                "position": mess.position,
                                "keyPress": mess.keyPress,
                                "name": mess.name,
                                "id": mess.id
                            }));
                            room[mess.room][1].ws.send(JSON.stringify({
                                "type": "position",
                                "position": mess.position,
                                "keyPress": mess.keyPress,
                                "name": mess.name,
                                "id": mess.id
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                "type": "error",
                                'error': 'Please Use a Room'
                            }));
                        }
                        break;
                    } else {
                        console.log("waiting for player");
                    }
                    case "add":
                    if (room.hasOwnProperty(mess.room) && room[mess.room].length == 2) {
                        console.log("add");
                        if (mess.hasOwnProperty('room')) {
                            room[mess.room][0].ws.send(JSON.stringify({
                                "type": "add",
                                "add": mess.add,
                                "tail": mess.tail,
                                "name": mess.name,
                                "id": mess.id
                            }));
                            room[mess.room][1].ws.send(JSON.stringify({
                                "type": "add",
                                "add": mess.add,
                                "tail": mess.tail,
                                "name": mess.name,
                                "id": mess.id
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                "type": "error",
                                'error': 'Please Use a Room'
                            }));
                        }
                        break;
                    } else {
                        console.log("waiting for player");
                    }
                    case "end":
                    if (room.hasOwnProperty(mess.room) && room[mess.room].length == 2) {
                        console.log("end");
                        if (mess.hasOwnProperty('room')) {
                            room[mess.room][0].ws.send(JSON.stringify({
                                "type": "end",
                                "killed": mess.killed,
                                "score": [room[mess.room][0].score,room[mess.room][1].score],
                                "name": mess.name,
                                "id": mess.id
                            }));
                            room[mess.room][1].ws.send(JSON.stringify({
                                "type": "end",
                                "killed": mess.killed,
                                "score": [room[mess.room][1].score,room[mess.room][0].score],
                                "name": mess.name,
                                "id": mess.id
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                "type": "error",
                                'error': 'Please Use a Room'
                            }));
                        }
                        break;
                    } else {
                        console.log("waiting for player");
                    }
                }
            }
        } else {
            console.log("no object");
        }
        // wss.broadcast(message);
    });
});
