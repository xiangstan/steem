<template>
  <div class="list">
    <div class="list-item has-background-info has-text-weight-bold has-text-white">
      Unclaimed Tokens
      <a class="button-expand is-pulled-right" @click="fetchUnclaimed">[ <span>{{TokenExpandSign}}</span> ]</a>
    </div>
    <div class="list-item" v-for="tkn in tkns" v-if="tokenExpand">
      <div class="columns">
        <div class="column is-one-quarter has-text-weight-semibold">
          {{tkn.symbol}}
        </div>
        <div class="column is-italic">
          {{tkn.value / Math.pow(10, tkn.precision)}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports={
  computed: {
    TokenExpandSign: function() { return (this.tokenExpand) ? "-" : "+"; },
    SteemId: function() { return this.$store.state.main.steemId; }
  },
  data: function() {
    return {
      tkns: [],
      tokenExpand: false
    }
  },
  methods: {
    /* search tokens */
    fetchUnclaimed: function(e) {
      e.preventDefault();
      const that = this;
      that.tokenExpand=!that.tokenExpand;
      that.tkns = [];
      if(this.tokenExpand&&that.SteemId !== false){
        axios.get("https://scot-api.steem-engine.com/@" + that.SteemId).then((result) => {
          for(let tkn in result.data){
            let content=result.data[tkn];
            if(content.pending_token > 0){
              that.tkns.push({symbol: content.symbol, value: content.pending_token, precision: content.precision});
            }
          }
        });
      }
      else{ console.log("Nothing to do..."); }
    },
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