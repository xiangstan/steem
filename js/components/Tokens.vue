<template>
  <div class="message is-info" v-if="tokens">
    <div class="message-header">
      Token Wallet
    </div>
    <div class="message-body">
      {{tokens}}
    </div>
  </div>
</template>

<script>
module.exports={
  computed: {
  },
  data: function() {
    return {
    }
  },
  methods: {
  },
  props: {
    tokens: {type: Object, default: false},
  }
};
</script>

<style scoped>
</style>