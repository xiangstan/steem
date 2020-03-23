<template>
  <div>
    <div class="columns">
      <div class="column is-half">
        <searchid :page="page" :steem="steem"></searchid>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-third">
        <prof-box :page="page" :show="show.Profile" :steem="steem" ref="hiveprofile"></prof-box>
      </div>
      <div class="column">
        <blog-list></blogs-list>
      </div>
    </div>
  </div>
</template>

<script>
module.exports={
  components:{
    "blog-list": window.httpVueLoader("./js/components/BlogList.vue"),
    "prof-box": window.httpVueLoader("./js/components/Profile.vue"),
    "searchid": window.httpVueLoader("./js/components/SearchId.vue"),
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
    page: {type: String, default: "hive"},
    show: {type: Object, default: false},
    steem: {type: Object, default: false}
  }
};
</script>

<style scoped>
</style>
