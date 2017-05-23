"use strict";
sidebar();

function sidebar() {
	// Setup UI
	$("#logoutButton").addEventListener("click", logout);
	$(".sidebar .newChannel .expandButton").addEventListener("click", showNewChannel);
	$(".sidebar .newChannel .collapseButton").addEventListener("click", hideNewChannel);
	$(".sidebar .newChannel .newChannelSubmit").addEventListener("click", newChannel);
	
	// Get channels for group
	ajax({
		type: "POST",
		url: "api/channel-get-list",
		data: { path: [globals.group] },
		sendToken: true,
		callback: onChannelsReturned
	});
	
	$(".currentChannel").innerHTML = globals.group;
	
	function onChannelsReturned(error, response) {
		const channels = JSON.parse(response);
		var channelList = "";
		for (var i in channels) {
			channelList += `<a href="#" class="subchannel" data-channel="${channels[i].name}">${channels[i].name}</a>`;
		}
		$(".sidebar .subchannels").innerHTML = channelList;
		var channelsDivs = $$(".sidebar .subchannel");
		for (var i = 0; i < channelsDivs.length; i++) {
			channelsDivs[i].addEventListener("click", goToChannel);
		}
	}
	
	function goToChannel(e) {
		console.log(e.target.dataset.channel);
	}

	function logout(e) {
		e.preventDefault();
		globals.jsonWebToken = undefined;
		deleteCookie("jsonWebToken");
		location.reload();
	}

	function showNewChannel(e) {
		e.preventDefault();
		$(".sidebar .newChannel .expandButton").classList.add("hidden");
		$(".sidebar .newChannel .expanded").classList.remove("hidden");
	}

	function hideNewChannel(e) {
		e.preventDefault();
		$(".sidebar .newChannel .expandButton").classList.remove("hidden");
		$(".sidebar .newChannel .expanded").classList.add("hidden");
	}

	function newChannel(e) {
		var channelName = $(".sidebar .newChannel .input input").value;
		if (channelName.length > 0) {
			ajax({
				type: "POST",
				url: "api/channel-new",
				data: { name: channelName },
				sendToken: true,
				callback: channelDone
			});
		}

		function channelDone(error, response) {
			if (error) {
				console.log("ERROR: " + error);
			} else {
				console.log(response);
			}
		}
	}
}