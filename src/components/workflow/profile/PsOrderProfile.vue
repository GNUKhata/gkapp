<template>
  <b-container fluid>
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <b-row>
      <b-col
        order="2"
        order-md="1"
      >
        <b-container
          fluid
          class="pl-0"
        >
          <b-col class="px-0">
            <b
              v-if="party.isCustomer"
              v-translate
            > Customer Details </b>
            <b
              v-else
              v-translate
            > Supplier Details </b>
            <p class="text-small">
              <span>
                <router-link :to="`/ledger/${custid}`">{{ party.name }}</router-link>
              </span><br>
              <span> {{ party.addr }} </span> <br>
              <span> {{ party.state }} </span> <br>
              <span v-if="party.pin"> <b v-translate> Postal Code: </b> {{ party.pin }} </span>
              <br>
              <span v-if="psorder.isGst">
                <b>GSTIN: </b>{{ party.gstin }}
              </span>
              <span v-if="psorder.isVat">
                <b>TIN: </b>{{ party.tin }}
              </span>
              <br>
            </p>
          </b-col>
          <b-col class="px-0">
            <b v-translate> Delivery Details </b>
            <p class="text-small">
              <span> {{ shipping.name }} </span> <br>
              <span> {{ shipping.addr }} </span> <br>
              <span> {{ shipping.state }} </span> <br>
              <span v-if="shipping.pin"> <b v-translate> Postal Code: </b> {{ shipping.pin }} </span>
              <br>
              <span v-if="shipping.gstin && psorder.isGst">
                <b>GSTIN: </b>{{ shipping.gstin }}
              </span>
              <br>
            </p>
          </b-col>
          <br class="d-none d-md-block">
        </b-container>
      </b-col>
      <b-col
        class="text-md-right"
        cols="12"
        md="6"
        order="1"
        order-md="2"
      >
        <b
          v-translate
          v-if="saleFlag"
        > Sale Order Details </b>
        <b
          v-translate
          v-else
        > Purchase Order Details </b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="psorderData"
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
      :items="psorder.contents"
      :fields="tableFields"
      tbody-tr-class="gk-vertical-row"
      bordered
      head-variant="dark"
      stacked="sm"
      small
      striped
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
            {key: 'title', label: '', tdClass: ''},
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
        <div>
          <b v-translate> Payment Details </b>
          <div
            v-if="payment.mode > 2"
            class="mb-3"
          >
            <span
              v-translate
              v-if="payment.mode === 3"
            > Paid By Cash </span>
            <span
              v-translate
              v-else
            > On Credit </span>
          </div>
          <div
            class="text-small"
            v-else
          >
            <translate> To Be Paid By Bank Transfer </translate>
            <b-table-lite
              :items="bankDetails"
              :fields="['title', 'value']"
              small
              bordered
              fixed
              thead-class="d-none"
            />
          </div>
        </div>
        <b v-translate> Narration: </b> {{ psorder.narration }}
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { numberToRupees } from '../../../js/utils.js';
export default {
  name: 'PsOrderProfile',
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
      saleFlag: true,
      psorder: {
        date: '',
        terms: '',
        creditPeriod: '',
        godown: '',
        contents: [],
        narration: '',
        roundoffflag: '',
      },
      payment: {
        mode: 2,
        bankDetails: {},
      },
      total: {},
      party: {},
      shipping: {},
      transport: {},
      toDate: '',
      custid: null,
    };
  },
  computed: {
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    psorderData: (self) => {
      let dispatchTitle = self.saleFlag
        ? self.$gettext('Dispatch From')
        : self.$gettext('Deliver At');
      let res = [
        { title: self.$gettext('No.'), value: self.psorder.no },
        { title: self.$gettext('Date'), value: self.psorder.date },
        { title: self.$gettext('Supply Date'), value: self.psorder.supplyDate },
        {
          title: self.$gettext('Credit Period'),
          value: self.psorder.creditPeriod,
        },
        { title: self.$gettext('Payment Terms'), value: self.psorder.terms },
        { title: dispatchTitle, value: self.psorder.godown },
        {
          title: self.$gettext('Mode of Transport'),
          value: self.transport.mode,
        },
        {
          title: self.$gettext('Vehicle No.'),
          value: self.transport.vehicleNo,
        },
      ];
      if (self.transport.mode !== 'Road') {
        res.pop();
      }
      return res;
    },
    totalDetails: (self) => {
      const totalTaxableAmount = Number(self.total.taxable).toFixed(2);
      let totalDiscount = Number(self.total.discount).toFixed(2);
      const totalAmount = (Number(totalTaxableAmount) + Number(totalDiscount)).toFixed(2);
      if (totalDiscount > 0) {
        totalDiscount = `-${totalDiscount}`;
      }
      let total = [
        {
          title: self.$gettext('Total'),
          value: totalAmount,
        },
        {
          title: self.$gettext('Discount'),
          value: totalDiscount,
        },
      ];
      if (self.isIndia) {
        if (self.psorder.isGst || self.psorder.isVat) {
          total.push({
            title: self.$gettext('Taxable'),
            value: self.total.taxable,
          });
        }
        if (self.psorder.isGst) {
          if (self.total.isIgst) {
            total.push({ title: 'IGST', value: self.total.tax });
          } else {
            total.push(
              { title: 'CGST', value: self.total.tax },
              { title: 'SGST', value: self.total.tax }
            );
          }
          total.push({ title: 'CESS', value: self.total.cess });
        }
        if (self.isVat) {
          total.push({ title: 'VAT', value: self.total.tax });
        }
      }
      total.push(
        {
          title: self.saleFlag
            ? self.$gettext('Sale Order Value')
            : self.$gettext('Purchase Order Value'),
          value: self.total.roundoffflag ? Math.round(self.total.amount).toFixed(2) : self.total.amount,
        },
        { title: self.$gettext('Total In Words'),
          value: self.total.roundoffflag ? numberToRupees(Math.round(self.total.amount)) : numberToRupees(self.total.amount),
        }
      );
      return total;
    },
    bankDetails: (self) => {
      let details = self.payment.bankDetails;
      return [
        { title: self.$gettext('Account Number'), value: details.accountno || '' },
        { title: self.$gettext('Bank'), value: details.bankname || '' },
        { title: self.$gettext('Branch'), value: details.branch || '' },
        { title: self.$gettext('IFSC'), value: details.ifsc || '' },
      ];
    },
    tableFields: (self) => {
      let fields = [
        {
          key: 'name',
          label: self.$gettext('Item'),
        },
        'qty',
        {
          key: 'rate',
          label: self.$gettext('Rate (₹)'),
          tdClass: 'gk-currency-sm',
        },
        {
          key: 'discount',
          label: self.$gettext('Discount (₹)'),
          tdClass: 'gk-currency-sm',
        },
      ];
      if (self.isIndia) {
        if (self.total.isGst) {
          if (self.total.isIgst) {
            fields.push(
              { key: 'igst', label: 'IGST (%)' },
            );
          } else {
            fields.push(
              { key: 'cgst', label: 'CGST (%)' },
              { key: 'sgst', label: 'SGST (%)' },
            );
          }
          fields.push({ key: 'cess', label: 'CESS (%)' });
        }
        if (self.total.isVat) {
          fields.push({ key: 'vat', label: 'VAT (%)' });
        }
      }
      fields.push(
        {
          key: 'total',
          label: self.$gettext('Total (₹)'),
          tdClass: 'gk-currency-sm',
        },
      );
      return fields;
    },
  },
  methods: {
    formatDetails(details) {
      this.saleFlag = details.psflag === 19;

      this.total = {
        amount: details.purchaseordertotal,
        isGst: this.isGstEnabled && ['GST', 'IGST', 'CGST', 'SGST'].includes(details.taxname),
        isIgst: this.isGstEnabled && details.taxname === 'IGST',
        isVat: this.isVatEnabled && details.taxname === 'VAT',
        cess: details.totalcessamt,
        tax: details.totaltaxamt,
        discount: details.totaldiscount,
        taxable: details.totaltaxablevalue,
        text: details.pototalwords || numberToRupees(details.totaltaxablevalue),
        roundoffflag: details.roundoffflag,
      };

      this.payment = {
        mode: details.paymentmode,
        bankDetails: details.bankdetails,
      };

      let godown =
        details.goname && details.goaddr
          ? `${details.goname} (${details.goaddr})`
          : '';
      this.psorder = {
        isGst: this.isGstEnabled && ['GST', 'IGST', 'CGST', 'SGST'].includes(details.taxname),
        isVat: this.isVatEnabled && details.taxname === 'VAT',
        contents: [],
        date: details.orderdate,
        no: details.orderno,
        narration: details.psnarration,
        supplyDate: details.dateofsupply,
        terms: details.payterms,
        creditPeriod: details.creditperiod,
        godown: godown,
      };
      this.transport = {
        mode: details.modeoftransport,
        vehicleNo: details.vehicleno,
      };

      let cust = details.custSupDetails;
      this.party = {
        name: cust.custname,
        addr: cust.custaddr,
        state: cust.custsupstate,
        pin: cust.pincode,
        isCustomer: cust.csflag === 3,
        gstin: cust.custgstin,
      };

      let shipping = details.consignee;
      this.shipping = {
        name: shipping.consigneename,
        addr: shipping.consigneeaddress,
        state: shipping.consigneestate,
        pin: shipping.consigneepincode,
        gstin: shipping.gstinconsignee,
      };

      for (const name in details.schedule) {
        const item = details.schedule[name];
        this.psorder.contents.push({
          name: item.proddesc,
          qty: item.qty,
          rate: item.priceperunit,
          discount: item.discount,
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
        .get(`/purchaseorder?poso=single&orderid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Fetch ${this.saleFlag ? 'Sale' : 'Purchase'} order Error!`,
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
          {
            let title = this.saleFlag
              ? this.$gettext('Fetch sale order error')
              : this.$gettext('Fetch purchase order error');
            this.$bvToast.toast(
              this.$gettext(`Unauthorized access, Please contact admin`),
              {
                title: title,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
            );
          }
          break;
        default:
          this.$bvToast.toast(
            this.$gettext(
              `Unable to Fetch Purchase Sales Order Details! Please Try after sometime.`
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
