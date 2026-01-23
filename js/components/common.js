(function () {
	Vue.component("app-login", {
		template:
		'<div class="row justify-content-center">' +
			'<div class="col-12 col-md-4">' +
				'<div class="card app-panel p-3 shadow-sm" @keyup.enter="doLogin">' +
					'<h5 class="mb-3">Вход</h5>' +
					'<input v-model="login" class="form-control mb-2" placeholder="login">' +
					'<input v-model="password" type="password" class="form-control mb-3" placeholder="password">' +
					'<button class="btn btn-primary w-100" @click="doLogin">Войти</button>' +
				'</div>' +
			'</div>' +
		'</div>',
		data: function () {
			return { login: "", password: "" };
		},
		methods: {
			doLogin: function () {
				var users = this.$store.state.users;
				for (var i = 0; i < users.length; i++) {
					if (users[i].login === this.login && users[i].password === this.password) {
						this.$store.commit("LOGIN", users[i]);
						return;
					}
				}
				alert("Неверный логин или пароль");
			}
		}
	});

	Vue.component("app-header", {
		template:
		'<div class="app-header p-2 px-3 mb-3 d-flex align-items-center justify-content-between">' +
			'<div>' +
				'<div class="h5 mb-0">Mini ERP</div>' +
				'<div class="small text-muted">Vue 2.6 + Vuex (CDN) + Bootstrap 5.3</div>' +
			'</div>' +
			'<div class="text-end">' +
				'<div><b>{{ user.login }}</b> <span class="badge text-bg-secondary">{{ user.role }}</span></div>' +
				'<button class="btn btn-sm btn-outline-danger mt-1" @click="logout">Выйти</button>' +
			'</div>' +
		'</div>',
		computed: {
			user: function () {
				return this.$store.getters.user;
			}
		},
		methods: {
			logout: function () {
				this.$store.commit("LOGOUT");
			}
		}
	});

	Vue.component("app-shell", {
		template:
		'<div>' +
			'<app-header></app-header>' +
			'<div class="row g-3">' +
				'<div class="col-12 col-lg-2">' +
					'<div class="card app-panel p-2 shadow-sm">' +
						'<div class="nav flex-lg-column nav-pills">' +
							'<a href="#" class="nav-link" :class="{active: tab===\'parts\'}" @click.prevent="tab=\'parts\'">Детали</a>' +
							'<a href="#" class="nav-link" :class="{active: tab===\'components\'}" @click.prevent="tab=\'components\'">Комплектующие</a>' +
							'<a href="#" class="nav-link" :class="{active: tab===\'devices\'}" @click.prevent="tab=\'devices\'">Устройства</a>' +
							'<a href="#" class="nav-link" :class="{active: tab===\'backup\'}" @click.prevent="tab=\'backup\'">Бэкап</a>' +
							'<a href="#" class="nav-link" :class="{active: tab===\'logs\'}" @click.prevent="tab=\'logs\'">Журнал</a>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="col-12 col-lg-10">' +
					'<parts-view v-if="tab===\'parts\'"></parts-view>' +
					'<components-view v-if="tab===\'components\'"></components-view>' +
					'<devices-view v-if="tab===\'devices\'"></devices-view>' +
					'<backup-view v-if="tab===\'backup\'"></backup-view>' +
					'<logs-view v-if="tab===\'logs\'"></logs-view>' +
				'</div>' +
			'</div>' +
		'</div>',
		data: function () {
			return { tab: "parts" };
		}
	});

	Vue.component("logs-view", {
		template:
		'<div class="card app-panel p-3 shadow-sm">' +
			'<div class="d-flex align-items-center justify-content-between mb-2">' +
				'<h5 class="mb-0">Журнал действий</h5>' +
				'<span class="text-muted small">последние 200</span>' +
			'</div>' +
			'<div class="table-responsive">' +
				'<table class="table table-sm">' +
					'<thead><tr><th>Время</th><th>Тип</th><th>Данные</th></tr></thead>' +
					'<tbody>' +
						'<tr v-for="l in logs" :key="l.id">' +
							'<td class="mono">{{ fmt(l.ts) }}</td>' +
							'<td class="mono">{{ l.type }}</td>' +
							'<td class="mono small">{{ json(l.payload) }}</td>' +
						'</tr>' +
						'<tr v-if="logs.length===0"><td colspan="3" class="text-center text-muted">Пусто</td></tr>' +
					'</tbody>' +
				'</table>' +
			'</div>' +
		'</div>',
		computed: {
			logs: function () {
				var list = this.$store.state.logs || [];
				var out = list.slice(-200);
				out.reverse();
				return out;
			}
		},
		methods: {
			fmt: function (ts) {
				var d = new Date(ts);
				var p2 = function (n) { return (n < 10 ? "0" : "") + n; };
				return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
			},
			json: function (obj) {
				try { return JSON.stringify(obj); } catch (e) { return ""; }
			}
		}
	});

	Vue.component("recipe-modal", {
		template:
		'<div class="modal fade" tabindex="-1" ref="m">' +
			'<div class="modal-dialog modal-lg">' +
				'<div class="modal-content">' +
					'<div class="modal-header">' +
						'<h5 class="modal-title">{{ title }}</h5>' +
						'<button type="button" class="btn-close" @click="close"></button>' +
					'</div>' +
					'<div class="modal-body">' +
						'<div class="small text-muted mb-2">{{ hint }}</div>' +
						'<div class="row g-2 align-items-end mb-2">' +
							'<div class="col-7">' +
								'<select v-model="newId" class="form-select">' +
									'<option disabled value="">Выбери</option>' +
									'<option v-for="o in options" :value="o.id">{{ o.label }}</option>' +
								'</select>' +
							'</div>' +
							'<div class="col-3"><input v-model="newQty" type="number" class="form-control" placeholder="Кол-во"></div>' +
							'<div class="col-2"><button class="btn btn-success w-100" @click="addRow">+</button></div>' +
						'</div>' +
						'<div class="table-responsive">' +
							'<table class="table table-sm">' +
								'<thead><tr><th>Позиция</th><th class="text-end">Кол-во</th><th class="text-end">Удалить</th></tr></thead>' +
								'<tbody>' +
									'<tr v-for="(r,idx) in rows" :key="idx">' +
										'<td>{{ nameOf(r) }}</td>' +
										'<td class="text-end">{{ r.qty }}</td>' +
										'<td class="text-end"><button class="btn btn-sm btn-outline-danger" @click="remove(idx)">x</button></td>' +
									'</tr>' +
									'<tr v-if="rows.length===0"><td colspan="3" class="text-center text-muted">Рецепт пуст</td></tr>' +
								'</tbody>' +
							'</table>' +
						'</div>' +
					'</div>' +
					'<div class="modal-footer">' +
						'<button class="btn btn-primary" @click="save">Сохранить</button>' +
						'<button class="btn btn-outline-secondary" @click="close">Закрыть</button>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>',
		data: function () {
			return {
				bs: null,
				mode: null,
				targetId: null,
				title: "",
				hint: "",
				rows: [],
				newId: "",
				newQty: 1,
				options: [],
				nameMap: {}
			};
		},
		methods: {
			openComponent: function (componentId) {
				this.mode = "component";
				this.targetId = componentId;
				this.title = "Рецепт комплектующей";
				this.hint = "Список деталей и их количество на 1 шт комплектующей.";
				this.rows = Utils.clone(this.$store.getters.recipeForComponent(componentId));
				this.newId = "";
				this.newQty = 1;
				this.options = [];
				this.nameMap = {};
				var parts = this.$store.state.parts;
				for (var i = 0; i < parts.length; i++) {
					this.options.push({ id: parts[i].id, label: parts[i].name + " (есть: " + parts[i].qty + ")" });
					this.nameMap[parts[i].id] = parts[i].name;
				}
				this.open();
			},
			openDevice: function (deviceId) {
				this.mode = "device";
				this.targetId = deviceId;
				this.title = "Рецепт устройства";
				this.hint = "Список комплектующих и их количество на 1 шт устройства.";
				this.rows = Utils.clone(this.$store.getters.recipeForDevice(deviceId));
				this.newId = "";
				this.newQty = 1;
				this.options = [];
				this.nameMap = {};
				var comps = this.$store.state.components;
				for (var i = 0; i < comps.length; i++) {
					this.options.push({ id: comps[i].id, label: comps[i].name + " (есть: " + comps[i].qty + ")" });
					this.nameMap[comps[i].id] = comps[i].name;
				}
				this.open();
			},
			open: function () {
				if (!this.bs) this.bs = new bootstrap.Modal(this.$refs.m);
				this.bs.show();
			},
			close: function () {
				if (this.bs) this.bs.hide();
			},
			addRow: function () {
				if (!this.newId) return;
				var q = Utils.toInt(this.newQty);
				if (q <= 0) return;
				if (this.mode === "component") {
					this.rows.push({ partId: this.newId, qty: q });
				} else {
					this.rows.push({ componentId: this.newId, qty: q });
				}
				this.newId = "";
				this.newQty = 1;
			},
			remove: function (idx) {
				this.rows.splice(idx, 1);
			},
			nameOf: function (row) {
				return this.mode === "component" ? (this.nameMap[row.partId] || row.partId) : (this.nameMap[row.componentId] || row.componentId);
			},
			save: function () {
				if (!this.targetId) return;
				if (this.mode === "component") {
					this.$store.commit("SET_COMPONENT_RECIPE", { componentId: this.targetId, rows: this.rows });
				} else {
					this.$store.commit("SET_DEVICE_RECIPE", { deviceId: this.targetId, rows: this.rows });
				}
				this.close();
			}
		}
	});
})(); 
