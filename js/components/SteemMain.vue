<template>
  <div>
    <div class="columns">
      <div class="column is-half">
        <searchid :page="page" :steem="steem"></searchid>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-third">
        <prof-box :page="page" :show="show.Profile" :steem="steem" ref="steemprofile"></prof-box>
        <authorities :apps="Profile.posting.account_auths" ref="authorized" v-if="Profile && Profile.posting"></authorities>
        <follow :steem="steem"></follow>
      </div>
      <div class="column">
        <token-list></token-list>
        <un-claimed :steem="steem" ref="unclaimed" v-if="SteemId"></un-claimed>
        <blog-list></blogs-list>
      </div>
    </div>
  </div>
</template>

<script>
module.exports={
  components:{
    "authorities": window.httpVueLoader("./js/components/Authorities.vue"),
    "blog-list": window.httpVueLoader("./js/components/BlogList.vue"),
    "follow": window.httpVueLoader("./js/components/Follow.vue"),
    "prof-box": window.httpVueLoader("./js/components/Profile.vue"),
    "searchid": window.httpVueLoader("./js/components/SearchId.vue"),
    "token-list": window.httpVueLoader("./js/components/Tokens.vue"),
    "un-claimed": window.httpVueLoader("./js/components/Unclaimed.vue")
  },
  computed: {
    Lang() { return this.$store.state.lang; },
    Profile() { return this.$store.state.Profile; },
    SteemId() { return this.$store.state.SteemId; }
  },
  methods: {
    Init() {
      if (this.SteemId) {
        this.$store.commit("setLoading", true);
        this.searchAccount(this.SteemId);
      }
    },
    searchAccount: function(steemId) {
      this.$parent.searchAccount(steemId);
    }
  },
  mounted() {
    this.Init();
  },
  props: {
    page: {type: String, default: "steem"},
    show: {type: Object, default: false},
    steem: {type: Object, default: false}
  }
};
</script>

<style scoped>
</style>
