(function () {
	var STORAGE_KEY = "mini_erp_state_v1";
	var COOKIE_KEY = "mini_erp_auth_v1";

	function defaultState() {
		return {
			meta: {
				version: 1,
				lastSavedAt: Date.now()
			},
			auth: null,
			users: [
				{ id: "u_admin", login: "admin", password: "admin", role: "ADMIN" },
				{ id: "u_manager", login: "manager", password: "manager", role: "MANAGER" }
			],
			parts: [],
			components: [],
			devices: [],
			recipes: {
				component: {},	// componentId -> [{partId, qty}]
				device: {}		// deviceId -> [{componentId, qty}]
			},
			logs: []
		};
	}

	function loadState() {
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return null;
			var parsed = JSON.parse(raw);
			if (!parsed || !parsed.meta || parsed.meta.version !== 1) return null;
			return parsed;
		} catch (e) {
			return null;
		}
	}

	function saveState(state) {
		try {
			state.meta.lastSavedAt = Date.now();
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (e) {}
	}

	function loadAuthFromCookie() {
		try {
			var raw = CookieUtil.get(COOKIE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			return null;
		}
	}

	function saveAuthToCookie(auth) {
		try {
			CookieUtil.set(COOKIE_KEY, JSON.stringify(auth), 24);
		} catch (e) {}
	}

	function clearAuthCookie() {
		try {
			CookieUtil.del(COOKIE_KEY);
		} catch (e) {}
	}

	function findById(list, id) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].id === id) return list[i];
		}
		return null;
	}

	function ensureNonNeg(n) {
		return n < 0 ? 0 : n;
	}

	function canConsumeParts(state, recipeRows, multiplier) {
		multiplier = multiplier || 1;
		for (var i = 0; i < recipeRows.length; i++) {
			var r = recipeRows[i];
			var p = findById(state.parts, r.partId);
			if (!p) return { ok: false, msg: "Деталь не найдена: " + r.partId };
			var need = (r.qty || 0) * multiplier;
			if (p.qty < need) return { ok: false, msg: "Недостаточно детали: " + p.name + " (нужно " + need + ", есть " + p.qty + ")" };
		}
		return { ok: true };
	}

	function canConsumeComponents(state, recipeRows, multiplier) {
		multiplier = multiplier || 1;
		for (var i = 0; i < recipeRows.length; i++) {
			var r = recipeRows[i];
			var c = findById(state.components, r.componentId);
			if (!c) return { ok: false, msg: "Комплектующая не найдена: " + r.componentId };
			var need = (r.qty || 0) * multiplier;
			if (c.qty < need) return { ok: false, msg: "Недостаточно комплектующей: " + c.name + " (нужно " + need + ", есть " + c.qty + ")" };
		}
		return { ok: true };
	}

	function calcComponentUnitCost(state, componentId) {
		var recipe = state.recipes.component[componentId] || [];
		var sum = 0;
		for (var i = 0; i < recipe.length; i++) {
			var r = recipe[i];
			var p = findById(state.parts, r.partId);
			var cost = p ? (p.cost || 0) : 0;
			sum += (r.qty || 0) * cost;
		}
		return Utils.round2(sum);
	}

	function calcDeviceUnitCost(state, deviceId) {
		var recipe = state.recipes.device[deviceId] || [];
		var sum = 0;
		for (var i = 0; i < recipe.length; i++) {
			var r = recipe[i];
			var c = findById(state.components, r.componentId);
			var cCost = c ? (c.cost || 0) : 0;
			sum += (r.qty || 0) * cCost;
		}
		return Utils.round2(sum);
	}

	var initial = loadState() || defaultState();
	var cookieAuth = loadAuthFromCookie();
	if (cookieAuth && cookieAuth.login && cookieAuth.role) {
		initial.auth = cookieAuth;
	}

	var store = new Vuex.Store({
		state: initial,
		getters: {
			isAuth: function (s) { return !!s.auth; },
			user: function (s) { return s.auth; },
			role: function (s) { return s.auth ? s.auth.role : null; },
			isAdmin: function (s, g) { return g.role === "ADMIN"; },
			isManager: function (s, g) { return g.role === "MANAGER"; },
			recipeForComponent: function (s) { return function (componentId) { return s.recipes.component[componentId] || []; }; },
			recipeForDevice: function (s) { return function (deviceId) { return s.recipes.device[deviceId] || []; }; }
		},
		mutations: {
			LOGIN: function (s, user) {
				s.auth = { login: user.login, role: user.role };
				saveAuthToCookie(s.auth);
			},
			LOGOUT: function (s) {
				s.auth = null;
				clearAuthCookie();
			},

			ADD_PART: function (s, payload) {
				s.parts.push({ id: Utils.uid("p"), name: payload.name, qty: Utils.toInt(payload.qty), cost: Utils.toNum(payload.cost) });
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "ADD_PART", payload: payload });
			},
			DELETE_PART: function (s, id) {
				s.parts = s.parts.filter(function (x) { return x.id !== id; });
				for (var k in s.recipes.component) {
					s.recipes.component[k] = (s.recipes.component[k] || []).filter(function (r) { return r.partId !== id; });
				}
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "DELETE_PART", payload: { id: id } });
			},

			PURCHASE_PARTS: function (s, payload) {
				for (var i = 0; i < payload.rows.length; i++) {
					var r = payload.rows[i];
					var p = findById(s.parts, r.partId);
					if (!p) continue;
					var addQty = Utils.toInt(r.qty);
					var price = Utils.toNum(r.cost);
					if (addQty <= 0) continue;
					var oldValue = p.qty * (p.cost || 0);
					var newValue = addQty * price;
					var newQty = p.qty + addQty;
					if (price > 0) {
						p.cost = newQty > 0 ? Utils.round2((oldValue + newValue) / newQty) : p.cost;
					}
					p.qty = newQty;
				}
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "PURCHASE_PARTS", payload: payload });
			},

			ADD_COMPONENT: function (s, payload) {
				var id = Utils.uid("c");
				s.components.push({ id: id, name: payload.name, qty: 0, cost: 0 });
				s.recipes.component[id] = [];
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "ADD_COMPONENT", payload: payload });
			},
			DELETE_COMPONENT: function (s, id) {
				s.components = s.components.filter(function (x) { return x.id !== id; });
				delete s.recipes.component[id];
				for (var k in s.recipes.device) {
					s.recipes.device[k] = (s.recipes.device[k] || []).filter(function (r) { return r.componentId !== id; });
				}
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "DELETE_COMPONENT", payload: { id: id } });
			},

			ADD_DEVICE: function (s, payload) {
				var id = Utils.uid("d");
				s.devices.push({ id: id, name: payload.name, qty: 0, cost: 0 });
				s.recipes.device[id] = [];
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "ADD_DEVICE", payload: payload });
			},
			DELETE_DEVICE: function (s, id) {
				s.devices = s.devices.filter(function (x) { return x.id !== id; });
				delete s.recipes.device[id];
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "DELETE_DEVICE", payload: { id: id } });
			},

			SET_COMPONENT_RECIPE: function (s, payload) {
				s.recipes.component[payload.componentId] = payload.rows;
				var c = findById(s.components, payload.componentId);
				if (c) c.cost = calcComponentUnitCost(s, payload.componentId);
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "SET_COMPONENT_RECIPE", payload: payload });
			},
			SET_DEVICE_RECIPE: function (s, payload) {
				s.recipes.device[payload.deviceId] = payload.rows;
				var d = findById(s.devices, payload.deviceId);
				if (d) d.cost = calcDeviceUnitCost(s, payload.deviceId);
				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "SET_DEVICE_RECIPE", payload: payload });
			},

			ASSEMBLE_COMPONENT: function (s, payload) {
				var qty = Utils.toInt(payload.qty);
				if (qty <= 0) return;
				var recipe = s.recipes.component[payload.componentId] || [];
				if (!recipe.length) throw new Error("Рецепт пуст");
				var check = canConsumeParts(s, recipe, qty);
				if (!check.ok) throw new Error(check.msg);

				for (var i = 0; i < recipe.length; i++) {
					var r = recipe[i];
					var p = findById(s.parts, r.partId);
					p.qty = ensureNonNeg(p.qty - (r.qty * qty));
				}

				var c = findById(s.components, payload.componentId);
				if (c) c.qty += qty;
				if (c) c.cost = calcComponentUnitCost(s, payload.componentId);

				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "ASSEMBLE_COMPONENT", payload: payload });
			},

			ASSEMBLE_DEVICE: function (s, payload) {
				var qty = Utils.toInt(payload.qty);
				if (qty <= 0) return;
				var recipe = s.recipes.device[payload.deviceId] || [];
				if (!recipe.length) throw new Error("Рецепт пуст");
				var check = canConsumeComponents(s, recipe, qty);
				if (!check.ok) throw new Error(check.msg);

				for (var i = 0; i < recipe.length; i++) {
					var r = recipe[i];
					var c = findById(s.components, r.componentId);
					c.qty = ensureNonNeg(c.qty - (r.qty * qty));
				}

				var d = findById(s.devices, payload.deviceId);
				if (d) d.qty += qty;
				if (d) d.cost = calcDeviceUnitCost(s, payload.deviceId);

				s.logs.push({ id: Utils.uid("log"), ts: Date.now(), type: "ASSEMBLE_DEVICE", payload: payload });
			},

			REPLACE_STATE: function (s, payload) {
				for (var k in s) delete s[k];
				for (var k2 in payload) s[k2] = payload[k2];
				var cookieAuth = loadAuthFromCookie();
				if (cookieAuth && cookieAuth.login && cookieAuth.role) {
					s.auth = cookieAuth;
				}
			},

			CLEAR_ALL: function (s) {
				var st = defaultState();
				for (var k in s) delete s[k];
				for (var k2 in st) s[k2] = st[k2];
				clearAuthCookie();
			}
		}
	});

	store.subscribe(function (mutation, state) {
		saveState(state);
	});

	window.AppStore = store;
})(); 
