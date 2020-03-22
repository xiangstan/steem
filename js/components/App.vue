<template>
<div class="full-screen" v-if="Lang">
  <div class="container">
    <div class="is-relative">
      <h1 class="has-text-centered is-size-3">
        {{Lang.steem[Page].toUpperCase() + Lang.steem.info_center}}
      </h1>
      <Language></Language>
    </div>
    <div class="tabs is-centered">
      <ul>
        <li :class="Page==='chain'?'is-active':''">
          <a @click="SetPage('chain')">{{Lang.steem.chain}}</a>
        </li>
        <li :class="Page==='steem'?'is-active':''">
          <a @click="SetPage('steem')">STEEM</a>
        </li>
        <li :class="Page==='hive'?'is-active':''">
          <a @click="SetPage('hive')">Hive</a>
        </li>
        <li :class="Page==='splinterlands'?'is-active':''">
          <a @click="SetPage('splinterlands')">Splinterlands</a>
        </li>
      </ul>
    </div>
    <div v-if="Page==='chain'">
      <!-- Nodes -->
      <chains :steem="steem"></chains>
    </div>
    <div v-else-if="Page==='steem'">
      <steem-main :show="show" :steem="steem" :page="Page"></steem-main>
      <div class="column">
        <steem-monsters ref="steemmonsters"></steem-monsters>
      </div>
    </div>
    <div v-else-if="Page==='hive'">
      <hive-main :show="show" :steem="steem" :page="Page"></hive-main>
    </div>
    <div v-else-if="Page==='splinterlands'">
      <splinterlands :show="show" :steem="steem" :page="Page"></splinterlands>
    </div>
    <notify-msg :msg="msg"></notify-msg>
  </div>
  <loading-box></loading-box>
</div>
</template>

