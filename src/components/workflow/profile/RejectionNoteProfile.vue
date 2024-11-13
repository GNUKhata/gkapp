<template>
  <b-container fluid>
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <!-- action buttons -->
    <div class="mb-3 clearfix d-print-none">
      <div class="float-right">
        <span>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
            v-if="!pdata.cancelledFlag"
          >
            <b-icon
              class="mr-1"
              icon="eye"
            />
            <router-link
              class="custom-link"
              :to="
                `/workflow/Transactions-Invoice/${rnote.invid}`
              "
            >View Invoice
            </router-link>
          </b-button>
        </span>
      </div>
    </div>
    <b-row>
      <b-col
        order="2"
        order-md="1"
      >
        <b
          v-translate
          v-if="party.isCustomer"
        > Customer Details </b>
        <b
          v-translate
          v-else
        > Supplier Details </b>
        <p class="text-small">
          <span>
            <router-link :to="`/ledger/${custid}`">{{ party.name }}</router-link>
          </span><br>
          <span> {{ party.addr }} </span><br>
          <span> {{ party.state }} </span><br>
        </p>
        <br class="d-none d-md-block">
      </b-col>
      <b-col
        class="text-md-right"
        cols="12"
        md="6"
        order="1"
        order-md="2"
      >
        <b v-translate> Rejection Note Details </b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="rnoteData"
          small
          bordered
          thead-class="d-none"
          fixed
          class="text-small table-border-dark"
        />
      </b-col>
    </b-row>
    <!-- Content Table -->
    <b-table-lite
      :items="rnote.contents"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      small
      striped
      tbody-tr-class="gk-vertical-row"
      class="text-small table-border-dark"
    >
      <template #cell(name)="data">
        <template v-if="data.item.gsflag === 7">
          <router-link
            :to="`/product-register?product_id=${data.item.productcode}&current_date=${toDate}&goid=${data.item.goid}`"
          >
            {{ data.item.name }}
          </router-link>
        </template>
        <template v-else>
          <span>{{ data.item.name }}</span>
        </template>
      </template>
      <template #cell(qty)="data">
        {{ data.value }} <small> {{ data.item.uom }} </small>
      </template>
    </b-table-lite>
    <b-row>
      <b-col
        class="my-2"
        order="2"
        order-md="1"
      />
      <b-col
        cols="12"
        md="8"
        class="my-2"
        order="1"
        order-md="2"
      >
        <!-- Total Table -->
        <b-table-lite
          :items="totalDetails"
          :fields="[
            {key: 'title', label: 'Total', tdClass: ''},
            {key: 'value', label: '₹', class: 'text-right'},
          ]"
          small
          fixed
          class="text-small"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col class="my-2" />
      <b-col
        cols="12"
        md="8"
        class="my-2"
      >
        <b v-translate> Narration: </b> {{ rnote.narration }}
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';
import { numberToRupees } from '../../../js/utils.js';
export default {
  name: 'RejectionNoteProfile',
  props: {
    id: {
      type: Number,
      required: true,
    },
    pdata: {
      type: Object,
      required: true,
    },
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of Invoice, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  data() {
    return {
      isPreloading: false,
      rnote: {
        date: '',
        contents: [],
        narration: '',
        inv: {},
        isGst: true,
      },
      total: {},
      party: {},
      toDate: '',
      custid: null,
    };
  },
  computed: {
    rnoteData: (self) => {
      return [
        { title: self.$gettext('No.'), value: self.rnote.no },
        { title: self.$gettext('Date'), value: self.rnote.date },
        { title: self.$gettext('Inv No.'), value: self.rnote.inv.no },
        { title: self.$gettext('Inv Date'), value: self.rnote.inv.date },
      ];
    },
    tableFields: (self) => {
      let fields = [
        {
          key: 'name',
          label: self.$gettext('Item'),
        },
        { key: 'qty', label: self.$gettext('Rejected Qty') },
        {
          key: 'rate',
          label: self.$gettext('Rate (₹)'),
          tdClass: 'gk-currency-sm',
        },
        { key: 'igst', label: 'IGST (%)' },
        { key: 'cgst', label: 'CGST (%)' },
        { key: 'sgst', label: 'SGST (%)' },
        { key: 'cess', label: 'CESS (%)' },
        {
          key: 'total',
          label: self.$gettext('Total (₹)'),
          tdClass: 'gk-currency-sm',
        },
      ];
      if (self.total.isIgst) {
        fields.splice(4, 2);
      } else {
        fields.splice(3, 1);
      }

      return fields;
    },
    totalDetails: (self) => {
      let total = [
        { title: self.$gettext('Taxable'), value: self.total.taxable },
      ];
      if (self.rnote.isGst) {
        if (self.total.isIgst) {
          total.push({ title: 'IGST', value: self.total.tax });
        } else {
          total.push(
            { title: 'CGST', value: self.total.tax },
            { title: 'SGST', value: self.total.tax }
          );
        }
        total.push({ title: 'CESS', value: self.total.cess });
      } else {
        total.push({ title: 'VAT', value: self.total.tax });
      }
      total.push(
        { title: self.$gettext('Rejected Value'), value: Math.round(self.total.amount).toFixed(2)},
        { title: 'Total In Words', value: numberToRupees(Math.round(self.total.amount)) }
      );
      return total;
    },
  },
  methods: {
    formatDetails(details) {
      this.saleFlag = details.psflag === 19;

      this.total = {
        amount: details.rejectedtotal,
        isIgst: details.taxname === 'IGST',
        cess: details.totalcessamt,
        tax: details.totaltaxamt,
        taxable: details.totaltaxablevalue,
      };
      this.rnote = {
        contents: [],
        date: details.rndate,
        narration: details.rejnarration,
        inv: {
          no: details.rejinvdata.invno,
          date: details.rejinvdata.invdate,
        },
        isGst: details.taxname !== 'VAT',
        no: details.rnno,
        invid: details.invid,
      };
      let party = details.rejinvdata.custSupDetails;
      this.party = {
        name: party.custname,
        addr: party.custaddr,
        state: party.custsupstate,
        gstin: party.custgstin,
        isCustomer: party.csflag === 3,
      };

      for (const name in details.rejcontents) {
        const item = details.rejcontents[name];
        this.rnote.contents.push({
          name: item.proddesc,
          qty: item.qty,
          uom: item.uom,
          rate: item.priceperunit,
          igst: item.taxrate,
          cgst: item.taxrate / 2,
          sgst: item.taxrate / 2,
          cess: item.cessrate,
          total: item.totalAmount,
          productcode: item.productCode,
          gsflag: item.gsflag,
          goid: item.goid,
        });
      }
      axios.get(`/accounts?type=getAccCode&accountname=${this.party.name}`)
        .then(response => {
          this.custid = response.data.accountcode;
        })
        .catch(error => {
          this.error = 'Failed to load data: ' + error.message;
        });
    },
    getDetails() {
      return axios
        .get(`/rejectionnote?type=single&rnid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: this.$gettext(`Fetch Rejection Note Error!`),
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        });
    },
    fetchAndUpdateData() {
      return this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
        case 0:
          this.formatDetails(response.data.gkresult);
          break;
        case 2:
          this.$bvToast.toast(
            this.$gettext(`Unauthorized access, Please contact admin`),
            {
              title: this.$gettext(`Fetch Rejection Note Error!`),
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            }
          );
          break;
        default:
          this.$bvToast.toast(
            this.$gettext(
              `Unable to Fetch Rejection Note Details! Please Try after sometime.`
            ),
            {
              title: this.$gettext(`Fetch Transaction Details Error!`),
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            }
          );
        } // end switch
      });
    },
  },
  watch: {
    id: function(id) {
      if (id && parseInt(id) > -1) {
        this.isPreloading = true;
        this.fetchAndUpdateData()
          .then(() => {
            this.isPreloading = false;
          })
          .catch(() => {
            this.isPreloading = false;
          });
      }
    },
  },
  mounted() {
    this.toDate = this.currentDate();
    if (this.id && parseInt(this.id) > -1) {
      this.isPreloading = true;
      this.fetchAndUpdateData()
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    }
  },
};
</script>

<style scoped>
.custom-link {
  color: white;
  text-decoration: none;
}
</style>