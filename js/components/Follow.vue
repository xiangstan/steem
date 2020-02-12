<template>
  <div>
    <div class="tabs is-toggle is-fullwidth follow-tab">
      <ul>
        <li>
          <a data-tab="follower" title="Followers" @click="SetActive">
            <i aria-hidden="true" class="fas fa-user-friends"></i>
          </a>
        </li>
        <li>
          <a data-tab="following" title="Following" @click="SetActive">
            <i aria-hidden="true" class="fas fa-user-plus"></i>
          </a>
        </li>
      </ul>
    </div>
    <div class="follow-list">
      <p class="is-italic" v-if="isList.length<1">
        Nothing to load
      </p>
      <div v-else>
        <p class="has-text-weight-bold is-capitalized">{{CurrentTab}}</p>
        <p v-for="user in isList">
          <a @click="Query(user[CurrentTab])">{{user[CurrentTab]}}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
module.exports={
  computed: {
    isList: function() { return this.$store.state.followList; },
    SteemId: function() { return this.$store.state.main.steemId; }
  },
  data: function() {
    return {
      CurrentTab: "follower",
    };
  },
  methods: {
    /* select the tab to be the current active tab */
    SetActive: function(e) {
      const data = e.currentTarget.dataset;
      this.CurrentTab = data.tab;
      this.$store.commit("updFollowList", []);
      this.$store.commit("setLoading", true);
      this.GetFollow(this.GetMethod());
    },
    GetFollow: function(method) {
      const that = this;
      window.setTimeout(function() {
        steem.api[method](that.SteemId, 0, "blog", 100, (err, result) => {
          if (err) {
            that.$store.commit("updFollowList", [
              { "follower": '<p class="notification is-danger">Error: '+ err +'</p>' }
            ]);
          }
          else{ that.$store.commit("updFollowList", result); }
          that.$store.commit("setLoading", false);
        });
      }, 100);
    },
    GetMethod: function() {
      let method = "";
      if(this.CurrentTab === "follower"){ method = "getFollowers"; }
      else { method = "getFollowing"; }
      return method;
    },
    /* click to search selected steemid */
    Query: function(steemId) {
      const target = {
        currentTarget: {
          dataset: { method: "main" }
        }
      };
      this.$parent.user.main = steemId;
      this.$parent.searchId(target);
      this.$store.commit("updateMainSteemId", steemId);
      this.$store.commit("updFollowList", []);
    }
  },
  props: {
    steem: {type: Object, default: false}
  }
};
</script>

<style scoped>
.follow-list {
  border:1px solid rgb(219,219,219);
  border-top:none;
  padding:10px;
}
.follow-tab {
  margin-bottom:0rem!important;
  padding:bottom:0.5rem!important;
}
</style>