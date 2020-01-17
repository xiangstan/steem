<template>
<div class="container">
  <div class="content">
    <h1 class="has-text-centered is-size-3">STEEM Info Center</h1>
    <div class="field has-addons">
      <div class="control">
        <input class="input" placeholder="Provide a STEEM ID" v-model="user.main" />
      </div>
      <div class="control">
        <a class="button is-info" data-method="main" @click="searchId">Search</a>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-third">
        <prof-box :profile="profile.main" :show="show.mainProfile" ref="profile"></prof-box>
      </div>
    </div>
  </div>
  <notify-msg :msg="msg"></notify-msg>
</div>
</template>

<script>
module.exports={
  components:{
    "prof-box": window.httpVueLoader("/js/components/Account.vue"),
    "notify-msg": window.httpVueLoader("/js/components/Notify.vue")
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
      steem:steem,
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
      }, 3000)
    },
    init: function() {
      this.steem.api.setOptions({ url: "https://anyx.io" });
      const steemId = localStorage.getItem("steemId");
      if(steemId){
        this.user.main = steemId;
        this.searchSteemAccount(steemId, "main");
      }
    },
    searchId: function(e) {
      const method = e.currentTarget.dataset.method;
      const steemId = this.user[method];
      this.searchSteemAccount(steemId, method);
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
      }
    }
  },
  mounted: function() {
    this.init();
  }
};
</script>