(function () {
	var KEY = "mini_erp_store";

	function state() {
		return {
			auth: null,
			users: [
				{ login: "admin", password: "admin", role: "ADMIN" },
				{ login: "manager", password: "manager", role: "MANAGER" }
			],
			parts: [],
			components: [],
			devices: [],
			recipes: { component: {}, device: {} }
		};
	}

	var store = new Vuex.Store({
		state: JSON.parse(localStorage.getItem(KEY)) || state(),
		getters: {
			isAuth: function (s) { return !!s.auth; },
			role: function (s) { return s.auth ? s.auth.role : null; },
			isAdmin: function (s, g) { return g.role === "ADMIN"; }
		},
		mutations: {
			LOGIN: function (s, u) { s.auth = u; },
			LOGOUT: function (s) { s.auth = null; },

			ADD_PART: function (s, p) {
				s.parts.push({ id: Utils.uid("p"), name: p, qty: 0 });
			},
			ADD_COMPONENT: function (s, c) {
				s.components.push({ id: Utils.uid("c"), name: c, qty: 0 });
				s.recipes.component[s.components[s.components.length - 1].id] = [];
			},
			ADD_DEVICE: function (s, d) {
				s.devices.push({ id: Utils.uid("d"), name: d, qty: 0 });
				s.recipes.device[s.devices[s.devices.length - 1].id] = [];
			}
		}
	});

	store.subscribe(function (m, s) {
		localStorage.setItem(KEY, JSON.stringify(s));
	});

	window.AppStore = store;
})();
