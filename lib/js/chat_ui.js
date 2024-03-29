var divEscapedContentElement = message => {
	return $('<div></div>').text(message);
}

var divSystemContentElement = message => {
	return $('<div></div>').html(`<i>${message}</i>`);
}

var processUserInput = (chatApp, socket) => {
	var message = $('#send-message').val();
	var systemMessage;

	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		if (systemMessage) {
			$('#message').append(divSystemContentElement(systemMessage));
		}
	} else {
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}

	$('#send-message').val('');
}

var serverBaseUrl = document.domain;

var socket = io.connect(serverBaseUrl);

$(document).ready(function() {
	var chatApp = new Chat(socket);

	socket.on('nameResult', function(result) {
		var message;

		if (result.message) {
			message = 'You are now known as' + result.name + '.';
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});

	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Room changed'));
	}); 

	socket.on('message', function(message) {
		var newElement = $('<div></div>').text(message.text);
		$('#messages').append(newElement);
	});

	socket.on('rooms', function(rooms) {
		$('#room-list').empty();

		for(let room in rooms) {
			room = room.substring(1, room.length);
			if (room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}

		$('#room-list div').click(function() {
			chatApp.processCommand('/join' + $(this).text());
			$('#send-message').focus();
		});
	});

	setInterval(function() {
		socket.emit('rooms');
	}, 1000);

	$('#send-message').focus();

	$('#send-form').submit(function(e) {
		e.preventDefault();
		processUserInput(chatApp, socket);
		return false;
	});
});