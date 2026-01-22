(function () {
	Vue.component("devices-view", {
		template:
		'<div class="row g-3">' +
			'<div class="col-12 col-xl-4">' +
				'<div class="card app-panel p-3 shadow-sm mb-3">' +
					'<h5 class="mb-3">Создать устройство</h5>' +
					'<input v-model="name" class="form-control mb-2" placeholder="Название">' +
					'<button class="btn btn-success w-100" @click="add">Добавить</button>' +
					'<div class="text-muted small mt-2">MANAGER/ADMIN могут добавлять. Удалять — только ADMIN.</div>' +
				'</div>' +

				'<div class="card app-panel p-3 shadow-sm">' +
					'<h5 class="mb-3">Собрать устройство</h5>' +
					'<div class="row g-2">' +
						'<div class="col-8">' +
							'<select v-model="assembleId" class="form-select">' +
								'<option disabled value="">Выбери устройство</option>' +
								'<option v-for="d in devices" :value="d.id">{{ d.name }}</option>' +
							'</select>' +
						'</div>' +
						'<div class="col-4"><input v-model="assembleQty" type="number" class="form-control" placeholder="Кол-во"></div>' +
					'</div>' +
					'<button class="btn btn-primary w-100 mt-2" :disabled="!assembleId" @click="assemble">Собрать (спишет комплектующие)</button>' +
					'<div class="small text-muted mt-2">Нужен рецепт. Если комплектующих не хватает — сборка не пройдет.</div>' +
				'</div>' +
			'</div>' +

			'<div class="col-12 col-xl-8">' +
				'<div class="card app-panel p-3 shadow-sm">' +
					'<div class="d-flex align-items-center justify-content-between mb-2">' +
						'<h5 class="mb-0">Склад устройств</h5>' +
						'<span class="text-muted small">Удаление только ADMIN</span>' +
					'</div>' +
					'<div class="table-responsive">' +
						'<table class="table table-sm">' +
							'<thead><tr><th>Название</th><th class="text-end">Кол-во</th><th class="text-end">Себест. 1шт</th><th class="text-end">Рецепт</th><th class="text-end">Действия</th></tr></thead>' +
							'<tbody>' +
								'<tr v-for="d in devices" :key="d.id">' +
									'<td>{{ d.name }}</td>' +
									'<td class="text-end">{{ d.qty }}</td>' +
									'<td class="text-end">{{ money(d.cost) }}</td>' +
									'<td class="text-end"><button class="btn btn-sm btn-outline-secondary" @click="editRecipe(d.id)">Редактировать</button></td>' +
									'<td class="text-end">' +
										'<button v-if="isAdmin" class="btn btn-sm btn-outline-danger" @click="del(d.id)">Удалить</button>' +
										'<span v-else class="text-muted">—</span>' +
									'</td>' +
								'</tr>' +
								'<tr v-if="devices.length===0"><td colspan="5" class="text-center text-muted">Пока пусто</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<recipe-modal ref="recipeModal"></recipe-modal>' +
		'</div>',
		data: function () {
			return {
				name: "",
				assembleId: "",
				assembleQty: 1
			};
		},
		computed: {
			devices: function () { return this.$store.state.devices; },
			isAdmin: function () { return this.$store.getters.isAdmin; }
		},
		methods: {
			money: function (v) { return Utils.round2(Utils.toNum(v)).toFixed(2); },
			add: function () {
				if (!this.name) return;
				this.$store.commit("ADD_DEVICE", { name: this.name });
				this.name = "";
			},
			del: function (id) {
				if (!this.isAdmin) return;
				if (!confirm("Удалить устройство?")) return;
				this.$store.commit("DELETE_DEVICE", id);
			},
			editRecipe: function (id) {
				this.$refs.recipeModal.openDevice(id);
			},
			assemble: function () {
				try {
					this.$store.commit("ASSEMBLE_DEVICE", { deviceId: this.assembleId, qty: Utils.toInt(this.assembleQty) });
					alert("Готово. Комплектующие списаны, устройство добавлено.");
				} catch (e) {
					alert(e.message || e);
				}
			}
		}
	});
})(); 
