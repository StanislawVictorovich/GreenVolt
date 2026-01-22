(function () {
	Vue.component("login-view", {
		template:
		'<div class="card p-3">' +
			'<input v-model="l" class="form-control mb-2" placeholder="login">' +
			'<input v-model="p" type="password" class="form-control mb-2" placeholder="password">' +
			'<button class="btn btn-primary" @click="go">Login</button>' +
		'</div>',
		data: function () {
			return { l: "", p: "" };
		},
		methods: {
			go: function () {
				var u = this.$store.state.users.find(function (x) {
					return x.login === this.l && x.password === this.p;
				}.bind(this));
				if (u) this.$store.commit("LOGIN", u);
			}
		}
	});

	Vue.component("main-view", {
		template:
		'<div>' +
			'<h5>Детали</h5>' +
			'<input v-model="p" class="form-control mb-2">' +
			'<button class="btn btn-success mb-3" @click="addPart">+</button>' +

			'<h5>Комплектующие</h5>' +
			'<input v-model="c" class="form-control mb-2">' +
			'<button class="btn btn-success mb-3" @click="addComp">+</button>' +

			'<h5>Устройства</h5>' +
			'<input v-model="d" class="form-control mb-2">' +
			'<button class="btn btn-success" @click="addDev">+</button>' +
		'</div>',
		data: function () {
			return { p: "", c: "", d: "" };
		},
		methods: {
			addPart: function () { this.$store.commit("ADD_PART", this.p); this.p = ""; },
			addComp: function () { this.$store.commit("ADD_COMPONENT", this.c); this.c = ""; },
			addDev: function () { this.$store.commit("ADD_DEVICE", this.d); this.d = ""; }
		}
	});
})();
