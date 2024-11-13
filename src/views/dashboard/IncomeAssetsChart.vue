<template>
  <b-card-group
    deck
    class="mt-5"
  >
    <b-card>
      <b-card-header
        header-bg-variant="light"
        header-class="mb-1 font-weight-bold"
        header-text-variant="dark"
      >
        <translate>Assets & Liabilities</translate>
        <span class="text-muted">
          ({{ dateReverse(yearStart) }} to {{ dateReverse(yearEnd) }})
        </span>
      </b-card-header>
      <doughnut
        :chart-options="chartOptions"
        :chart-data="assetsChartData"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
      />
    </b-card>
    <b-card>
      <b-card-header
        header-bg-variant="light"
        header-class="mb-1 font-weight-bold"
        header-text-variant="dark"
      >
        <translate>Incomes & Expenses</translate>
        <span class="text-muted">
          ({{ dateReverse(yearStart) }} to {{ dateReverse(yearEnd) }})
        </span>
      </b-card-header>
      <doughnut
        :chart-options="chartOptions"
        :chart-data="incomeChartData"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
      />
    </b-card>
  </b-card-group>
</template>

<script>
import { Doughnut } from 'vue-chartjs/legacy';
import axios from 'axios';
import { mapState } from 'vuex';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export default {
  name: 'IncomeAssetsChart',
  components: {
    Doughnut,
  },
  props: {
    chartId: {
      type: String,
      default: 'doughnut-chart',
    },
    datasetIdKey: {
      type: String,
      default: 'label',
    },
    width: {
      type: Number,
      default: 300,
    },
    height: {
      type: Number,
      default: 300,
    },
    cssClasses: {
      default: '',
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showCharts: false,
      assetsChartData: {
        labels: ['Capital & Liabilities', 'Property & Assets'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651'],
            data: [100, 200],
          },
        ],
      },
      incomeChartData: {
        labels: [
          'Direct Income',
          'Indirect Income',
          'Direct Expenses',
          'Indirect Expenses',
        ],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            data: [100, 222],
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
    getData() {
      const profitLossData = axios.get(
        `/dashboard?type=profit-loss&calculatefrom=${this.yearStart}&calculateto=${this.yearEnd}`
      );
      const balanceSheetData = axios.get(
        `/dashboard?type=balancesheet&calculatefrom=${this.yearStart}&calculateto=${this.yearEnd}`
      );
      Promise.all([profitLossData, balanceSheetData])
        .then((r) => {
          if (r[0].status == 200 && r[1].status == 200) {
            this.assetsChartData.datasets[0].data = [
              r[1].data.gkresult[0],
              r[1].data.gkresult[1],
            ];
            this.incomeChartData.datasets[0].data = Object.values(
              r[0].data.gkresult
            );
            this.showCharts = true;
          } else {
            this.showCharts = false;
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
