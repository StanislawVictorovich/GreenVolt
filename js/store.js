(function () {
	var COOKIE_KEY = "mini_erp_auth";

	function loadAuth() {
		try {
			var raw = CookieUtil.get(COOKIE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			return null;
		}
	}

	var store = new Vuex.Store({
		state: {
			auth: loadAuth(),
			users: [
				{ login: "admin", password: "admin", role: "ADMIN" },
				{ login: "manager", password: "manager", role: "MANAGER" }
			]
		},
		getters: {
			isAuth: function (s) {
				return !!s.auth;
			},
			user: function (s) {
				return s.auth;
			}
		},
		mutations: {
			LOGIN: function (s, u) {
				s.auth = { login: u.login, role: u.role };
				CookieUtil.set(COOKIE_KEY, JSON.stringify(s.auth), 24);
			},
			LOGOUT: function (s) {
				s.auth = null;
				CookieUtil.del(COOKIE_KEY);
			}
		}
	});

	window.AppStore = store;
})(); 
