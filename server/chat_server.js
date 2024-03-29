var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames  = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
	io = socketio.listen(server);
console.log('working inside server io');
	//io.set('log level', 1);

	io.sockets.on('connection', function(socket) {
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

		joinRoom(socket, 'Lobby');

		handleMessageBroadcasting(socket, nickNames, namesUsed);

		handleNameChangeAttempts(socket, nickNames, namesUsed);

		handleRoomJoining(socket);

		socket.on('rooms', function() {
			socket.emit('rooms', io.of('/').adapter.rooms);
			//socket.emit('rooms', io.sockets.manager.rooms);
		});

		handleClientDisconnection(socket, nickNames, namesUsed);
	});
}

var assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
	var name = 'Guest'+guestNumber;
	nickNames[socket.id] = name;
	socket.emit('nameResult', {
		success: 'true',
		name: name
	}); 

	namesUsed = [...namesUsed, name];

	return guestNumber + 1;
}

var joinRoom = (socket, room) => {
	socket.join(room);
	currentRoom[socket.id] = room;
	socket.emit('joinResult',{room: room});
	socket.broadcast.to(room).emit('message', {
		text: `${nickNames[socket.id]} has Joined ${room} .`
	});

	var usersInRoom = io.of('/').in(room).clients;

	if (usersInRoom.length > 1) {
		var usersInRoomSummary = `Users currently in ${room} :`;
		for( let index in usersInRoom )  {
			var userSocketId = usersInRoom[index].id;
			if (userSocketId != socket.id) {
				if (index >  0) {
					usersInRoomSummary += ', ';
				}
				usersInRoomSummary += nickNames[userSocketId];
			}
		}

		usersInRoomSummary += '.';
		socket.emit('message', {text : usersInRoomSummary});
	}
}

var handleNameChangeAttempts = (socket, nickNames, namesUsed) => {
	socket.on('nameAttempt', function(name) {
		if (names.indexOf('Guest') == 0) {
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest".'
			});
		} else {
			if (namesUsed.indexOf(name) == -1) {
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed.push(name);
				nickNames[socket.id] = name;
				delete namesUsed[previousNameIndex];
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: `${previousName} is now known as ${name} .`
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					message: 'Thant name is already in use.'
				})
			}
		}
	})
}

var handleMessageBroadcasting = socket => {
	socket.on('message', function(message) {
		socket.broadcast.to(message.room).emit('message', {
			text: `${nickNames[socket.id]} : ${message.text}`
		});
	})
}

var handleRoomJoining = socket => {
	socket.on('join', function(room) {
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	})
}

var handleClientDisconnection = socket => {
	socket.on('disconnect', function() {
		var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
		delete namesUsed[nameIndex];
		delete nickNames[socket.id];
	})
}
 


