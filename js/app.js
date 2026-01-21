new Vue({
  el: '#app',
  store,
  data: {
    login: '',
    password: '',
    partName: '',
    partQty: 0
  },
  computed: {
    isAuth() {
      return !!this.$store.state.authUser;
    },
    user() {
      return this.$store.state.authUser;
    },
    parts() {
      return this.$store.state.parts;
    }
  },
  methods: {
    doLogin() {
      const u = this.$store.state.users.find(
        x => x.login === this.login && x.password === this.password
      );
      if (u) this.$store.commit('LOGIN', u);
      else alert('Неверный логин');
    },
    logout() {
      this.$store.commit('LOGOUT');
    },
    addPart() {
      if (!this.partName || !this.partQty) return;
      this.$store.commit('ADD_PART', {
        id: Date.now(),
        name: this.partName,
        qty: this.partQty
      });
      this.partName = '';
      this.partQty = 0;
    },
    exportDB() {
      const data = JSON.stringify(this.$store.state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mini-erp-backup.json';
      a.click();
    },
    importDB(e) {
      const file = e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        const json = JSON.parse(r.result);
        this.$store.commit('REPLACE_STATE', json);
      };
      r.readAsText(file);
    }
  }
});
