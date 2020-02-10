<template>
  <div class="message is-info is-small" v-if="apps">
    <div class="message-header">
      <p>Authorities</p>
    </div>
    <div class="message-body">
      <p v-for="app in apps">
        <a class="has-text-danger" :href="SteemConnect + app[0]" target="_blank" :title="'Revoke access from '+app[0]">
          <i aria-hidden="true" class="fas fa-trash-alt fa-fw"></i>
        </a>
        {{app[0]}}
      </p>
    </div>
  </div>
</template>

<script>
module.exports={
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