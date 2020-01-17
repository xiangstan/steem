<template>
  <div v-if="show">
    <p class="notification is-danger">Provided account does not exist</p>
    <div v-else>
      {{acct}}
    </div>
  </div>
</template>

<script>
module.exports={
  props:{
    acct: {type: Object, default: false},
    show: {type: Boolean, default: false}
  }
};
</script>