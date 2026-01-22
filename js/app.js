new Vue({
	el: "#app",
	store: AppStore,
	template:
	'<div>' +
		'<login-view v-if="!$store.getters.isAuth"></login-view>' +
		'<main-view v-else></main-view>' +
	'</div>'
});