<script>
module.exports={
  components:{
    "hive-main": window.httpVueLoader("./js/components/HiveMain.vue"),
    "Language": window.httpVueLoader("./js/components/Language.vue"),
    "loading-box": window.httpVueLoader("./js/components/Loading.vue"),
    "chains": window.httpVueLoader("./js/components/Chain.vue"),
    "notify-msg": window.httpVueLoader("./js/components/Notify.vue"),
    "prof-box": window.httpVueLoader("./js/components/Profile.vue"),
    "searchid": window.httpVueLoader("./js/components/SearchId.vue"),
    "splinterlands": window.httpVueLoader("./js/components/Splinterlands.vue"),
    "steem-main": window.httpVueLoader("./js/components/SteemMain.vue")
  },
  computed: {
    Expands() { return this.$store.state.expand; },
    Lang: function() { return this.$store.state.lang; },
    Page() { return this.$store.state.Page; },
    Profile() { return this.$store.state.Profile; },
    SteemId() { return this.$store.state.SteemId; }
  },
  data: function() {
    return {
      msg: {},
      profile: {
        main: false,
        guest: false
      },
      show: {
        Profile: false
      },
      ssc: new SSC("https://api.steem-engine.com/rpc/"),
      steem: steem,
      unclaimed: {},
      tokens: {
        main: false
      },
      user: {
        main: ""
      }
    }
  },
  methods: {
    /* Display alert message */
    alert: function(data) {
      const that = this;
      that.msg = data;
      window.setTimeout(function () {
        that.msg = {
          alert: false
        };
      }, 4000)
    },
    /* Initial loading the page */
    Init() {
      const steemId = localStorage.getItem("steemId");
      let page = localStorage.getItem("page");
      this.GetLang();
      this.SetPage(page);
      if (steemId) {
        this.$store.commit("updSteemId", steemId);
        this.InitSteem();
      }
    },
    InitSteem: function() {
      if (this.Page === "steem") {
        const that = this;
        //that.steem.api.setOptions({ url: "https://anyx.io" });
        that.ChainGlobalProperties();
        window.setInterval(function() { that.ChainGlobalProperties(); }, 120000);
        window.setTimeout(function() {
          that.SteemCurMedHisPrice();
          that.SteemGetRewardFund();
        }, 100);
        const steemId = localStorage.getItem("steemId");
        if(steemId){
          that.user.main = steemId;
          that.$store.commit("updateMainSteemId", steemId);
          //that.$store.commit("setLoading", true);
          if (this.Page === "steem") {
            that.searchAccount(steemId);
          }
        }
      }
      else {
      }
    },
    /* get Initial language pack */
    GetLang: function(lang = false) {
      if(!lang) {
        lang = localStorage.getItem("lang");
        if(lang===null){
          lang = "en";
        }
      }
      localStorage.setItem("lang",lang);
      axios.get("./lang/"+lang+".json")
        .then((result) => {
          this.$store.commit("setLang", result.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    /* get current page */
    GetPage() {
      if (this.SteemId) {
        that.$store.commit("setLoading", true);
        that.searchAccount(steemId);
      }
    },
    searchId: function(e) {
      const method = e.currentTarget.dataset.method;
      const steemId = this.user[method];
      this.tokens[method] = false;
      for(let obj in this.Expands) {
        this.$store.commit("updExpand", {});
      }
      this.$store.commit("updMainUnclaimed", false);
      this.$store.commit("updFollowList", []);
      this.$store.commit("setLoading", true);
      //this.$refs.unclaimed.tkns = [];
      this.searchAccount(steemId, method);
    },
    /* Steem Engine Query */
    SscQuery: function(contract, table, query, limit=1000, offset=0) {
      return new Promise((resolve, reject) => {
        this.ssc.find(
          contract,
          table,
          query,
          limit,
          offset,
          [],
          (err, result) => {
            resolve(result);
          }
        );
      });
    },
    /* search for a steem profile */
    searchAccount: function(steemId) {
      const that = this;
      that.SmsDetail = false;
      if(steemId === "") {
        that.msg = {
          alert: true,
          code: false,
          text: "Need a STEEM ID"
        }
      }
      else {
        if (typeof that.$refs.unclaimed !== "undefined" && typeof that.$refs.unclaimed.tkns !== "undefined") {
          //that.$refs.unclaimed.tkns = [];
        }
        that.steem.api.getAccounts([steemId], function(err, result) {
          if(err===null){
            localStorage.setItem("steemId", steemId);
            that.$store.commit("updSteemId", steemId);
            that.profile = result[0];
            that.$store.commit("updVar", {cat: "Profile", value: result[0]});
            that.show.Profile = true;
          }
          else{
            that.msg = {
              alert: true,
              code: false,
              text: err
            }
          }
        });
        //that.searchToken(steemId);
      }
      that.$store.commit("setLoading", false);
    },
    /* search tokens */
    searchToken: function(steemId, method) {
      const that = this;
      that.SscQuery("tokens", "balances", { account: steemId }).then((result) => {
        that.tokens[method] = result;
      });
    },
    /* set current viewed page */
    SetPage: function(page = false) {
      if(!page) page = "chain";
      localStorage.setItem("page", page);
      this.$store.commit("updVar", { cat: "Page", value: page});
      if(page !== "chain") {
        this.SetSteemApiOption(page);
        if (this.SteemId !== "") {
          this.searchAccount(this.SteemId);
          this.InitSteem();
        }
      }
    },
    /* set steem api option */
    SetSteemApiOption: function(chain) {
      const opt = {
        chain: "https://api.steemit.com",
        hive: "https://anyx.io",
        splinterlands: "https://api.steemit.com",
        steem: "https://api.steemit.com"
      };
      if (chain !== "") {
        this.steem.api.setOptions({ url: opt[chain] });
      }
    },
    /* generic steem.api call without query parameter */
    SteemApiNoQry: function(api, callback) {
      const that = this;
      that.steem.api[api](function(err, result) { callback(err, result); });
    },
    /* generic steem.api call with query parameter */
    SteemApiQry: function(api, query, callback) {
      const that = this;
      that.steem.api[api](query, function(err, result) { callback(err, result); });
    },
    /* current median history price */
    SteemCurMedHisPrice: function() {
      const that = this;
      that.SteemApiNoQry("getCurrentMedianHistoryPrice", function(err, result) {
        if (err) { console.error(err); }
        else {
          that.$store.commit("updChainProp", {chain: that.Page, obj: "curMHisPrice", value: result});
        }
      });
    },
    /* get reward fund */
    SteemGetRewardFund: function() {
      const that = this;
      that.SteemApiQry("getRewardFund", "post", function(err, result){
        if (err) { console.error(err); }
        else {
          that.$store.commit("updChainProp", {chain: that.Page, obj: "RewardFund", value: result});
        }
      });
    },
    ChainGlobalProperties: function(){
      const that = this;
      that.steem.api.getDynamicGlobalProperties(function(err, result) {
        if(err === null) {
          that.$store.commit("updChainProp", {chain: that.Page, obj: "GlobalProps", value: result});
        }
      });
    },
    /* show toast message */
    toast: function(msg) {
      this.$toasted.show(msg, {
        action: {
          text: "CLOSE",
          onClick: (e, toastObject) => {
            toastObject.goAway(0);
          }
        },
        duration: 10000,
        position: "top-right",
        theme: "bubble",
      });
    }
  },
  mounted: function() {
    this.Init();
  }
};
</script>

<style scoped>
.full-screen {
  height: 100%;
  position: relative;
  width: 100%;
}
.translate {
  position: absolute;
  right: 5px;
  top: 5px;
  z-index: 10;
}
</style>
