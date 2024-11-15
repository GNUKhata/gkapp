<template>
  <section class="m-2">
    <balance />
    <!-- bank / cash stats -->
    <div v-if="dataIsFetched">
      <b-card-group deck>
        <!-- Tiles -->
        <b-card class="shadow p-0">
          <tiles />
        </b-card>
        <!-- Bank/Cash Balance graph -->
        <b-card
          class="shadow"
          no-body
        >
          <bank-cash-balance-graph :chart-input="dashboardData.balancedata" />
        </b-card>
      </b-card-group>
      <!-- Sale/Purchase Invoice Graphs -->
      <sale-purchase-invoice-graph :info="dashboardData.monthly_balance" />
      <!-- Make / Recieve Payment -->
      <make-recieve-payment
        :info="dashboardData"
        :on-payment="onPayment"
      />
      <!-- Most Valued Customers / suppliers -->
      <most-valued-c-s :info="dashboardData" />
      <!-- Most Sold Produc/ Services -->
      <most-sold-p-s :info="dashboardData" />
      <!-- Income / Assets Chart -->
      <income-assets-chart />

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
import Tiles from './Tiles.vue';
import BankCashBalanceGraph from './BankCashBalanceGraph.vue';
import MostValuedCS from './MostValuedCS.vue';
import Balance from './Balance.vue';
import MostSoldPS from './MostSoldPS.vue';
import SalePurchaseInvoiceGraph from './SalePurchaseInvoiceGraph.vue';
import MakeRecievePayment from './MakeRecievePayment.vue';
import IncomeAssetsChart from './IncomeAssetsChart.vue';
import EasyVoucher from '@/components/form/EasyVoucher.vue';

export default {
  components: {
    Tiles,
    BankCashBalanceGraph,
    MostValuedCS,
    Balance,
    MostSoldPS,
    SalePurchaseInvoiceGraph,
    MakeRecievePayment,
    IncomeAssetsChart,
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
