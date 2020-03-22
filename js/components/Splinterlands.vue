<template>
  <div>
    <div class="columns">
      <div class="column is-half">
        <searchid :page="page" :steem="steem"></searchid>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-third">
        <prof-box :page="page" :show="show.Profile" :steem="steem" ref="splinterlands"></prof-box>
        <template v-if="hasPlayer > 0">
          <article class="message">
            <div class="message-body">
              <h3 class="has-text-weight-bold is-size-5 is-marg-bt-5">{{Lang.sms.basic}}</h3>
              <p v-if="Balance">
                <strong>DEC:</strong>
                {{Balance.dec}}
              </p>
              <p v-if="Balance">
                <strong>{{Lang.sms.capture_rate}}:</strong>
                {{Balance.ecr / 100}}%
              </p>
              <p>
                <strong>{{Lang.sms.legendary_potion}}:</strong>
                {{Balance.legendary}}
              </p>
              <p>
                <strong>{{Lang.sms.alchemy_potion}}:</strong>
                {{Balance.gold}}
              </p>
              <p>
                <strong>{{Lang.sms.orb}}:</strong>
                {{Balance.orb}}
              </p>
              <p>
                <strong>{{Lang.sms.total+Lang.steem.space+Lang.sms.ratio}}:</strong>
                {{SmsDetail.wins+" / "+(SmsDetail.battles-SmsDetail.wins)}}
                (<em>{{parseFloat(SmsDetail.wins*100/SmsDetail.battles).toFixed(2)}}%</em>)
              </p>
              <p>
              </p>
            </div>
          </article>
          <article class="message">
            <div class="message-body">
              <h3 class="has-text-weight-bold is-size-5 is-marg-bt-5">{{Lang.sms.season+" "+SmsDetail.season_details.season}}</h3>
              <p class="is-flex is-vcentered" v-if="SmsDetail.season_details.rating">
                <strong>{{Lang.sms.league}}:</strong>&nbsp;
                <span class="tooltip" :data-tooltip="Lang.sms[SmsDetail.season_details.league.name] + Lang.steem.space + SmsDetail.season_details.league.rank">
                  <img
                    class="league-icon"
                    :alt="Lang.sms[SmsDetail.season_details.league.name] + Lang.steem.space + SmsDetail.season_details.league.rank"
                    :src="Url.leagueIcon + 'league_' + SmsDetail.season_details.league.icon + '.png'"
                  />
                </span>
                <span>{{SmsDetail.season_details.rating}}</span>
              </p>
              <p>
                <strong>{{Lang.sms.season+Lang.steem.space+Lang.sms.ratio}}:</strong>
                {{SmsDetail.season_details.wins+" / "+(SmsDetail.season_details.battles-SmsDetail.season_details.wins)}}
                (<em>{{parseFloat(SmsDetail.season_details.wins*100/SmsDetail.season_details.battles).toFixed(2)}}%</em>)
              </p>
            </div>
          </article>
        </template>
        <p class="notification is-danger" v-else-if="hasPlayer<0">
          {{steemId}}
          <template v-if="Lang.index===cn">
            不曾开始玩Steem Monsters
          </template>
          <template v-else>
            has not started playing Steem Monsters
          </template>
        </p>
      </div>
      <div class="column">
        <div class="message is-info" v-if="Lang">
          <div class="message-header">
            <span>Splinterlands</span>
            <a class="button-expand is-pulled-right" @click="ExpandSteemmonsters">[ <span>{{ExpandSign}}</span> ]</a>
          </div>
          <div class="message-body" v-if="ExpandStat&&SmsDetail">
            <article class="message" v-if="MyCards.length>0">
              <div class="message-body" style="overflow: hidden; height: auto;">
                <h3 class="has-text-weight-bold is-size-5 is-marg-bt-5">{{Lang.sms.collection}}</h3>
                <div v-for="card in MyCards">
                  <div class="sms-card beta" role="button">
                    <img :src="Url.card + encodeURI(card.name) + '.png'" class="card-img" />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports={
  components:{
    "prof-box": window.httpVueLoader("./js/components/Profile.vue"),
    "searchid": window.httpVueLoader("./js/components/SearchId.vue"),
  },
  computed: {
    ExpandSign: function() { return (this.ExpandStat) ? "-" : "+"; },
    ExpandStat() { return this.$store.state.expand.sms; },
    Lang() { return this.$store.state.lang; },
    Profile() { return this.$store.state.Profile; },
    MyCards() {
      let cards = [];
      for (let obj in this.Collection) {
        cards.push(this.Collection[obj]);
      }
      return cards.sort((a, b) => (a.id > b.id) ? 1 : -1);
    },
    SteemId() { return this.$store.state.SteemId; }
  },
  data: function() {
    return {
      api: {
        balance: "players/balances?username=",
        cards: "cards/get_details",
        collection: "cards/collection/",
        detail: "players/details?name="
      },
      Balance: false,
      Collection: {},
      hasPlayer: 0,
      SmsDetail: false,
      Url: {
        api: "https://api.steemmonsters.io/",
        card: "https://d36mxiodymuqjm.cloudfront.net/cards_beta/",
        json: "https://steemmonsters.com/",
        leagueIcon: "https://d36mxiodymuqjm.cloudfront.net/website/icons/leagues/"
      }
    };
  },
  methods: {
    Init() {
      if (this.SteemId) {
        this.$store.commit("setLoading", true);
        this.searchAccount(this.SteemId);
      }
    },
    ExpandSteemmonsters() {
      this.$store.commit("updExpand", {cat: "sms", value: !this.ExpandStat });
      if(this.ExpandStat && this.SteemId !== false){
        this.LoadCards();
      }
    },
    // get league rating from SmsDetail.season_details.rating
    GetLeague(rating) {
      const table = [
        {point: 4700, league: "champion", rank: "I"},
        {point: 4200, league: "champion", rank: "II"},
        {point: 3700, league: "champion", rank: "III"},
        {point: 3400, league: "diamond", rank: "I"},
        {point: 3100, league: "diamond", rank: "II"},
        {point: 2800, league: "diamond", rank: "III"},
        {point: 2500, league: "Gold", rank: "I"},
        {point: 2200, league: "Gold", rank: "II"},
        {point: 1900, league: "Gold", rank: "III"},
        {point: 1600, league: "silver", rank: "I"},
        {point: 1300, league: "silver", rank: "II"},
        {point: 1000, league: "silver", rank: "III"},
        {point: 700, league: "bronze", rank: "I"},
        {point: 400, league: "bronze", rank: "II"},
        {point: 100, league: "bronze", rank: "III"},
        {point: 0, league: "novice", rank: ""}
      ];
      for(let i=0; i<table.length; i++) {
        if(rating >= table[i].point) {
          let output = {
            icon: table.length - 1 - i,
            name: table[i].league,
            rank: table[i].rank
          };
          return output;
          break;
        }
      }
    },
    // load balances
    LoadBalance(steemId) {
      console.log("LoadBalance: "+steemId);
      axios.get(this.Url.json + this.api.balance + steemId).then((result) => {
        if (result.data) {
          let balance = {};
          let temp = result.data;
          for (let i = 0; i < temp.length; i++) {
            balance[temp[i].token.toLowerCase()] = temp[i].balance;
          }
          this.Balance = balance;
          this.hasPlayer = 1;
        }
        else {
          this.hasPlayer = -1;
        }
      });
    },
    // load all cards
    LoadCards() {
      axios.get(this.Url.json + this.api.cards).then((result) => {
        if (result.data) {
          //this.Collection = result.data;
          this.LoadCollection(result.data);
        }
      });
    },
    // load card collection
    LoadCollection(cards) {
      axios.get(this.Url.api + this.api.collection + this.SteemId).then((result) => {
        if (result.data) {
          let collect = result.data.cards;
          let temp = {};
          for (let i = 0; i < collect.length; i++) {
            for (let j = 0; j < cards.length; j++) {
              if (collect[i].card_detail_id === cards[j].id) {
                if (typeof this.Collection[cards[j].id] !== "undefined") {
                  temp[cards[j].id].count++;
                }
                else {
                  temp[cards[j].id] = {
                    id: cards[j].id,
                    editions: cards[j].editions,
                    name: cards[j].name,
                    level: collect[i].level,
                    gold: collect[i].gold,
                    xp: collect[i].xp,
                    count: 1
                  };
                }
                break;
              }
            }
          }
          this.Collection = temp;
        }
      });
    },
    // load player detail
    LoadPlayer(steemId) {
      axios.get(this.Url.api + this.api.detail + steemId).then((result, error) => {
        if (typeof result.data.error==="undefined") {
          this.SmsDetail = result.data;
          this.SmsDetail.season_details.league = this.GetLeague(this.SmsDetail.season_details.rating);
          this.LoadBalance(steemId);
        }
        else {
          console.log(error)
          this.hasPlayer = -1;
        }
      });
    },
    searchAccount: function(steemId) {
      this.SmsDetail = false;
      this.hasPlayer = 0;
      this.Collection = {};
      this.$store.commit("updExpand", {cat: "sms", value: false });
      this.$parent.searchAccount(steemId);
      this.LoadPlayer(steemId);
    }
  },
  mounted() {
    this.Init();
  },
  props: {
    page: {type: String, default: "splinterlands"},
    show: {type: Object, default: false},
    steem: {type: Object, default: false}
  }
};
</script>

<style scoped>
.sms-card {
  display: inline-block;
  float: left;
  width: 140px;
  margin: 10px 5px;
  height: 196px;
  cursor: pointer;
  transition: all .3s ease;
}
.sms-card:hover {
  box-shadow: 0 0 20px white;
  transform: scale(1.1);
}
.sms-card-img {
  width: 140px;
  height: 196px;
  box-shadow: 0 0 10px black;
}
.league-icon {
  height: 24px
}
</style>
