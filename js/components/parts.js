(function () {
	Vue.component("parts-view", {
		template:
		'<div class="row g-3">' +
			'<div class="col-12 col-xl-4">' +
				'<div class="card app-panel p-3 shadow-sm mb-3">' +
					'<h5 class="mb-3">Добавить деталь</h5>' +
					'<div class="mb-2"><input v-model="name" class="form-control" placeholder="Название"></div>' +
					'<div class="row g-2 mb-2">' +
						'<div class="col-6"><input v-model="qty" type="number" class="form-control" placeholder="Количество"></div>' +
						'<div class="col-6"><input v-model="cost" type="number" class="form-control" placeholder="Цена за 1"></div>' +
					'</div>' +
					'<button class="btn btn-success w-100" @click="add">Добавить</button>' +
					'<div class="text-muted small mt-2">MANAGER: может добавлять. ADMIN: может добавлять и удалять.</div>' +
				'</div>' +

				'<div class="card app-panel p-3 shadow-sm">' +
					'<h5 class="mb-3">Поступление (закупка)</h5>' +
					'<div class="row g-2">' +
						'<div class="col-7">' +
							'<select v-model="purchasePartId" class="form-select">' +
								'<option disabled value="">Выбери деталь</option>' +
								'<option v-for="p in parts" :value="p.id">{{ p.name }}</option>' +
							'</select>' +
						'</div>' +
						'<div class="col-3"><input v-model="purchaseQty" type="number" class="form-control" placeholder="Кол-во"></div>' +
						'<div class="col-2"><button class="btn btn-primary w-100" @click="purchase">+</button></div>' +
					'</div>' +
					'<div class="row g-2 mt-2">' +
						'<div class="col-12"><input v-model="purchaseCost" type="number" class="form-control" placeholder="Цена за 1 (если надо обновить себестоимость)"></div>' +
					'</div>' +
				'</div>' +
			'</div>' +

			'<div class="col-12 col-xl-8">' +
				'<div class="card app-panel p-3 shadow-sm">' +
					'<div class="d-flex align-items-center justify-content-between mb-2">' +
						'<h5 class="mb-0">Склад деталей</h5>' +
						'<span class="text-muted small">Удаление только ADMIN</span>' +
					'</div>' +
					'<div class="table-responsive">' +
						'<table class="table table-sm">' +
							'<thead><tr><th>Название</th><th class="text-end">Кол-во</th><th class="text-end">Себест. avg</th><th class="text-end">Действия</th></tr></thead>' +
							'<tbody>' +
								'<tr v-for="p in parts" :key="p.id">' +
									'<td>{{ p.name }}</td>' +
									'<td class="text-end">{{ p.qty }}</td>' +
									'<td class="text-end">{{ money(p.cost) }}</td>' +
									'<td class="text-end">' +
										'<button v-if="isAdmin" class="btn btn-sm btn-outline-danger" @click="del(p.id)">Удалить</button>' +
										'<span v-else class="text-muted">—</span>' +
									'</td>' +
								'</tr>' +
								'<tr v-if="parts.length===0"><td colspan="4" class="text-center text-muted">Пока пусто</td></tr>' +
							'</tbody>' +
						'</table>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>',
		data: function () {
			return {
				name: "",
				qty: 0,
				cost: 0,
				purchasePartId: "",
				purchaseQty: 0,
				purchaseCost: 0
			};
		},
		computed: {
			parts: function () { return this.$store.state.parts; },
			isAdmin: function () { return this.$store.getters.isAdmin; }
		},
		methods: {
			money: function (v) { return Utils.round2(Utils.toNum(v)).toFixed(2); },
			add: function () {
				if (!this.name) return;
				this.$store.commit("ADD_PART", { name: this.name, qty: Utils.toInt(this.qty), cost: Utils.toNum(this.cost) });
				this.name = "";
				this.qty = 0;
				this.cost = 0;
			},
			del: function (id) {
				if (!this.isAdmin) return;
				if (!confirm("Удалить деталь?")) return;
				this.$store.commit("DELETE_PART", id);
			},
			purchase: function () {
				if (!this.purchasePartId) return;
				var q = Utils.toInt(this.purchaseQty);
				if (q <= 0) return;
				this.$store.commit("PURCHASE_PARTS", { rows: [{ partId: this.purchasePartId, qty: q, cost: Utils.toNum(this.purchaseCost) }] });
				this.purchaseQty = 0;
				this.purchaseCost = 0;
			}
		}
	});
})(); 
