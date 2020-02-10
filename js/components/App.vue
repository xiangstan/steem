<template>
<div class="full-screen">
  <div class="container">
    <div class="content">
      <h1 class="has-text-centered is-size-3">STEEM Info Center</h1>
      <div class="columns">
        <div class="column is-half">
          <div class="field has-addons">
            <div class="control is-expanded">
              <input class="input" placeholder="Provide a STEEM ID" v-model="user.main" />
            </div>
            <div class="control">
              <a class="button is-info" data-method="main" @click="searchId">
                <i aria-hidden="true" class="fas fa-search fa-fw"></i> Search
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-one-third">
          <prof-box :profile="profile.main" :show="show.mainProfile" ref="profile"></prof-box>
          <authorities :apps="profile.main.posting.account_auths" ref="authorized" v-if="profile.main"></authorities>
        </div>
        <div class="column">
          <token-list :tokens="tokens.main" v-if="user.main"></token-list>
          <un-claimed :steem="steem" ref="unclaimed" v-if="user.main"></un-claimed>
        </div>
      </div>
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
    "loading-box": window.httpVueLoader("./js/components/Loading.vue"),
    "notify-msg": window.httpVueLoader("./js/components/Notify.vue"),
    "prof-box": window.httpVueLoader("./js/components/Account.vue"),
    "token-list": window.httpVueLoader("./js/components/Tokens.vue"),
    "un-claimed": window.httpVueLoader("./js/components/Unclaimed.vue")
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
    init: function() {
      const that = this;
      this.steem.api.setOptions({ url: "https://anyx.io" });
      const steemId = localStorage.getItem("steemId");
      if(steemId){
        this.user.main = steemId;
        this.$store.commit("updateMainSteemId", steemId);
        this.$store.commit("setLoading", true);
        this.searchSteemAccount(steemId, "main");
      }
    },
    searchId: function(e) {
      const method = e.currentTarget.dataset.method;
      const steemId = this.user[method];
      this.tokens[method] = false;
      this.$store.commit("updMainUnclaimed", false);
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
        this.$store.commit("setLoading", false);
      }
    },
    /* search tokens */
    searchToken: function(steemId, method) {
      const that = this;
      that.SscQuery("tokens", "balances", { account: steemId }).then((result) => {
        that.tokens[method] = result;
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
    this.init();
  }
};
</script>

<style scoped>
.full-screen {
  height: 100%;
  position: relative;
  width: 100%;
}
</style>
