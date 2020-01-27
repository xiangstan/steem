Vue.config.devtools=true;

const store = new Vuex.Store({
  state: {
    main: {
      steemId: false,
      profile: {},
      tokens: {}
    }
  },
  mutations: {
    updateMainSteemId(state, value){
      state.main.steemId = value;
    }
  },
});

const App=new window.Vue({
  el: "#app",
  store,
  components:{
    "App": window.httpVueLoader("./js/components/App.vue")
  },
  template:"<App></App>"
});

if(typeof window.__VUE_DEVTOOLS_GLOBAL_HOOK__!=="undefined"){
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = App.constructor;
}
