<template>
  <div class="list" v-if="Lang">
    <div class="list-item has-background-info has-text-white">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <h2 class="has-text-weight-bold">{{Lang.token.token_wallet}}</h2>
          </div>
        </div>
        <div class="level-right">
          <p>
            <a class="button-expand has-text-weight-bold" @click="Expand">[ <span>{{TokenExpandSign}}</span> ]</a>
          </p>
        </div>
      </div>
    </div>
    <div class="item-list" v-if="tokens.length>0&&!tokenExpand">
      <p class="notification is-warning">
        <span v-if="Lang.index==='en'">
          Click [ + ] to View All Tokens and Sell Button
        </span>
        <span v-else-if="Lang.index==='cn'">
          点击 [ + ] 浏览所有的代币
        </span>
      </p>
    </div>
    <template v-if="tokenExpand">
        <div class="list-item has-background-info has-text-light">
          <div class="columns has-text-weight-bold is-uppercase">
            <div class="column is-one-quarter">
              <label class="checkbox">
                <input type="checkbox" v-model="select" @change="SelectAll" />
                {{Lang.token.symbol}}
              </label>
            </div>
            <div class="column">
              {{Lang.token.balance}} ({{Lang.token.stake}})
            </div>
          </div>
        </div>
      <div class="list-item" v-for="(tkn,idx) in AllTokens">
        <div class="columns">
          <div class="column is-one-quarter has-text-weight-semibold">
            <label class="checkbox">
              <input :disabled="setDisabled(tkn.balance)" type="checkbox" :value="idx" v-model="form" />
              {{tkn.symbol}}
            </label>
          </div>
          <div class="column">
            {{tkn.balance}} ({{showNull(tkn.stake)}})
          </div>
        </div>
      </div><!-- End of All Tokens -->
      <div class="list-item">
        <div class="field has-addons" >
          <div class="control is-expanded">
            <input class="input" id="active-key" type="password" placeholder="Active Key">
          </div>
          <div class="control">
            <button class="button is-info" @click="Sell">
              <i aria-hidden="true" class="fas fa-dollar-sign fa-fw"></i>
              {{Lang.token.sell}}
            </button>
          </div>
        </div>
      </div>
    </template>
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
      return temp.sort((a, b) => (a.symbol > b.symbol) ? 1 : -1);
    },
    Lang: function() { return this.$store.state.lang; },
    SteemId: function() { return this.$store.state.main.steemId; },
    TokenExpandSign: function() { return (this.tokenExpand) ? "-" : "+"; },
    TokenExpandCount: function() {
      let count = 6;
      if(this.AllTokens.length < 6 || this.tokenExpand){ count = this.AllTokens.length; }
      return count;
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
    /* expand toke list */
    Expand: function() {
      this.tokenExpand = !this.tokenExpand;
      if(this.tokenExpand) {
        console.log("Expanded");
      }
    },
    /* get highest bid price */
    GetHighBid: function() {
      console.log(this.AllTokens);
    },
    /* get token bid price */
    GetPrice: function(data, i, key, sell = false) {
      const that = this;
      that.$parent.SscQuery("market", "metrics", { symbol: data.symbol }).then((result) => {
        //console.log(result[0].highestBid);
        let price = result[0].highestBid;
        if (sell) {
          if(data.balance > 0 && price > 0) {
            that.Transaction(data.symbol, data.balance, price, key, i);
          }
        }
        else {
          console.log(data.symbol, i, price);
        }
      });
    },
    /* select all checkbox */
    SelectAll: function() {
      if(this.select) {
        for(let i = 0; i < this.AllTokens.length; i++){
          let content = this.AllTokens[i];
          if(content.balance > 0) {
            //this.form.push(this.SetValue(content));
            this.form.push(i)
          }
        }
      }
      else { this.form = []; }
    },
    /* sell selected tokens */
    Sell: function() {
      const that = this;
      const activekey = document.getElementById("active-key").value;
      const temp = that.form.slice(0);
      if(activekey.length === 0) {
        that.$parent.alert({
          alert: true,
          code: false,
          text: "Need to provide STEEM Active Key"
        });
      }
      else if(temp.length === 0){
        that.$parent.alert({
          alert: true,
          code: false,
          text: "Need to select at least one token"
        });
      }
      else {
        that.$store.commit("setLoading", true);
        setTimeout(function () {
          that.$store.commit("setLoading", false);
        }, (+temp.length + +1) * 1000)
        for (let i = 0; i < temp.length; i++) {
          let tkn = that.AllTokens[temp[i]];
          that.GetPrice({balance: tkn.balance, symbol: tkn.symbol}, i, activekey, true);
        }
        that.form = [];
      }
    },
    /* set balance to zero */
    setBalance: function(symbol) {
      for(let i = 0; i < this.AllTokens.length; i++) {
        if(this.AllTokens[i].symbol === symbol){
          this.AllTokens[i].balance = 0;
          break;
        }
      }
    },
    /* set disabled if value is 0 */
    setDisabled: function(value) {
      return (parseFloat(value) === 0) ? true : false;
    },
    /* convert undefined value to 0 */
    showNull: function(value){ return (typeof value==="undefined")?0:value; },
    /* broadcast transaction */
    Transaction: function(symbol, balance, price, key, i) {
      const that = this;
      setTimeout(function () {
        const json = JSON.stringify({
          contractName: 'market',
          contractAction: 'sell',
          contractPayload: {
            symbol: symbol,
            quantity: balance,
            price: price
          }
        });
        if(balance > 0 && price > 0) {
          steem.broadcast.customJson(key, [that.SteemId], [], 'ssc-mainnet1', json, (err, result) => {
            if (err !== null){
              that.$parent.toast("You have failed to sell <span class='token-symbol'>" + symbol + "</span>");
            }
            else {
              that.$parent.toast("You have successfully sold "+ balance + " <span class='token-symbol'>" + symbol + "</span> at " + price + " steem");
              that.setBalance(symbol);
            }
          });
        }
      }, (+i + +1) * 1000);
    }
  },
  props: {
    tokens: {type: Array, default: false},
  }
};
</script>

<style scoped>
.token-symbol {
  font-style: italic;
  font-weight: bold;
  margin:0 3px;
}
</style>
