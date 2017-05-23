messages();

function messages() {
	/*ajax({
		type: "GET",
		url: "api/test-hello",
		sendToken: true,
		callback: populateHelloMessage
	});*/
	$(".newMessageContainer .collapsed").addEventListener("click", expandNewMessageDiv);
	$(".newMessageContainer .hideButton").addEventListener("click", collapseNewMessageDiv);

	/*function populateHelloMessage(error, response) {
		if (error) {
			console.log("Error trying to get hello message");
			console.log(error);
			return;
		}
		var allMessages = "";
		var message = JSON.parse(response).message;
		for (var i = 0; i < 100; i++) {
			allMessages += "<p>" + message + "</p>";
		}
		$(".messages .allMessages").innerHTML = allMessages;
	}*/

	function expandNewMessageDiv(event) {
		$(".newMessageContainer .expanded").classList.remove("hidden");
		$(".newMessageContainer .collapsed").classList.add("hidden");
		$(".messages .allMessages").classList.add("obscured");
	}

	function collapseNewMessageDiv(event) {
		$(".newMessageContainer .expanded").classList.add("hidden");
		$(".newMessageContainer .collapsed").classList.remove("hidden");
		$(".messages .allMessages").classList.remove("obscured");
	}
}