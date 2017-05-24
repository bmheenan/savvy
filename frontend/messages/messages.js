messages();

function messages() {
	// Public
	globals.messages_showMessages = showMessages;

	// Set up UI
	$(".newMessageContainer .collapsed").addEventListener("click", expandNewMessageDiv);
	$(".newMessageContainer .hideButton").addEventListener("click", collapseNewMessageDiv);
	$(".newMessageContainer .submitButton").addEventListener("click", submitMessage);

	function expandNewMessageDiv(e) {
		$(".newMessageContainer .expanded").classList.remove("hidden");
		$(".newMessageContainer .collapsed").classList.add("hidden");
		$(".messages .allMessages").classList.add("obscured");
	}

	function collapseNewMessageDiv(e) {
		$(".newMessageContainer .expanded").classList.add("hidden");
		$(".newMessageContainer .collapsed").classList.remove("hidden");
		$(".messages .allMessages").classList.remove("obscured");
	}

	// Show a channel
	function showMessages(path) {
		ajax({
			type: "POST",
			url: "api/message-get-list",
			sendToken: true,
			data: {
				path: path
			},
			callback: showMessagesFromCallback
		});
	}

	function showMessagesFromCallback(error, response) {
		if (error) {
			$(".messages .allMessage").innerHTML = "Sorry, something went wrong";
			console.log(error);
			return;
		}
		var messages = JSON.parse(response);
		var messagesDiv = $(".messages .allMessages");
		messagesDiv.innerHTML = "";
		for (var i = 0; i < messages.length; i++) {
			var message = document.createElement("div");
			message.innerHTML = `${messages[i].author}: ${messages[i].text}`;
			messagesDiv.appendChild(message);
		}
	}

	// Send a message
	function submitMessage(e) {
		if (e) { e.preventDefault(); }
		var input = $(".messages .newMessageContainer .newMessageTextInput");
		ajax({
			type: "POST",
			url: "api/message-new",
			sendToken: true,
			data: {
				author: globals.username,
				text: input.value,
				path: globals.path
			},
			callback: submitMessageCallback
		});
		input.value = "";
	}

	function submitMessageCallback(error, response) {
		collapseNewMessageDiv();
		setTimeout(function() {
			showMessages(globals.path);
		}, 250);
	}
}