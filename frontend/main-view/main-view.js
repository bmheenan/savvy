mainView();

function mainView() {
	
	load({
		path: "messages/messages.html",
		stage: ".messages",
		callback: () => {
			load({
				path: "messages/messages.js",
				callback: () => {
					load({
						path: "sidebar/sidebar.html",
						stage: ".sidebar",
						callback: () => {
							load({ path: "sidebar/sidebar.js" });
						}
					});
				}
			});
		}
	});
}