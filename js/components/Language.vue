<template>
  <div class="translate">
    <a class="has-text-grey is-pulled-right lang-icon" @click="Show=!Show">
      <i aria-hidden="true" class="fas fa-language fa-fw is-size-3"></i>
    </a>
    <div class="is-relative lang-select" v-if="Show">
      <div class="list is-hoverable">
        <a class="list-item" data-lang="en" @click="Select">English</a>
        <a class="list-item" data-lang="cn" @click="Select">中文</a>
      </div>
    </div>
  </div>
</template>

<script>
module.exports={
  computed: {
  },
  data: function() {
    return {
      Show: false
    };
  },
  methods: {
    Select: function(e) {
      const lang = e.currentTarget.dataset.lang;
      this.Show = false;
      this.$parent.GetLang(lang);
    }
  }
};
</script>

<style scoped>
.lang-icon {
  display: block;
  height: 40px;
}
.lang-select {
  margin-top: 40px;
  width: 100px;
}
.lang-select .list-item {
  background-color:#fff!important;
}
</style>
