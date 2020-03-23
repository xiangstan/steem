<template>
  <div v-if="Lang">
    <div class="message">
      <div class="message-header">
        {{Lang.steem.blog}}
        <a class="button-expand is-pulled-right" @click="expandBlog">[ <span>{{BlogExpandSign}}</span> ]</a>
      </div>
      <div class="message-body" v-if="BlogExpand">
        <div v-for="(blog,idx) in Blogs">
          <h3 class="has-text-weight-bold is-size-4"><a class="is-decoration-none" :href="GetUrl()+blog.url" target="_blank">{{blog.title}}</a></h3>
          <h4><strong>{{blog.author}}</strong> in {{blog.category}} {{blog.last_update}}</h4>
          <div>
            <a class="is-decoration-none" :href="GetUrl()+blog.url" target="_blank">{{GetBrief(blog.body)}}...</a>
          </div>
          <div class="line-break" v-if="idx<(Blogs.length-1)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports={
  computed: {
    Expands() { return this.$store.state.expand; },
    Lang() { return this.$store.state.lang; },
    SteemId() { return this.$store.state.SteemId; },
    Blogs() { return this.$store.state.Blogs; },
    BlogExpandSign: function() { return (this.BlogExpand) ? "-" : "+"; },
    BlogExpand: function() { return this.$store.state.expand.blog; }
  },
  data() {
    return {
      user: "",
    };
  },
  methods: {
    expandBlog() {
      this.$store.commit("updExpand", {cat: "blog", value: !this.BlogExpand });
      if(this.TokenExpand && that.SteemId !== false){
        this.$store.commit("setLoading", true);
        this.fetchBlog();
      }
    },
    fetchBlog() {
      const that = this;
      that.$root.$refs.app.SteemApiQry("getDiscussionsByBlog", {tag: this.SteemId, limit: 10}, function(error, result) {
        if (error === null) {
          that.$store.commit("updVar", {cat: "Blogs", value: result});
          that.$store.commit("setLoading", false);
        }
      });
    },
    /* create a brief description of blog content */
    GetBrief(data) {
      let temp = "";
      let div = document.createElement("div");
      div.innerHTML = data;
      temp = div.textContent || div.innerText || "";
      temp = temp.substring(0, 50);
      return temp;
    },
    GetUrl() {
      const opt = {
        steem: "https://steem.buzz",
        hive: "http://hive.log"
      };
      return opt[this.page];
    },
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
    this.fetchBlog();
  },
  props: {
    steem: {type: Object, default: false},
    page: {type: String, default: "steem"}
  }
};
</script>

<style scoped>
.line-break {
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 1em;
  margin-top: 2em;
}
.is-decoration-none {
  text-decoration: none!important
}
</style>
