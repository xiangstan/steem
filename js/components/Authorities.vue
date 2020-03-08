<template>
  <div class="message is-info is-small" v-if="apps">
    <div class="message-header">
      <p>{{Lang.steem.authorized_app}}</p>
    </div>
    <div class="message-body">
      <p v-for="app in apps">
        <a class="has-text-danger tooltip" :href="SteemConnect + app[0]" target="_blank" :data-tooltip="Lang.steem.revoke_access+app[0]">
          <i aria-hidden="true" class="fas fa-trash-alt fa-fw"></i>
        </a>
        {{app[0]}}
      </p>
    </div>
  </div>
</template>

<script>
module.exports={
  computed: {
    Lang: function() { return this.$store.state.lang; }
  },
  data: function() {
    return {
      SteemConnect: "https://beta.steemconnect.com/revoke/"
    };
  },
  props:{
    apps:{type:Object,default:false},
  }
}
</script>

<style scoped>
.has-text-danger:hover {
  text-shadow: 0 2px 10px rgba(10,10,10,.1);
}
</style>
