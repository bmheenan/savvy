mainView();

function mainView() {
	load({
		path: "sidebar/sidebar.html",
		stage: ".sidebar",
		callback: () => { load({ path: "sidebar/sidebar.js" }); }
	});
	load({
		path: "messages/messages.html",
		stage: ".messages",
		callback: () => { load({ path: "messages/messages.js" }); }
	});
}