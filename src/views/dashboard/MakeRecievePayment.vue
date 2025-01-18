<template>
  <b-row class="text-wrap">
    <b-col
      cols
      lg="6"
      sm="12"
    >
      <!-- Make Payment -->
      <b-card
        header="Make Payment"
        header-class="font-weight-bold"
        no-body
        class="mb-4"
      >
        <b-table
          :items="invoice.sale.data"
          :fields="saleFields"
          borderless
          hover
          responsive
          show-empty
        >
          <template #empty>
            <h4>No invoices fore receipt!!!</h4>
          </template>
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
    </b-col>
    <b-col
      cols
      lg="6"
      sm="12"
    >
      <!-- Receive Payment -->
      <b-card
        header="Receive Payment"
        header-class="font-weight-bold"
        no-body
        class="mb-4"
      >
        <b-table
          :items="invoice.purchase.data"
          :fields="purFields"
          borderless
          hover
          responsive
          show-empty
        >
          <template #empty>
            <h4>Hurray, no invoices to pay!!!</h4>
          </template>
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
    </b-col>
  </b-row>
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
          sortable: true,
        },
        {
          key: 'balanceamount',
          label: 'Amount',
          class: 'gk-currency',
          sortable: true,
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
          sortable: true,
        },
        {
          key: 'balanceamount',
          label: 'Amount',
          sortable: true,
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
