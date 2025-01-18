<template>
  <line-chart
    :width="200"
    :chart-options="chartOptions"
    :chart-data="chartData"
  />
</template>

<script>
// TODO vue3: migration
import { Line as LineChart } from 'vue-chartjs/legacy';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);

export default {
  name: 'BankCashBalanceGraph',
  components: { LineChart },
  props: {
    chartInput: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      chartData: {},
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  mounted() {
    this.chartData = {
      labels: this.chartInput.monthname,
      datasets: [
        {
          label: 'Bank Balance',
          data: this.chartInput.bankbalancedata,
          backgroundColor: '#ffc107',
          tension: 0.3,
        },
        {
          label: 'Cash Balance',
          data: this.chartInput.cashbalancedata,
          backgroundColor: '#28a745',
          tension: 0.3,
        },
      ],
    };
  },
};
</script>
