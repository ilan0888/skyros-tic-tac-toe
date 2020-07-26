var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.send('hey');
});


http.listen(8080, () => {
    console.log('listening on *:8080');
});

const clients = {};

var players = {};
var unmatched;


io.on("connection", function(socket) {
    let id = socket.id;
    clients[socket.id] = socket;

    join(socket);

    if (opponentOf(socket)) {

        socket.emit("gameStart", {
            symbol: players[socket.id].symbol
        });

        opponentOf(socket).emit("gameStart", {
            symbol: players[opponentOf(socket).id].symbol
        });
    }

    socket.on("makeMove", function(data) {
        if (!opponentOf(socket)) {
            return;
        }
        socket.emit("moveMade", data);
        opponentOf(socket).emit("moveMade", data);
    });

});


function join(socket) {
    players[socket.id] = {
        opponent: unmatched,
        symbol: "X",
        socket: socket
    };


    if (unmatched) {
        players[socket.id].symbol = "O";
        players[unmatched].opponent = socket.id;
        unmatched = null;
    } else {
        unmatched = socket.id;
    }
}

function opponentOf(socket) {
    if (!players[socket.id].opponent) {
        return;
    }
    return players[players[socket.id].opponent].socket;
}