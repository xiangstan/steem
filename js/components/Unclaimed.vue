<template>
  <div class="list">
    <div class="list-item has-background-info has-text-weight-bold has-text-white">
      Unclaimed Tokens <span v-if="TokenExpand">(<em>{{tkns.length}}</em>)</span>
      <a class="button-expand is-pulled-right" @click="fetchUnclaimed">[ <span>{{TokenExpandSign}}</span> ]</a>
    </div>
    <div class="list-item" v-for="tkn in tkns" v-if="TokenExpand">
      <p class="notification is-warning" v-if="tkns.length===0">
        No more unclaimed tokens
      </p>
      <div class="columns" v-else>
        <div class="column is-one-quarter has-text-weight-semibold">
          {{tkn.symbol}}
        </div>
        <div class="column is-italic">
          {{tkn.value / Math.pow(10, tkn.precision)}}
        </div>
      </div>
    </div>
    <div class="list-item" v-if="tkns.length>0">
      <div class="field has-addons">
        <div class="control is-expanded">
          <input class="input" id="posting-key" type="password" placeholder="Posting Key">
        </div>
        <div class="control">
          <button class="button is-info" @click="claimToken">
            <i aria-hidden="true" class="fas fa-coins fa-fw"></i>
            Claim All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports={
  computed: {
    SteemId: function() { return this.$store.state.main.steemId; },
    TokenExpandSign: function() { return (this.TokenExpand) ? "-" : "+"; },
    TokenExpand: function() { return this.$store.state.main.tokenExpand; }
  },
  data: function() {
    return {
      tkns: []
    }
  },
  methods: {
    /* search tokens */
    fetchUnclaimed: function(e) {
      e.preventDefault();
      const that = this;
      that.$store.commit("updMainUnclaimed", !that.TokenExpand);
      that.tkns = [];
      if(this.TokenExpand && that.SteemId !== false){
        that.$store.commit("setLoading", true);
        axios.get("https://scot-api.steem-engine.com/@" + that.SteemId).then((result) => {
          for(let tkn in result.data){
            let content=result.data[tkn];
            if(content.pending_token > 0){
              that.tkns.push({symbol: content.symbol, value: content.pending_token, precision: content.precision});
            }
          }
          that.$store.commit("setLoading", false);
        });
      }
      else{ console.log("Nothing to do..."); }
    },
    /* claim tokens */
    claimToken: function(e) {
      e.preventDefault();
      const elemId = document.getElementById("posting-key")
      const key = elemId.value;
      if(!this.steem) {
        this.$parent.alert({
          alert: true,
          code: false,
          text: "STEEM API not load correctly"
        });
      }
      else if(key.length < 1) {
        this.$parent.alert({
          alert: true,
          code: false,
          text: "Need to provide STEEM Posting Key"
        });
      }
      else if(this.tkns.length < 1) {
        this.$parent.alert({
          alert: true,
          code: false,
          text: "You do not have any unclaimed tokens"
        });
      }
      else {
        this.$store.commit("setLoading", true);
        let json = [];
        let msg = "You have claimed ";
        const that = this;
        for(let tkn in this.tkns){
          json.push({ symbol: this.tkns[tkn].symbol });
          msg += "<strong style='margin-left:3px'><em>"+this.tkns[tkn].symbol+"</em></strong>";
          if(tkn < (this.tkns.length - 1)) { msg += ","; }
        }
        msg += "!";
        that.steem.broadcast.customJson(key, [], [that.SteemId], "scot_claim_token", JSON.stringify(json), (err, result) => {
          if (err !== null) {
            this.$parent.alert({
              alert: true,
              code: false,
              text: err
            });
          }
          else {
            elemId.value = "";
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
            this.$store.commit("setLoading", false);
          }
        });
      }
    }
  },
  props: {
    steem: {type: Object, default: false}
  }
};
</script>

<style scoped>
.button-expand{
  color:#fff;
  text-decoration: none!important;
}
.button-expand span{
  display: inline-block;
  text-align: center;
  width: 10px;
}
</style>
