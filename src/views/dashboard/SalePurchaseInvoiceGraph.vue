<template>
  <!-- Sale Invoices -->
  <line-chart
    :chart-options="chartOptions"
    :chart-data="chartData"
  />
</template>

<script>
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
  name: 'SalePurchaseInvoiceGraph',
  components: { LineChart },
  props: {
    info: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      chartData: {
        labels: this.info.purchase.map(item => item.month),
        datasets: [
          {
            label: 'Purchase Invoices',
            backgroundColor: '#f87979',
            data: this.info.purchase.map(item => item.balance),
            tension: 0.3,
          },
          {
            label: 'Sale Invoices',
            backgroundColor: '#f87979',
            data: this.info.sale.map(item => item.balance),
            tension: 0.3,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
};
</script>
