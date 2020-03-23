Vue.config.devtools=true;

const store = new Vuex.Store({
  state: {
    Blogs: [],
    Chain: {
      hive: {
        curMHisPrice: false,
        GlobalProps: false,
        RewardFund: false
      },
      splinterlands: {
        curMHisPrice: false,
        GlobalProps: false,
        RewardFund: false
      },
      steem: {
        curMHisPrice: false,
        GlobalProps: false,
        RewardFund: false
      },
    },
    expand: {
      blog: false,
      sms: false,
      unclaimed: false,
    },
    followList: [],
    lang: false,
    loading: false,
    main: {
      steemId: false,
      profile: {},
      tokens: {}
    },
    Page: false,
    Profile: {},
    SteemId: "",
    msg: {
      alert: false,
      code: false,
      text: ""
    }
  },
  mutations: {
    /* load language pack to vuex */
    setLang(state, value) {
      state.lang = value;
    },
    setLoading(state, status) {
      state.loading = status;
    },
    updExpand(state, data) {
      state.expand[data.cat] = data.value;
    },
    /* update follow list */
    updFollowList(state, value) {
      state.followList = value;
    },
    /* update steem current median history price */
    updateHisPrice(state, value) {
      state.curMHisPrice = value;
    },
    updateMainSteemId(state, value) {
      state.main.steemId = value;
    },
    updChainProp(state, data) {
      state.Chain[data.chain][data.obj] = data.value;
    },
    /* update profile steemId */
    updSteemId(state, value) {
      state.SteemId = value;
    },
    updVar(state, data) {
      state[data.cat] = data.value;
    }
  },
});

window.Vue.use(Toasted);

const App = new window.Vue({
  el: "#app",
  store,
  components:{
    "App": window.httpVueLoader("./js/components/App.vue"),
  },
  template:"<App ref='app'></App>"
});

if(typeof window.__VUE_DEVTOOLS_GLOBAL_HOOK__!=="undefined"){
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = App.constructor;
}
