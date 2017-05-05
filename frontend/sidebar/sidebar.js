go();

function go() {
	$("#logoutButton").addEventListener("click", logout);
}

function logout(e) {
	e.preventDefault();
	alert("Refresh to log out");
}