(function () {
	Vue.component("login-view", {
		template:
		'<div class="row justify-content-center">' +
			'<div class="col-12 col-md-4">' +
				'<div class="card p-3">' +
					'<h5 class="mb-3">Вход</h5>' +
					'<input v-model="login" class="form-control mb-2" placeholder="login">' +
					'<input v-model="password" type="password" class="form-control mb-3" placeholder="password">' +
					'<button class="btn btn-primary w-100" @click="doLogin">Войти</button>' +
				'</div>' +
			'</div>' +
		'</div>',
		data: function () {
			return {
				login: "",
				password: ""
			};
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

	Vue.component("main-view", {
		template:
		'<div>' +
			'<div class="d-flex justify-content-between align-items-center mb-3">' +
				'<h4>Mini ERP</h4>' +
				'<div>' +
					'<span class="me-2"><b>{{ user.login }}</b> ({{ user.role }})</span>' +
					'<button class="btn btn-sm btn-outline-danger" @click="logout">Выйти</button>' +
				'</div>' +
			'</div>' +
			'<div class="alert alert-info">Авторизация сохранена в cookie на 24 часа.</div>' +
			'<div class="card p-3">Главный экран системы. Дальше здесь будет ERP-логика.</div>' +
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
})(); 
