(function () {
	Vue.component("backup-view", {
		template:
		'<div class="card app-panel p-3 shadow-sm">' +
			'<h5 class="mb-3">Бэкап / восстановление</h5>' +
			'<div class="d-flex flex-wrap gap-2 mb-2">' +
				'<button class="btn btn-outline-secondary" @click="exportAll">Экспорт всей базы (JSON)</button>' +
				'<label class="btn btn-outline-primary mb-0">Импорт базы<input type="file" class="d-none" @change="importAll"></label>' +
				'<button class="btn btn-outline-danger" v-if="isAdmin" @click="clearAll">Сбросить всё (ADMIN)</button>' +
			'</div>' +
			'<div class="text-muted small">Импорт заменяет базу целиком. Авторизация берётся из cookie.</div>' +
		'</div>',
		computed: {
			isAdmin: function () { return this.$store.getters.isAdmin; }
		},
		methods: {
			exportAll: function () {
				Utils.downloadJson("mini-erp-backup.json", this.$store.state);
			},
			importAll: function (e) {
				var file = e.target.files[0];
				if (!file) return;
				var self = this;
				Utils.readJsonFile(file, function (json) {
					if (!json || !json.meta || json.meta.version !== 1) {
						alert("Неверный формат бэкапа или версия.");
						return;
					}
					self.$store.commit("REPLACE_STATE", json);
					alert("База восстановлена.");
				}, function () {
					alert("Не удалось прочитать файл.");
				});
				e.target.value = "";
			},
			clearAll: function () {
				if (!confirm("Сбросить ВСЮ базу?")) return;
				this.$store.commit("CLEAR_ALL");
				alert("Готово.");
			}
		}
	});
})(); 
