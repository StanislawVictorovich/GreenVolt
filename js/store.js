(function(){
	var store=new Vuex.Store({
		state:{auth:null,users:[{login:'admin',password:'admin',role:'ADMIN'},{login:'manager',password:'manager',role:'MANAGER'}]},
		getters:{isAuth:function(s){return !!s.auth}},
		mutations:{LOGIN:function(s,u){s.auth=u}}
	});
	window.AppStore=store;
})();
