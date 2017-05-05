go();

function go() {
	ajax({
		type: "GET",
		url: "api/test-hello",
		sendToken: true,
		callback: populateHelloMessage
	})
}

function populateHelloMessage(error, response) {
	if (error) {
		console.log("Error trying to get hello message");
		console.log(error);
		return;
	}
	$(".messages .helloMessage").innerHTML = JSON.parse(response).message;
}