<template>
  <b-card
    class="border-0 text-center mt-2"
  >
    <p class="h2">
      Gross {{ gross_label }}
    </p>
    <p class="h5 text-muted font-italic font-weight-light">
      Fin Year: {{ yearStart.split('-')[0] }} -
      {{ yearEnd.split('-')[0].slice(2, 4) }}
    </p>
    <p class="h1 text-dark">
      ₹ {{ gross_value }}
    </p>
    ***
    <br>
    <br>
    <p class="h2">
      Net {{ net_label }}
    </p>
    <p class="h5 text-muted font-italic font-weight-light">
      Fin Year: {{ yearStart.split('-')[0] }} -
      {{ yearEnd.split('-')[0].slice(2, 4) }}
    </p>
    <p class="h1 text-dark">
      ₹ {{ net_value }}
    </p>
    ***
  </b-card>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ProfitLossSummary',
  data() {
    return {
      net_label: '',
      net_value: 0,
      gross_label: '',
      gross_value: 0,
    };
  },
  computed: {
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
    getData() {
      this.$axios.get(
        `/reports/profit-loss?calculatefrom=${this.yearStart}&calculateto=${this.yearEnd}`
      )
        .then((resp) => {
          this.net_label = resp.summary.net.label;
          this.net_value = resp.summary.net.value;
          this.gross_label =  resp.summary.gross.label;
          this.gross_value = resp.summary.gross.value;
        })
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
