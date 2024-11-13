<template>
  <b-card-group
    deck
    class="mt-5"
  >
    <!-- Make Payment -->
    <b-card class="shadow">
      <b-card-header
        header-bg-variant="light"
        header-class="mb-1 font-weight-bold"
        header-text-variant="dark"
      >
        <translate>Make Payment</translate>
        <b-badge
          pill
          variant="primary"
          role="button"
          @click="sortPurchaseInvoice"
          class="mt-1 float-right"
        >
          <BIcon icon="filter" /> {{ invoice.purchase.sort_by }}
        </b-badge>
      </b-card-header>
      <b-table
        :items="invoice.purchase.data"
        :fields="purFields"
        class="table-border-dark"
        head-variant="dark"
        striped
        small
        responsive="sm"
      >
        <template #cell(invoiceno)="d">
          <router-link :to="'/workflow/Transactions-Invoice/' + d.item.invid">
            {{ d.item.invoiceno }}
          </router-link>
          to {{ d.item.custname }}
        </template>
        <template #cell(balanceamount)="d">
          {{ gk_currency(d.item.balanceamount) }}
        </template>
        <template #cell(payment)="data">
          <b-button
            @click="onPayment('payment', data.item.invid)"
            size="sm"
          >
            Pay
          </b-button>
        </template>
      </b-table>
    </b-card>
    <!-- Receive Payment -->
    <b-card class="shadow">
      <b-card-header
        header-bg-variant="light"
        header-class="mb-1 font-weight-bold"
        header-text-variant="dark"
      >
        <translate>Issue Receipt</translate>
        <b-badge
          pill
          variant="primary"
          role="button"
          @click="sortSaleInvoice"
          class="mt-1 float-right"
        >
          <BIcon icon="filter" /> {{ invoice.sale.sort_by }}
        </b-badge>
      </b-card-header>
      <b-table
        :items="invoice.sale.data"
        :fields="saleFields"
        class="table-border-dark"
        head-variant="dark"
        striped
        small
        responsive
      >
        <template #cell(invoiceno)="d">
          <router-link :to="'/workflow/Transactions-Invoice/' + d.item.invid">
            {{ d.item.invoiceno }}
          </router-link>
          from {{ d.item.custname }}
        </template>
        <template #cell(balanceamount)="d">
          {{ gk_currency(d.item.balanceamount) }}
        </template>
        <template #cell(receipt)="data">
          <b-button
            @click="onPayment('receipt', data.item.invid)"
            size="sm"
          >
            Receipt
          </b-button>
        </template>
      </b-table>
    </b-card>
  </b-card-group>
</template>

<script>
export default {
  name: 'MakeRecievePayment',
  props: {
    info: {
      type: [Array, Object],
      default: () => {},
    },
    onPayment: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      invoice: {
        purchase: {
          data: this.info.amtwisepurinv,
          sort_by: 'amount',
        },
        sale: {
          data: this.info.amtwisesaleinv,
          sort_by: 'amount',
        },
      },
      purFields: [
        {
          key: 'invoiceno',
          label: 'Invoice',
        },
        {
          key: 'invoicedate',
          label: 'Date',
        },
        {
          key: 'balanceamount',
          label: 'Amount',
          class: 'gk-currency',
        },
        {
          key: 'payment',
          label: '',
          tdClass: 'text-center',
        },
      ],
      saleFields: [
        {
          key: 'invoiceno',
          label: 'Invoice',
        },
        {
          key: 'invoicedate',
          label: 'Date',
        },
        {
          key: 'balanceamount',
          label: 'Amount',
          class: 'gk-currency',
        },
        {
          key: 'receipt',
          label: '',
          tdClass: 'text-center',
        },
      ],
    };
  },
  methods: {
    sortPurchaseInvoice() {
      if (this.invoice.purchase.sort_by === 'date') {
        this.invoice.purchase.data = this.info.amtwisepurinv;
        this.invoice.purchase.sort_by = 'amount';
      } else {
        this.invoice.purchase.data = this.info.datewisepurinv;
        this.invoice.purchase.sort_by = 'date';
      }
    },
    sortSaleInvoice() {
      if (this.invoice.sale.sort_by === 'date') {
        this.invoice.sale.data = this.info.amtwisesaleinv;
        this.invoice.sale.sort_by = 'amount';
      } else {
        this.invoice.sale.data = this.info.datewisesaleinv;
        this.invoice.sale.sort_by = 'date';
      }
    },
  },
};
</script>
