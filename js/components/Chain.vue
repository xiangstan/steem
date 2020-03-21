<template>
  <div v-if="Lang">
    <div>
      <div class="field has-addons is-marg-bt-5">
        <p class="control">
          <a class="button is-static">{{Lang.steem.chain}}</a>
        </p>
        <p class="control">
          <span class="select">
            <select @change="SetChain">
              <option value="">
                &mdash; {{Lang.steem.select + Lang.steem.space + Lang.steem.chain}} &mdash;
              </option>
              <option value="steem">
                STEEM
              </option>
              <option value="hive">
                Hive
              </option>
            </select>
          </span>
        </p>
      </div>
    </div>
    <div class="columns">
      <div class="column is-5">
        <div class="message is-info">
          <div class="message-header">
            {{Lang.steem.chain + Lang.steem.space + Lang.steem.properties}}
          </div>
          <div class="message-body">
            <p v-if="load.ChainProperties==='0'">
              <i aria-hidden="true" class="fas fa-spinner fa-spin"></i>
              {{Lang.steem.load + Lang.steem.ing}}
            </p>
            <p class="notification is-danger" v-else-if="load.ChainProperties==='-1'">
              Error loading data
            </p>
            <p v-for="(value, idx) in ChainProperties" v-else>
              <strong>{{idx}}:</strong> {{value}}
            </p>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="field has-addons is-marg-bt-5">
          <p class="control">
            <a class="button is-static">
              {{Lang.steem.check + Lang.steem.space + Lang.steem.chain}}
            </a>
          </p>
          <p class="control">
            <input class="input" type="text" placeholder="" v-model="ChainUrl" />
          </p>
          <p class="control">
            <a class="button is-info" @click="CheckChain">
              {{Lang.steem.check}}
            </a>
          </p>
        </div>
        <p class="notification" :class="ChainUrlCss" v-if="load.ChainUrl">
          {{ChainUrlTxt}}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  computed: {
    Lang: function() { return this.$store.state.lang; },
  },
  data: function() {
    return {
      ChainProperties: false,
      ChainUrl: "",
      ChainUrlCss: "",
      ChainUrlTxt: "",
      load: {
        ChainProperties: "0",
        ChainUrl: false
      }
    };
  },
  methods: {
    Init() {
      this.GetChainProperties();
    },
    CheckChain: function() {
      const that = this;
      that.$store.commit("setLoading", true);
      that.ChainUrlCss = "";
      that.load.ChainUrl = false;
      that.steem.api.setOptions({ url: this.ChainUrl });
      that.$parent.SteemApiNoQry("getChainProperties", function(err, result) {
        that.load.ChainUrl = true;
        if (result) {
          let str = result.account_creation_fee.split(" ");
          that.ChainUrlTxt = str[1];
        }
        else {
          that.ChainUrlCss = "is-danger";
          that.ChainUrlTxt = err;
        }
        that.$store.commit("setLoading", false);
      });
    },
    GetChainProperties: function() {
      const that = this;
      that.$parent.SteemApiNoQry("getChainProperties", function(err, result) {
        if (result) {
          that.ChainProperties = result;
          that.load.ChainProperties = "1";
        }
        else {
          that.loadChainProperties = "-1";
        }
      });
    },
    /* set current viewed chain */
    SetChain: function(e) {
      const chain = e.target.value;
      this.$parent.SetSteemApiOption(chain);
      this.load.ChainProperties = "0";
      this.GetChainProperties();
    },
  },
  mounted() {
    this.Init();
  },
  props: {
    steem: {type: Object, default: false}
  }
};
</script>

<style scoped>
</style>
