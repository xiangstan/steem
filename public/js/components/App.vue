<template>
<div class="container">
  <div class="content">
    <h1 class="has-text-centered is-size-3">Hello World</h1>
    <div class="field has-addons">
      <div class="control">
        <input class="input" placeholder="Provide a User ID" v-model="user" />
      </div>
      <div class="control">
        <a class="button is-info" @click="search">Search</a>
      </div>
    </div>
    <prof-box acct="lnakuma" :show="show.profile"></prof-box>
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
      show: {
        profile: false
      },
      steem:steem,
      user:""
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
      console.log(this.steem);
    },
    search: function() {
      if(this.user==="") {
        this.msg = {
          alert: true,
          code: false,
          text: "Need a User ID"
        }
      }
      else {
        console.log("I am here!")
        this.steem.api.getAccounts([this.user], function(err, result) {
          if(err===null){
            console.log(result)
          }
          else{ 
            this.msg = {
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