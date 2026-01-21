new Vue({
  el: '#app',
  store: store,
  data: function () {
    return {
      login: '',
      password: '',
      partName: '',
      partQty: 0
    };
  },
  computed: {
    isAuth: function () {
      return !!this.$store.state.authUser;
    },
    user: function () {
      return this.$store.state.authUser;
    },
    parts: function () {
      return this.$store.state.parts;
    }
  },
  methods: {
    doLogin: function () {
      var users = this.$store.state.users;
      for (var i = 0; i < users.length; i++) {
        if (users[i].login === this.login && users[i].password === this.password) {
          this.$store.commit('LOGIN', users[i]);
          return;
        }
      }
      alert('Неверный логин или пароль');
    },
    logout: function () {
      this.$store.commit('LOGOUT');
    },
    addPart: function () {
      if (!this.partName || !this.partQty) return;
      this.$store.commit('ADD_PART', {
        id: Date.now(),
        name: this.partName,
        qty: this.partQty
      });
      this.partName = '';
      this.partQty = 0;
    },
    exportDB: function () {
      var data = JSON.stringify(this.$store.state, null, 2);
      var blob = new Blob([data], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mini-erp-backup.json';
      a.click();
    },
    importDB: function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var r = new FileReader();
      var self = this;
      r.onload = function () {
        var json = JSON.parse(r.result);
        self.$store.commit('REPLACE_STATE', json);
      };
      r.readAsText(file);
    }
  }
});
