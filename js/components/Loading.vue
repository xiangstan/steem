<template>
  <div class="load-fullscreen" v-if="isLoading&&Lang">
    <div class="load-dialog">
      <i aria-hidden="true" class="fas fa-spinner fa-spin"></i>
      {{Lang.steem.load + Lang.steem.ing}}
    </div>
  </div>
</template>

<script>
module.exports = {
  computed: {
    isLoading: function() { return this.$store.state.loading; },
    Lang: function() { return this.$store.state.lang; }
  }
}
</script>

<style scoped>
.load-fullscreen {
  background-color: rgba(0,0,0,0.1);
  display: block;
  height: 100%;
  left: 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}
.load-dialog {
  bottom: 0;
  display: block;
  font-weight: bold;
  left: 0;
  padding: 20px;
  position: fixed;
  margin: auto;
  width: 100%;
  z-index: 1001;
}
</style>
