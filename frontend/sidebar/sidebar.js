go();

function go() {
	$("#logoutButton").addEventListener("click", logout);
}

function logout(e) {
	e.preventDefault();
	jsonWebToken = undefined;
	deleteCookie("jsonWebToken");
	location.reload();
}