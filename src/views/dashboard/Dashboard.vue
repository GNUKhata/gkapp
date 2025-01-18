<template>
  <section class="m-2">
    <b-row class="text-wrap mb-5">
      <b-col
        cols
        lg="6"
        sm="12"
      >
        <h1 class="display-4 mb-4">
          Welcome {{ userName }},
        </h1>
      </b-col>
      <b-col
        cols
        lg="6"
        sm="12"
        class="text-right"
      >
        <h2 class="display-6 mb-4">
          {{ orgName }}
        </h2>
        <div
          class="text-wrap float-right"
          style="width: 12rem;"
        >
          {{ dashboardData.contact }}
        </div>
      </b-col>
    </b-row>
    <div v-if="dataIsFetched">
      <b-row class="text-wrap">
        <b-col
          cols
          lg="8"
          sm="12"
        >
          <b-card
            header="Cash Flow"
            header-class="font-weight-bold"
            class="mb-4"
          >
            <bank-cash-balance-graph :chart-input="dashboardData.balancedata" />
          </b-card>
        </b-col>
        <b-col
          cols
          lg="4"
          sm="12"
        >
          <b-card
            class="border-0"
            no-body
          >
            <cash-accounts />
          </b-card>
        </b-col>
      </b-row>
      <make-recieve-payment
        :info="dashboardData"
        :on-payment="onPayment"
      />
      <b-row class="text-wrap">
        <b-col
          cols
          lg="8"
          sm="12"
        >
          <b-card
            header="Purchase and Sales"
            header-class="font-weight-bold"
            class="mb-4"
          >
            <sale-purchase-invoice-graph :info="dashboardData.monthly_balance" />
          </b-card>
        </b-col>
        <b-col
          cols
          lg="4"
          sm="12"
        >
          <profit-loss-summary />
        </b-col>
      </b-row>
      <b-row class="text-wrap">
        <b-col
          cols
          lg="3"
          sm="12"
        >
          <b-card
            title="Assets"
            class="mb-4"
          >
            <accounts-pie-chart account-type="assets" />
          </b-card>
        </b-col>
        <b-col
          cols
          lg="3"
          sm="12"
        >
          <b-card
            title="Liabilities"
            class="mb-4"
          >
            <accounts-pie-chart account-type="liabilities" />
          </b-card>
        </b-col>
        <b-col
          cols
          lg="6"
          sm="12"
        >
          <most-sold-p-s :info="dashboardData" />
        </b-col>
      </b-row>
      <b-modal
        size="lg"
        v-model="showVoucherModal"
        centered
        static
        body-class="p-0"
        id="contact-item-modal"
        hide-footer
        hide-header
      >
        <easy-voucher
          :type="voucherType"
          :inv-id="voucherInvId"
          :on-save="onPaymentComplete"
        />
      </b-modal>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import BankCashBalanceGraph from './BankCashBalanceGraph.vue';
import AccountsPieChart from './AccountsPieChart.vue';
import CashAccounts from './CashAccounts.vue';
import ProfitLossSummary from './ProfitLossSummary.vue';
import MostSoldPS from './MostSoldPS.vue';
import SalePurchaseInvoiceGraph from './SalePurchaseInvoiceGraph.vue';
import MakeRecievePayment from './MakeRecievePayment.vue';
import EasyVoucher from '@/components/form/EasyVoucher.vue';
import { mapState } from 'vuex';

export default {
  components: {
    BankCashBalanceGraph,
    AccountsPieChart,
    ProfitLossSummary,
    CashAccounts,
    MostSoldPS,
    SalePurchaseInvoiceGraph,
    MakeRecievePayment,
    EasyVoucher,
  },
  name: 'Dashboard',
  data() {
    return {
      dashboardData: {},
      dataIsFetched: false,
      showVoucherModal: false,
      voucherType: 'payment',
      voucherInvId: -1,
    };
  },
  computed: {
    ...mapState(['userName', 'orgName']),
  },
  methods: {
    onPayment(type, id) {
      this.voucherType = type;
      this.voucherInvId = id;
      this.showVoucherModal = true;
    },
    onPaymentComplete() {
      this.showVoucherModal = false;
      this.voucherInvId = -1;
      this.getDashboardData();

    },
    getDashboardData() {
      axios
        .get('/dashboard?type=dashboarddata')
        .then((r) => {
          if (r.status == 200) {
            this.dashboardData = r.data.gkresult;
            this.dataIsFetched = true;
            this.$forceUpdate();
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
  created() {
    this.getDashboardData();
  },
};
</script>
