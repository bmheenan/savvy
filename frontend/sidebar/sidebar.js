"use strict";
sidebar();

function sidebar() {
	// Setup UI
	$("#logoutButton").addEventListener("click", logout);
	$(".sidebar .newChannel .expandButton").addEventListener("click", showNewChannel);
	$(".sidebar .newChannel .collapseButton").addEventListener("click", hideNewChannel);
	$(".sidebar .newChannel .newChannelSubmit").addEventListener("click", newChannel);

	goToChannelPath([globals.group]);

	function goToChannel(e) {
		var path = e.target.dataset.channel.split(",");
		goToChannelPath(path);
	}
	
	function goToChannelPath(path) {
		var breadcrumbs = "";
		for (var i = 0; i < path.length - 1; i++) {
			breadcrumbs += `<a href="#" class="breadcrumb" data-channel="${path.slice(0, i + 1)}">${path[i]}</a>`;
		}
		$(".breadcrumbs").innerHTML = breadcrumbs;
		var breadcrumbDivs = $$(".sidebar .breadcrumb");
		for (var i = 0; i < breadcrumbDivs.length; i++) {
			breadcrumbDivs[i].addEventListener("click", goToChannel);
		}
		globals.path = path;
		$(".sidebar .subchannels").innerHTML = "...";
		$(".currentChannel").innerHTML = path[path.length - 1];
		ajax({
			type: "POST",
			url: "api/channel-get-list",
			data: { path: path },
			sendToken: true,
			callback: onChannelsReturned
		});
		globals.messages_showMessages(globals.path);

	}

	function onChannelsReturned(error, response) {
		const channels = JSON.parse(response);
		var channelList = "";
		for (var i = 0; i < channels.length; i++) {
			channelList += `<a href="#" class="subchannel" data-channel="${channels[i].path.join()}">${channels[i].name}</a>`;
		}
		$(".sidebar .subchannels").innerHTML = channelList;
		var channelsDivs = $$(".sidebar .subchannel");
		for (var i = 0; i < channelsDivs.length; i++) {
			channelsDivs[i].addEventListener("click", goToChannel);
		}
	}

	function logout(e) {
		e.preventDefault();
		globals.jsonWebToken = undefined;
		deleteCookie("jsonWebToken");
		location.reload();
	}

	function showNewChannel(e) {
		if (e) { e.preventDefault(); }
		$(".sidebar .newChannel .expandButton").classList.add("hidden");
		$(".sidebar .newChannel .expanded").classList.remove("hidden");
	}

	function hideNewChannel(e) {
		if (e) { e.preventDefault(); }
		$(".sidebar .newChannel .expandButton").classList.remove("hidden");
		$(".sidebar .newChannel .expanded").classList.add("hidden");
	}

	function newChannel(e) {
		var channelName = $(".sidebar .newChannel .input input").value;
		if (channelName.length > 0) {
			ajax({
				type: "POST",
				url: "api/channel-new",
				data: {
					name: channelName,
					parent: globals.path
				},
				sendToken: true,
				callback: (error, response) => { channelDone(error, response, channelName) }
			});
		}

		function channelDone(error, response, name) {
			if (error) {
				console.log("ERROR: " + error);
			} else {
				globals.path.push(name);
				goToChannelPath(globals.path);
				$(".sidebar .newChannel .input input").value = "";
				hideNewChannel();
			}
		}
	}
}