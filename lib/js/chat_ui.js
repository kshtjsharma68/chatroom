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
		chatApp.sendMessaege($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}

	$('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function() {
	
});