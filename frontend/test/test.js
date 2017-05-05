var messageShard;

// Setup

document.addEventListener("DOMContentLoaded", function(e) {
	$(".input textarea").addEventListener("keypress", messageKeypressListener);
	getMessageShard();
});

function getMessageShard() {
	ajax({
		type: "GET",
		url: "messages/message.html",
		callback: gotMessageShard
	});
}

function gotMessageShard(error, response) {
	if (error) {
		console.log("Could not get message shard: " + error);
		console.log(response);
		return;
	}
	messageShard = response;
	callForMessages(true);	
}

// Get messages

function callForMessages(repeat) {
	ajax({
		type: "GET",
		url: "api/getall",
		callback: (error, response) => { populateMessages(error, response, repeat); }
	});
}

function populateMessages(error, response, repeat) {
	console.log("Get messages response. Error: " + error + ". Response text: " + response);
	var messages = JSON.parse(response);
	var messagesHtml = "";
	for (var message in messages) {
		messagesHtml += messageShard
			.replace("$DATA_USER", messages[message].user)
			.replace("$DATA_DATE", messages[message].date)
			.replace("$DATA_TEXT", messages[message].text);
	}
	$(".messages").innerHTML = messagesHtml;
	if (repeat) {
		// Refresh periodically
		setTimeout(() => { callForMessages(true); }, 5000);
	}
}

// Send new message

function messageKeypressListener(e) {
	if (e.keyCode == 13) {
		e.preventDefault();
		if ($(".name input").value.length > 0) {
			console.log("Enter pressed");
			ajax({
				type: "POST",
				url: "api/insert",
				data: {
					text: $(".input textarea").value,
					user: $(".name input").value,
					tag: ""
				},
				callback: newMessageResponse
			});
		}
	}
}

function newMessageResponse(error, response) {
	console.log("New message response. Error: " + error + ". Response text: " + response);
	$(".input textarea").value = "";
	setTimeout(callForMessages(false), 250);
}