<template>
  <pie
    v-if="loaded"
    :chart-data="accountsPieData"
    :chart-options="chartOptions"
  />
</template>

<script>
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs/legacy'

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  name: 'AccountsPieChart',
  props: {
    accountType: {
      type: String,
      required: true,
    },
  },
  components: {
    Pie,
  },
  data() {
    return {
      loaded: false,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      accountsPieData: {
        labels: [],
        datasets: [{
          data: [],
        }]
      }
    }
  },
  methods: {
    getAccountsData() {
      let url = '/dashboard?type=account_balances&group='+this.accountType;
      this.$axios({ method: "GET", url: url })
        .then((resp) => {
          this.accountsPieData = {
            labels: resp["account_names"],
            datasets: [
              {
                backgroundColor: [
                  "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6",
                  "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11",
                  "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#651067"
                ],
                data: resp["account_balances"],
              }
            ]
          };
          this.loaded = true;
          console.log(this.accountsPieData);
        })
    },
  },
  mounted() {
    this.loaded = false;
    this.getAccountsData();
  },
};
</script>
