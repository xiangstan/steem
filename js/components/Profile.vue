<template>
  <div v-if="show">
    <div v-if="Profile">
      <!-- User Info -->
      <div class="card">
        <div class="card-content">
          <div class="media">
            <div class="media-left">
              <figure class="image is-96x96">
                <img class="profile-image" :src="metadata.profile_image" :alt="Profile.name" />
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">
                {{metadata.name}}
                <span class="likr" v-if="likr">
                  <img src="./images/clap.png" />
                </span>
              </p>
              <p class="subtitle is-6 is-italic">@{{Profile.name}}</p>
              <p class="" v-if="metadata.location">
                <i class="fas fa-map-marker-alt fa-fw"></i> {{metadata.location}}
              </p>
            </div>
          </div>
          <div class="content">
            <p>{{metadata.about}}</p>
            <div class="is-6">
              <div class="social-media">
                <span class="icon-website" v-if="metadata.website">
                  <i class="fab fa-chrome fa-fw"></i>
                  <a class="social-link" :href="metadata.website" target="_blank">{{metadata.website}}</a>
                </span>
                <span class="icon-linkedin" v-if="metadata.linkedin">
                  <i class="fab fa-linkedin fa-fw"></i>
                  <a class="social-link" :href="'https://www.linkedin.com/in/'+metadata.linkedin" target="_blank">{{metadata.linkedin}}</a>
                </span>
                <span class="icon-facebook" v-if="metadata.facebook">
                  <i class="fas fa-map-marker-alt"></i> {{metadata.facebook}}
                </span>
                <span class="" v-if="metadata.youtube">
                  <i class="fab fa-youtube fa-fw"></i> {{metadata.youtube}}
                </span>
                <span class="" v-if="metadata.instagram">
                  <i class="fab fa-instagram fa-fw"></i> {{metadata.instagram}}
                </span>
                <span class="icon-github" v-if="metadata.github">
                  <i class="fab fa-github fa-fw"></i>
                  <a class="social-link" :href="'https://github.com/'+metadata.github" target="_blank">{{metadata.github}}</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- STEEM Info -->
      <div class="card" v-if="page==='hive' || page==='steem'">
        <div class="card-content">
          <div class="content">
            <p><strong>{{Lang.steem[page].toUpperCase()}}:</strong> {{Profile.balance}}</p>
            <!-- <p><strong>Steem Power:</strong> {{profile.balance}}</p> -->
            <p><strong>{{Lang.steem[page].toUpperCase()}} Dollars:</strong> {{Profile.sbd_balance}}</p>
            <p><strong>{{Lang.profile.savings}}:</strong> {{Profile.savings_balance}}</p>
            <div class="line-break"></div>
            <p v-if="ChainGlobalProps">
              <strong>{{Lang.profile.steem_power}}:</strong>
              <template v-if="ChainGlobalProps && ChainPower">
                {{CommaSeparated(CalcChainPower.toFixed(2))}}
                (<em>{{CommaSeparated(ChainPower.own)}} {{delegatedpower}}</em>)
              </template>
              <template v-else>
                <i aria-hidden="true" class="fas fa-spinner fa-spin"></i> Loading...
              </template>
            </p>
            <p>
              <strong>{{Lang.profile.voting + Lang.steem.space +Lang.profile.power}}:</strong> {{ChainVotePower}}%
            </p>
            <p>
              <strong>{{Lang.profile.downvote + Lang.steem.space +Lang.profile.power}}:</strong> {{ChainDownPower}}%
            </p>
            <!-- <p>
              <strong>Upvote:</strong> ${{upvote}}
            </p> -->
            <div class="line-break"></div>
            <p v-if="ChainMedianPrice">
              <strong>{{Lang.profile.steem_price}}:</strong> ${{ChainMedianPrice}}
            </p>
            <p v-if="ChainRecentClaim">
              <strong>Recent Claims:</strong> {{CommaSeparated(ChainRecentClaim / 1e9)}} B
            </p>
          </div>
        </div>
      </div>
      <!-- End -->
    </div>
    <p class="notification is-danger" v-else>Provided account does not exist</p>
  </div>
</template>

