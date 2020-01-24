<template>
  <div class="message is-info" v-if="tokens.length>0">
    <div class="message-header">
      Token Wallet
      <a class="button-expand" @click="tokenExpand=!tokenExpand">[ <span>{{TokenExpandSign}}</span> ]</a>
    </div>
    <div class="message-body">
      <div class="list">
        <div class="list-item has-background-info has-text-light">
          <div class="columns has-text-weight-bold is-uppercase">
            <div class="column is-one-quarter">
              <label class="checkbox">
                <input type="checkbox" v-model="select" @change="SelectAll" />
                Symbol
              </label>

            </div>
            <div class="column">
              Blance (Stake)
            </div>
          </div>
        </div>
        <div class="list-item" v-for="(tkn,idx) in AllTokens" v-if="idx<TokenExpandCount">
          <div class="columns">
            <div class="column is-one-quarter has-text-weight-semibold">
              <label class="checkbox">
                <input :disabled="setDisabled(tkn.balance)" type="checkbox" :value="SetValue(tkn)" v-model="form" />
                {{tkn.symbol}}
              </label>
            </div>
            <div class="column">
              {{tkn.balance}} ({{showNull(tkn.stake)}})
            </div>
          </div>
        </div><!-- End of All Tokens -->
        <div class="list-item has-background-light has-text-light">
          <div class="field has-addons" v-if="tokenExpand">
            <div class="control is-expanded">
              <input class="input" id="active-key" type="password" placeholder="Active Key">
            </div>
            <div class="control">
              <button class="button is-info" @click="Sell">
                <i aria-hidden="true" class="fas fa-dollar-sign fa-fw"></i>
                SELL
              </button>
            </div>
          </div>
          <p class="notification is-warning" v-else>
            Click [ + ] to View All Tokens and Sell Button
          </p>
        </div>
      </div><!-- End of List -->
    </div><!-- End of Message Body -->
  </div>
</template>

<script>
module.exports={
  computed: {
    AllTokens: function() {
      let temp = [];
      for(let i = 0; i < this.tokens.length; i++){
        let content=this.tokens[i];
        if((content.balance > 0 || content.stake > 0) && content.symbol != 'STEEMP') {
          temp.push(content);
        }
      }
      return temp;
    },
    TokenExpandSign: function() { return (this.tokenExpand)?"-":"+"; },
    TokenExpandCount: function() {
      let count = 6;
      if(this.AllTokens.length < 6 || this.tokenExpand){ count = this.AllTokens.length; }
      return count;
      //return this.AllTokens.length
    }
  },
  data: function() {
    return {
      form: [],
      select: false,
      tokenExpand: false
    }
  },
  methods: {
    /* select all checkbox */
    SelectAll: function() {
      if(this.select) {
        for(let i = 0; i < this.AllTokens.length; i++){
          let content = this.AllTokens[i];
          if(content.balance > 0) {
            this.form.push(this.SetValue(content));
            console.log(this.form);
          }
        }
      }
      else { this.form = []; }
    },
    /* sell selected tokens */
    Sell: function() {
      const activekey = document.getElementById("active-key").value;
      if(activekey.length === 0) {
        this.$parent.msg = {
          alert: true,
          code: false,
          text: "Need to provide STEEM Active Key"
        };
      }
      else if(this.form.length === 0){
        this.$parent.msg = {
          alert: true,
          code: false,
          text: "Need to select at least one token"
        };
      }
      else {}
    },
    /* set disabled if value is 0 */
    setDisabled: function(value) {
      return (parseFloat(value) === 0)?true:false;
    },
    /* set token value */
    SetValue: function(tkn) {
      return tkn.symbol+':'+tkn.balance;
    },
    /* convert undefined value to 0 */
    showNull: function(value){ return (typeof value==="undefined")?0:value; }
  },
  props: {
    tokens: {type: Array, default: false},
  }
};
</script>

<style scoped>
.button-expand{
  text-decoration: none!important;
}
.button-expand span{
  display: inline-block;
  text-align: center;
  width: 10px;
}
</style>
