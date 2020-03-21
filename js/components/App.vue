<template>
<div class="full-screen" v-if="Lang">
  <div class="container">
    <div class="is-relative">
      <h1 class="has-text-centered is-size-3">
        STEEM{{Lang.steem.info_center}}
      </h1>
      <Language></Language>
    </div>
    <div class="tabs is-centered">
      <ul>
        <li>
          <a @click="SetPage('chain')">{{Lang.steem.chain}}</a>
        </li>
        <li>
          <a @click="SetPage('steem')">STEEM</a>
        </li>
        <li>
          <a @click="SetPage('hive')">Hive</a>
        </li>
      </ul>
    </div>
    <div v-if="Page==='chain'">
      <!-- Nodes -->
      <chains :steem="steem"></chains>
    </div>
    <div v-else-if="Page==='steem'">
      <div class="columns">
        <div class="column is-half">
          <div class="field has-addons">
            <div class="control is-expanded">
              <input class="input" placeholder="Provide a STEEM ID" v-model="user.main" />
            </div>
            <div class="control">
              <a class="button is-info" data-method="main" @click="searchId">
                <i aria-hidden="true" class="fas fa-search fa-fw"></i> {{Lang.profile.search}}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-one-third">
          <prof-box :profile="profile.main" :show="show.mainProfile" :steem="steem" ref="profile"></prof-box>
          <authorities :apps="profile.main.posting.account_auths" ref="authorized" v-if="profile.main"></authorities>
          <follow :steem="steem"></follow>
        </div>
        <div class="column">
          <token-list :tokens="tokens.main" v-if="user.main"></token-list>
          <un-claimed :steem="steem" ref="unclaimed" v-if="user.main"></un-claimed>
          <steem-monsters ref="steemmonsters"></steem-monsters>
        </div>
      </div>
    </div>
    <div v-else-if="Page==='hive'">
      Underconstruction
    </div>
    <notify-msg :msg="msg"></notify-msg>
  </div>
  <loading-box></loading-box>
</div>
</template>

<script>
module.exports={
  components:{
    "authorities": window.httpVueLoader("./js/components/Authorities.vue"),
    "follow": window.httpVueLoader("./js/components/Follow.vue"),
    "Language": window.httpVueLoader("./js/components/Language.vue"),
    "loading-box": window.httpVueLoader("./js/components/Loading.vue"),
    "chains": window.httpVueLoader("./js/components/Chain.vue"),
    "notify-msg": window.httpVueLoader("./js/components/Notify.vue"),
    "prof-box": window.httpVueLoader("./js/components/Account.vue"),
    "steem-monsters": window.httpVueLoader("./js/components/SteemMonsters.vue"),
    "token-list": window.httpVueLoader("./js/components/Tokens.vue"),
    "un-claimed": window.httpVueLoader("./js/components/Unclaimed.vue")
  },
  computed: {
    Expands() { return this.$store.state.expand; },
    Lang: function() { return this.$store.state.lang; },
    Page() { return this.$store.state.Page; }
  },
  created() {
    this.Init();
  },
  data: function() {
    return {
      client:new dsteem.Client("https://anyx.io"),
      msg: {},
      profile: {
        main: false,
        guest: false
      },
      show: {
        mainProfile: false
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
    /*ApiCall: function(api, method) {
      return new Promise((resolve, reject) =>{
        this.client.call(api, method [])
      });
    },*/
    /* Initial loading the page */
    Init() {
      let page = localStorage.getItem("page");
      this.SetPage(page);
    },
    InitSteem: function() {
      const that = this;
      that.GetLang();
      that.steem.api.setOptions({ url: "https://anyx.io" });
      that.SteemGlobalProperties();
      window.setInterval(function() { that.SteemGlobalProperties(); }, 120000);
      window.setTimeout(function() {
        that.SteemCurMedHisPrice();
        that.SteemGetRewardFund();
      }, 100);
      const steemId = localStorage.getItem("steemId");
      if(steemId){
        that.user.main = steemId;
        that.$store.commit("updateMainSteemId", steemId);
        that.$store.commit("setLoading", true);
        that.searchSteemAccount(steemId, "main");
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
          console.err(error);
        });
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
      this.$refs.unclaimed.tkns = [];
      this.searchSteemAccount(steemId, method);
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
    searchSteemAccount: function(steemId, method) {
      const that = this;
      if(steemId === "") {
        that.msg = {
          alert: true,
          code: false,
          text: "Need a STEEM ID"
        }
      }
      else {
        that.steem.api.getAccounts([steemId], function(err, result) {
          if(err===null){
            localStorage.setItem("steemId", steemId);
            that.$store.commit("updateMainSteemId", steemId);
            that.profile[method] = result[0];
            that.show[method+"Profile"] = true;
          }
          else{
            that.msg = {
              alert: true,
              code: false,
              text: err
            }
          }
        });
        that.searchToken(steemId, "main");
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
      if(page !== "chain") { this.SetSteemApiOption(page); }
      localStorage.setItem("page", page);
      this.$store.commit("updVar", { cat: "Page", value: page});
    },
    /* set steem api option */
    SetSteemApiOption: function(chain) {
      const opt = {
        hive: "https://anyx.io",
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
        if (err) {  console.err(err); }
        that.$store.commit("updateHisPrice", result);
      });
    },
    /* get reward fund */
    SteemGetRewardFund: function() {
      const that = this;
      that.SteemApiQry("getRewardFund", "post", function(err, result){
        if (err) { console.error(err); }
        that.$store.commit("updateRewardFund", result);
      });
    },
    SteemGlobalProperties: function(){
      const that = this;
      that.steem.api.getDynamicGlobalProperties(function(err,result) {
        if(err === null) {
          that.$store.commit("updateGlobal", result);
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
    this.InitSteem();
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