<script>
module.exports={
  computed: {
    CalcChainPower() {
      return parseFloat(this.ChainPower.own) + this.CalcDelegated(this.ChainPower, true);
    },
    /* dynamic global properties */
    ChainGlobalProps() {
      return this.$store.state.Chain[this.page].GlobalProps;
    },
    /* dynmanic median price */
    ChainMedianPrice() {
      let temp = this.$store.state.Chain[this.page].curMHisPrice;
      if (temp) {
        return parseFloat(temp.base.split(" ")[0]) / parseFloat(temp.quote.split(" ")[0]);
      }
      else { return false; }
    },
    /* steem user self steem power */
    ChainPower: function() {
      /* https://steemit.com/utopian-io/@stoodkev/steemjs-for-dummies-2-calculate-the-user-s-steem-power */
      if(this.ChainGlobalProps){
        return {
          own: parseFloat(this.steem.formatter.vestToSteem(this.Profile.vesting_shares, this.ChainGlobalProps.total_vesting_shares, this.ChainGlobalProps.total_vesting_fund_steem).toFixed(2)),
          delegated: parseFloat(this.steem.formatter.vestToSteem(
            this.Profile.delegated_vesting_shares,
            this.ChainGlobalProps.total_vesting_shares,
            this.ChainGlobalProps.total_vesting_fund_steem
          ).toFixed(2)),
          received: parseFloat(this.steem.formatter.vestToSteem(
            this.Profile.received_vesting_shares,
            this.ChainGlobalProps.total_vesting_shares,
            this.ChainGlobalProps.total_vesting_fund_steem
          ).toFixed(2))
        };
      }
      else{ return false; }
    },
    // user down vote power
    ChainDownPower() {
      const sec = (new Date - new Date(this.Profile.downvote_manabar.last_update_time * 1000)) / 1000;
      const mana = this.Profile.downvote_manabar.current_mana / (this.Profile.voting_manabar.current_mana / (this.Profile.voting_power / 100) / 4);
      return Math.min((mana * 100 + (10000 * sec / 432000)) / 100, 100).toFixed(2);
    },
    /* user voting power */
    ChainVotePower() {
      /* https://steemit.com/utopian-io/@stoodkev/steem-js-for-dummies-1-how-to-calculate-the-current-voting-power */
      const sec = (new Date - new Date(this.Profile.last_vote_time + "Z")) / 1000;
      return Math.min((this.Profile.voting_power + (10000 * sec / 432000)) / 100, 100).toFixed(2);
    },
    /* recent claim */
    ChainRecentClaim: function() {
      if (this.ChainRewardFund) { return this.ChainRewardFund.recent_claims; }
      else { return false; }
    },
    /* steem reward fund */
    ChainRewardFund: function() {
      return this.$store.state.Chain[this.page].RewardFund;
    },
    /* steem user delegated power */
    delegatedpower: function() {
      return this.CalcDelegated(this.ChainPower, false);
    },
    likr: function() {
      const location = this.metadata.location;
      if(typeof location !=="undefined" && location !== "") {
        const loc = this.metadata.location.split(":");
        if( loc[0] === "likerid" ) { return loc[1]; }
        else { return false; }
      }
      else { return false; }
    },
    Lang: function() { return this.$store.state.lang; },
    metadata: function() {
      if (this.Profile) {
        const temp = JSON.parse(this.Profile.json_metadata)
        return temp.profile;
      }
      else {
        return false;
      }
    },
    Profile() { return this.$store.state.Profile; },
    /* check if to show vote power section box */
    ShowMoney() {
      const flag = {
        hive: true,
        splinterlands: false,
        steem: true
      }
      return flag[this.page] || false;
    }
  },
  methods: {
    CalcDelegated: function(value, status = false) {
      if(this.ChainPower){
        let received = parseFloat(this.ChainPower.received);
        let delegated = parseFloat(this.ChainPower.delegated);
        if (!status) {
          let sign = (received > delegated)? "+" : "-";
          return sign + " " + this.CommaSeparated(Math.abs(received - delegated));
        }
        else { return (received - delegated); }
      }
      else{ return false; }
    },
    CommaSeparated: function(value) {
      return parseInt(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  },
  props:{
    page: {type: String, default: "Steem"},
    show: {type: Boolean, default: false},
    steem: {type: Object, default: false}
  }
};
</script>

<style scoped>
.card{
  margin-bottom:1.25rem;
}
.card .content{
  overflow:hidden;
}
.profile-image{
  border-radius: 50%;
  border:5px solid #fff;
  box-shadow: 0px 0px 6px #444;
  height: 100%;
  width: 100%;
}
.icon-facebook{
  color:#3b5998;
}
.icon-github{
  color:#333;
}
.icon-linkedin{
  color:#0077b5;
}
.icon-website{
  color:#ea4335;
}
.likr {
  background-color: #28646e;
  -webkit-border: 3px solid #50e3c2;
  -moz-border: 3px solid #50e3c2;
  border: 3px solid #50e3c2;
  -webkit-border-radius: 50%;
  -moz-border-radius: 50%;
  border-radius: 50%;
  display: inline-block;
  height: 32px;
  padding: 0.374rem;
  position: relative;
  vertical-align: middle;
  width: 32px;
}
.likr img {
  display: block;
  margin: auto;
  padding-top: 2px;
  width: 90%;
}
.line-break {
  border-bottom: 1px solid #dbdbdb;
  margin-bottom: 1em;
}
.social-media span {
  display:block;
  width:100%;
}
.social-media .social-link{
  color:#4a4a4a!important;
}
</style>
