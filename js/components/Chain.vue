<template>
  <div v-if="Lang">
    <div>
      <div class="field has-addons is-marg-bt-5">
        <p class="control">
          <a class="button">{{Lang.steem.chain}}</a>
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
      <div class="column">
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
      load: {
        ChainProperties: "0"
      }
    };
  },
  methods: {
    Init() {
      this.GetChainProperties();
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
      const opt = {
        hive: "https://anyx.io",
        steem: "https://api.steemit.com"
      };
      if (chain !== "") {
        this.$parent.SetSteemApiOption(opt[chain]);
      }
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
