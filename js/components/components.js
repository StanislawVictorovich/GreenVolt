(function () {
	Vue.component("components-view", {
		template:
		'<div class="row g-3">' +
			'<div class="col-12 col-xl-4">' +
				'<div class="card app-panel p-3 shadow-sm mb-3">' +
					'<h5 class="mb-3">Создать комплектующую</h5>' +
					'<input v-model="name" class="form-control mb-2" placeholder="Название">' +
					'<button class="btn btn-success w-100" @click="add">Добавить</button>' +
					'<div class="text-muted small mt-2">MANAGER/ADMIN могут добавлять. Удалять — только ADMIN.</div>' +
				'</div>' +

				'<div class="card app-panel p-3 shadow-sm">' +
					'<h5 class="mb-3">Собрать комплектующую</h5>' +
					'<div class="row g-2">' +
						'<div class="col-8">' +
							'<select v-model="assembleId" class="form-select">' +
								'<option disabled value="">Выбери комплектующую</option>' +
								'<option v-for="c in components" :value="c.id">{{ c.name }}</option>' +
							'</select>' +
						'</div>' +
						'<div class="col-4"><input v-model="assembleQty" type="number" class="form-control" placeholder="Кол-во"></div>' +
					'</div>' +
					'<button class="btn btn-primary w-100 mt-2" :disabled="!assembleId" @click="assemble">Собрать (спишет детали)</button>' +
					'<div class="small text-muted mt-2">Нужен рецепт. Если деталей не хватает — сборка не пройдет.</div>' +
				'</div>' +
			'</div>' +

			'<div class="col-12 col-xl-8">' +
				'<div class="card app-panel p-3 shadow-sm">' +
					'<div class="d-flex align-items-center justify-content-between mb-2">' +
						'<h5 class="mb-0">Склад комплектующих</h5>' +
						'<span class="text-muted small">Удаление только ADMIN</span>' +
					'</div>' +
					'<div class="table-responsive">' +
						'<table class="table table-sm">' +
							'<thead><tr><th>Название</th><th class="text-end">Кол-во</th><th class="text-end">Себест. 1шт</th><th class="text-end">Рецепт</th><th class="text-end">Действия</th></tr></thead>' +
							'<tbody>' +
								'<tr v-for="c in components" :key="c.id">' +
									'<td>{{ c.name }}</td>' +
									'<td class="text-end">{{ c.qty }}</td>' +
									'<td class="text-end">{{ money(c.cost) }}</td>' +
									'<td class="text-end"><button class="btn btn-sm btn-outline-secondary" @click="editRecipe(c.id)">Редактировать</button></td>' +
									'<td class="text-end">' +
										'<button v-if="isAdmin" class="btn btn-sm btn-outline-danger" @click="del(c.id)">Удалить</button>' +
										'<span v-else class="text-muted">—</span>' +
									'</td>' +
								'</tr>' +
								'<tr v-if="components.length===0"><td colspan="5" class="text-center text-muted">Пока пусто</td></tr>' +
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
			components: function () { return this.$store.state.components; },
			isAdmin: function () { return this.$store.getters.isAdmin; }
		},
		methods: {
			money: function (v) { return Utils.round2(Utils.toNum(v)).toFixed(2); },
			add: function () {
				if (!this.name) return;
				this.$store.commit("ADD_COMPONENT", { name: this.name });
				this.name = "";
			},
			del: function (id) {
				if (!this.isAdmin) return;
				if (!confirm("Удалить комплектующую?")) return;
				this.$store.commit("DELETE_COMPONENT", id);
			},
			editRecipe: function (id) {
				this.$refs.recipeModal.openComponent(id);
			},
			assemble: function () {
				try {
					this.$store.commit("ASSEMBLE_COMPONENT", { componentId: this.assembleId, qty: Utils.toInt(this.assembleQty) });
					alert("Готово. Детали списаны, комплектующая добавлена.");
				} catch (e) {
					alert(e.message || e);
				}
			}
		}
	});
})(); 
