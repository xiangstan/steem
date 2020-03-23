<template>
  <div class="field has-addons">
    <div class="control is-expanded">
      <input class="input" placeholder="Provide a Hive ID" v-model="user" />
    </div>
    <div class="control">
      <a class="button is-info" data-method="main" @click="searchId">
        <i aria-hidden="true" class="fas fa-search fa-fw"></i> {{Lang.profile.search}}
      </a>
    </div>
  </div>
</template>

<script>
module.exports={
  computed: {
    Expands() { return this.$store.state.expand; },
    Lang() { return this.$store.state.lang; },
    SteemId() { return this.$store.state.SteemId; }
  },
  data() {
    return {
      user: "",
      token: false,
      show: false
    };
  },
  methods: {
    searchId: function(e) {
      const steemId = this.user;
      for(let obj in this.Expands) {
        this.$store.commit("updExpand", {});
      }
      this.$store.commit("updFollowList", []);
      this.$store.commit("setLoading", true);
      this.$parent.searchAccount(steemId);
    },
  },
  mounted() {
    this.user = this.SteemId;
  },
  props: {
    steem: {type: Object, default: false},
    page: {type: String, default: "steem"}
  }
};
</script>

<style scoped>
</style>
