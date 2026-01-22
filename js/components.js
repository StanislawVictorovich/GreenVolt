(function(){
	Vue.component('login-view',{
		template:'<div class="card p-3" @keyup.enter="login"><input v-model="l" class="form-control mb-2"><input v-model="p" type="password" class="form-control mb-2"><button class="btn btn-primary w-100" @click="login">Войти</button></div>',
		data:function(){return{l:'',p:''}},
		methods:{login:function(){var u=this.$store.state.users.find(function(x){return x.login===this.l&&x.password===this.p}.bind(this));if(u)this.$store.commit('LOGIN',u);}}
	});
	Vue.component('main-view',{template:'<div class="alert alert-success">Успешный вход</div>'});
})();
