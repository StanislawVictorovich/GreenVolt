new Vue({
	el: "#app",
	store: AppStore,
	template:
	'<div>' +
		'<app-login v-if="!$store.getters.isAuth"></app-login>' +
		'<app-shell v-else></app-shell>' +
	'</div>'
});
