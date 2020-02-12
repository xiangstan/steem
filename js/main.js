Vue.config.devtools=true;

const store = new Vuex.Store({
  state: {
    curMHisPrice: false,
    loading: false,
    main: {
      steemId: false,
      profile: {},
      tokenExpand: false,
      tokens: {}
    },
    rewardFund: false,
    steemGlobalProps: false,
    msg: {
      alert: false,
      code: false,
      text: ""
    }
  },
  mutations: {
    setLoading(state, status) {
      state.loading = status;
    },
    /* update steem dynamic global properties */
    updateGlobal(state, value) {
      state.steemGlobalProps = value || false;
    },
    /* update steem current median history price */
    updateHisPrice(state, value) {
      state.curMHisPrice = value;
    },
    updMainUnclaimed(state, status) {
      state.main.tokenExpand = status;
    },
    updateMainSteemId(state, value) {
      state.main.steemId = value;
    },
    /* update steem reward fund */
    updateRewardFund(state, value) {
      state.rewardFund = value;
    }
  },
});

window.Vue.use(Toasted);

const App = new window.Vue({
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
