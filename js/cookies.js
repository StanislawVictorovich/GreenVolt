(function () {
	function setCookie(name, value, hours) {
		var d = new Date();
		d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
	}

	function getCookie(name) {
		var n = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i].trim();
			if (c.indexOf(n) === 0) {
				return decodeURIComponent(c.substring(n.length, c.length));
			}
		}
		return null;
	}

	function deleteCookie(name) {
		document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	}

	window.CookieUtil = {
		set: setCookie,
		get: getCookie,
		del: deleteCookie
	};
})(); 
