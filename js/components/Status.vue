<template>
  <div class="message">
    <div class="message-header is-size-6">
      {{Lang.steem[chain] + Lang.steem.space + Lang.steem.node + Lang.steem.space + Lang.steem.status}}
    </div>
    <div class="message-body">
      <div class="columns is-multiline is-size-7">
        <div class="column is-half-tablet is-one-third-desktop" v-for="(node, idx) in NodeStatus" :key="idx">
          <div :class="'node-status notification is-' + node.css">
            <p>
              <strong class="is-size-6">{{node.name}}</strong>
              <br />
              <em><a :href="node.url" target="_blank" :title="node.name">{{node.url}}</a></em>
            </p>
            <p>
              {{Lang.steem.ping}}: {{node.ping}} <em>ms</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  name: "Status",
  computed: {
    Lang() {
      return this.$store.state.lang;
    },
    NodeStatus() {
      return this.nodes[this.chain];
    }
  },
  data() {
    return {
      nodes: {
        hive: [
          {css: "", name: "HIVE API", url: "https://api.hive.blog"},
          {css: "", name: "Anyx IO", url: "https://anyx.io"}
        ],
        steem: [
          {css: "", name: "STEEM API", status: "", url: "https://api.steemit.com"},
          {css: "", name: "JUSTYY", status: "", url: "https://api.justyy.com"},
          {css: "", name: "61BTS S2", status: "", url: "https://s2.61bts.com"},
          {css: "", name: "BTS TW API", status: "", url: "https://api.steem.bts.tw"},
          {css: "", name: "Minnowsupport", status: "", url: "https://steemd.minnowsupportproject.org"},
          {css: "", name: "61bts STEEM", status: "", url: "https://steem.61bts.com"},
          {css: "", name: "STEEMD Dev", status: "", url: "https://steemd.steemitdev.com"},
          {css: "", name: "STEEMITDEV API", status: "", url: "https://api.steemitdev.com"},
          {css: "", name: "Privex", status: "", url: "https://steemd.privex.io"},
          {css: "", name: "BTS TW", status: "", url: "https://steem.bts.tw"}
        ]
      }
    }
  },
  methods: {
    Init() {
      let nodes = this.nodes[this.chain];
      for (let i = 0; i < nodes.length; i++) {
        let start = Date.now();
        axios.get(nodes[i].url, {
          params: {
            timestamp: start
          }
        })
          .then((result) => {
            if (result.status === 200) {
              nodes[i].status = "OK";
              nodes[i].css = "success";
            }
            else {
              nodes[i].css = "warning";
            }
            let end = Date.now() - start;
            nodes[i].ping = end;
          })
          .catch((error) => {
            nodes[i].css = "danger";
            nodes[i].status = error.message;
            console.error(error);
          });
      }
    }
  },
  mounted() {
    console.log(axios)
    this.Init();
  },
  props: {
    chain: {type: String, default: "steem"}
  }
}
</script>

<style scoped>
.node-status.notification {
  padding: 1.25rem 1.5rem;
}
.node-status.notification p {
  overflow: hidden;
}
</style>
