<template>
  <b-container
    style="min-width: 300px"
    fluid
    class="mt-2 px-md-3 px-2 align-form-label-right"
  >
    <b-form @submit.prevent="confirmOnSubmit">
      <div class="text-center pt-2">
        <h4 v-translate>
          Create Cash Memo
        </h4>
      </div>
      <hr>
      <div class="mb-2">
        <b-form-radio-group
          v-model="form.type"
          v-if="config.type"
          button-variant="outline-secondary"
          size="sm"
          buttons
          class="mx-1"
        >
          <b-form-radio value="sale">
            <translate> Sale </translate>
          </b-form-radio>
        </b-form-radio-group>
        <span class="float-right">
          <config
            title="Invoice Page Configuration"
            get-default="getDefaultInvoiceConfig"
            set-custom="updateInvoiceConfig"
            get-custom="getCustomInvoiceConfig"
          />
        </span>
        <div class="clearfix" />
      </div>
      <b-card-group
        class="d-block d-md-flex my-2"
        deck
      >
        <!-- Delivery Note Details -->
        <cash-memo-details
          ref="memo"
          :config="config.memo"
          :parent-data="form.memo"
          :update-counter="updateCounter.memo"
          @details-updated="onComponentDataUpdate"
          :sale-flag="isSale"
        />
        <!-- Buyer/Seller Details -->
        <!-- <party-details
          :mode="form.type"
          :parentData="form.party"
          :gstFlag="isGst"
          :invoiceParty="invoiceParty"
          :config="config.party"
          :saleFlag="isSale"
          @details-updated="onComponentDataUpdate"
          :updateCounter="updateCounter.party"
          ref="party"
        >
        </party-details> -->
        <!-- Payment Details -->
        <payment-details
          ref="payment"
          :update-counter="updateCounter.payment"
          :config="config.payment"
          :sale-flag="isSale"
          :parent-data="form.payment"
          :options-data="{
            payModes,
          }"
        />
      </b-card-group>
      <div
        class="my-2"
        v-if="config.taxType && isGstEnabled && isVatEnabled"
      >
        <b-form-radio-group
          button-variant="outline-secondary"
          size="sm"
          buttons
          v-model="form.taxType"
        >
          <b-form-radio value="gst">
            GST
          </b-form-radio>
          <b-form-radio value="vat">
            VAT
          </b-form-radio>
        </b-form-radio-group>
      </div>
      <!-- Bill Table -->
      <bill-table
        :gst-flag="isGst"
        :cgst-flag="isCgst"
        :vat-flag="isVat"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :update-counter="updateCounter.bill"
        :parent-data="form.bill"
        ref="bill"
        :godown-id="goid"
        :sale-flag="isSale"
        :block-empty-stock="isSale"
        :inv-date="form.memo.date"
        :tax-state="taxState"
      />
      <div class="px-2">
        <!-- b-row has to be enclosed in a container tag with padding
        atleast 2, to avoid creating an offset to the right -->
        <b-row
          class="mt-5"
          v-if="config.total"
        >
          <b-col
            cols="12"
            lg="6"
          />
          <b-col
            cols="12"
            lg="6"
          >
            <total-table
              ref="totalTable"
              :config="config.total"
              :bill-data="form.bill"
              :gst-flag="isGst"
              :cgst-flag="isCgst"
              :is-vat="isVat"
              :update-counter="updateCounter.totalTable"
            />
          </b-col>
        </b-row>
      </div>
      <!-- <b-card-group class="d-block d-md-flex" deck> -->
      <!-- Transport Details -->
      <!-- <transport-details
          ref="transport"
          :config="config.transport"
          :updateCounter="updateCounter.transport"
          :parentData="form.transport"
          :invDate="form.memo.date"
          @details-updated="onComponentDataUpdate"
        ></transport-details> -->
      <!-- Invoice Comments -->
      <!-- <comments
          :name="`Cash Memo`"
          ref="narration"
          :config="config.comments"
          :updateCounter="updateCounter.comments"
          :parentData="form.comments"
        ></comments> -->
      <!-- </b-card-group> -->
      <b-tooltip
        target="inv-submit"
        :show="showErrorToolTip"
        placement="top"
        triggers="manual"
      >
        <translate
          translate-comment="%{start} and %{end} are a variables, translation is not required for them. Enter them, as they are while translation."
          :translate-params="{start: yearStart, end: yearEnd}"
        >
          Date must be within the Financial Year, from %{start} to %{end}
        </translate>
      </b-tooltip>
      <hr>
      <div class="float-right">
        <b-button
          class="m-1"
          size="sm"
          variant="danger"
          @click.prevent="$router.go(-1)"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle mr-1"
            icon="arrow-left"
          />
          <span
            class="align-middle"
            v-translate
          >Back</span>
        </b-button>
        <b-button
          class="m-1"
          size="sm"
          variant="warning"
          @click.prevent="resetForm"
        >
          <b-icon
            aria-hidden="true"
            class="align-middle mr-1"
            icon="arrow-repeat"
          />
          <span
            class="align-middle"
            v-translate
          >Reset</span>
        </b-button>
        <b-button
          id="inv-submit"
          :disabled="!isInvDateValid"
          type="submit"
          size="sm"
          class="m-1"
          variant="success"
        >
          <span>
            <b-spinner
              v-if="isLoading"
              small
            />
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle mr-1"
              icon="plus-square"
            />
            <span
              class="align-middle"
              v-translate
            >Create</span>
          </span>
        </b-button>
      </div>
      <div class="clearfix" />
    </b-form>
    <print-page
      :show="showPrintModal"
      name="CashMemo"
      title="Cash Memo"
      :id="memoId"
      :pdata="{}"
      @hidden="showPrintModal = false"
    />
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
import { PAYMENT_TYPE } from '@/js/enum.js';

import Config from '@/components/Config.vue';
import CashMemoDetails from '@/components/form/transaction_details/CashMemoDetails.vue';
import BillTable from '@/components/form/transaction/BillTable.vue';
import PaymentDetails from '@/components/form/transaction/PaymentDetails.vue';
import TotalTable from '@/components/form/transaction/TotalTable.vue';
// import PartyDetails from '@/components/form/transaction/PartyDetails.vue';
// import Comments from '@/components/form/transaction/Comments.vue';
// import TransportDetails from '@/components/form/transaction/TransportDetails.vue';

import cashMemoConfig from '../../js/config/transaction/cashMemo';

import PrintPage from '@/components/workflow/PrintPage.vue';
export default {
  name: 'CashMemo',
  components: {
    BillTable,
    CashMemoDetails,
    Config,
    PaymentDetails,
    TotalTable,
    // PartyDetails,
    // Comments,
    // TransportDetails,
    PrintPage,
  },
  data() {
    return {
      showPrintModal: false,
      memoId: 0,
      goid: -1,
      delNote: { no: '', id: -1 },
      issuer: '',
      role: '',
      isInvDateValid: false,
      vuexNameSpace: '',
      isLoading: false,
      form: {
        payment: {},
        total: {},
        type: 'sale',
        taxType: null,
        memo: {
          state: { id: null },
          taxState: { id: null },
        },
        bill: [],
        // party: {
        //   state: { id: null },
        // },
        // transport: {},
        narration: null,
      },
      options: {
        partyDetails: {},
        orgDetails: {},
      },
      updateCounter: {
        memo: 0,
        bill: 0,
        totalTable: 0,
        payment: 0,
        // party: 0,
        // transport: 0,
        // comments: 0,
      },
    };
  },
  computed: {
    taxState: (self) => self.form.memo.state.name || '',
    payModes: (self) => {
      return [
        { text: self.$gettext('-- Payment Mode --'), value: null },
        { text: self.$gettext('Cash'), value: PAYMENT_TYPE['cash'] },
        { text: self.$gettext('Bank'), value: PAYMENT_TYPE['bank'] },
      ];
    },
    isSale: (self) => self.form.type === 'sale',
    defaultTaxMode: (self) => {
      const taxMode = self.$store.getters['global/getDefaultTaxMode'];
      // If both GST & VAT are enabled, GST options will be shown first.
      if (taxMode === 'GST & VAT') {
        return 'gst';
      }
      return taxMode.toLowerCase();
    },
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    // config : Gets the custom config from the invoiceConfig Vuex module and
    //          prepares it for use by adding some custom additions to it (that should not be user editable)
    config: (self) => {
      let newConf =
        self.$store.getters[`${self.vuexNameSpace}/getCustomCashMemoConfig`];
      if (newConf) {
        newConf.bill.footer.headingColspan =
          !!newConf.bill.index +
          !!newConf.bill.product +
          !!newConf.bill.hsn +
          !!newConf.bill.qty +
          !!newConf.bill.rate || 1;
      } else {
        // In Hot Module Reloading during dev, the dynamic Vuex module does not get loaded and errors are printed in console.
        // This is because during HMR, the Invoice component gets loaded before old one can be destroyed, causing an error (https://github.com/vuejs/vue/issues/6518)
        // Adding a empty config as a short term fix for that
        newConf = {
          memo: {
            class: {},
          },
          taxType: true,
          bill: {
            footer: {
              headingColspan: 1,
            },
          },
          payment: {
            bank: {},
            class: {},
          },
          total: {},
        };
      }

      return newConf;
    },
    billTableConfig: (self) => {
      if (self.config) {
        return {
          bill: self.config.bill || {},
          taxType: self.config.taxType || {},
          total: self.config.total || {},
        };
      }
    },
    defaultContacts: (self) => self.$store.getters['global/getDefaultContacts'],
    defaultPaymentMode: (self) =>
      self.$store.getters['global/getDefaultPaymentMode'],
    ...mapState(['yearStart', 'yearEnd', 'orgCode', 'invoiceParty']),
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    isVat: (self) => self.isVatEnabled && self.form.taxType === 'vat',
    isGst: (self) => self.isGstEnabled && self.form.taxType === 'gst',
    isCgst: (self) => {
      // debugger;
      if (
        self.isIndia &&
        self.form.memo.state &&
        (self.form.memo.taxState || self.form.party?.state)
      ) {
        if (self.form.memo.taxState) {
          if (
            parseInt(self.form.memo.state.id) ===
            parseInt(self.form.memo.taxState.id)
          ) {
            return true;
          }
        } else if (
          parseInt(self.form.memo.state.id) ===
          parseInt(self.form.party?.state.id)
        ) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    collectComponentData() {
      this.updateCounter.totalTable++;
      Object.assign(this.form.memo, this.$refs.memo.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      Object.assign(this.form.payment, this.$refs.payment.form);
    },
    updateComponentData() {
      this.updateCounter.memo++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.payment++;
      // this.updateCounter.party++;
      // this.updateCounter.transport++;
      // this.updateCounter.comments++;
    },
    onComponentDataUpdate(payload) {
      switch (payload.name) {
      case 'cash-memo-details':
        {
          Object.assign(this.form.memo, payload.data);
          this.isInvDateValid = payload.options.isDateValid;
          // debugger;
          if (payload.options.bankDetails) {
            this.options.orgDetails.bankDetails = payload.options.bankDetails;
            this.setBankDetails();
          }

          // this.form.transport.date = this.form.memo.date;

          this.goid = payload.data.godown || -1;

          // this.updateCounter.transport++;
          this.$forceUpdate();
        }
        break;
      // case 'party-details':
      //   this.options.partyDetails = payload;
      //   Object.assign(this.form.party, payload.data);

      //   this.form.memo.taxState = payload.data.state;
      //   this.setBankDetails();
      //   // this.updateCounter.ship++;
      //   this.updateCounter.memo++;
      //   break;
      case 'bill-table': {
        Object.assign(this.form.bill, payload.data);
        this.updateCounter.totalTable++;
      }
        // break;
        // case 'transport-details':
        //   Object.assign(this.form.transport, payload.data);
        //   break;
      }
    },
    setBankDetails() {
      const orgBank = this.options.orgDetails.bankDetails || {};
      const partyBank = this.options.partyDetails.bankDetails || {};
      let bd = this.isSale ? orgBank : partyBank;

      Object.assign(this.form.payment.bank, {
        no: bd.accountno || '',
        name: bd.bankname || '',
        branch: bd.branchname || '',
        ifsc: bd.ifsc || '',
      });
      this.updateCounter.payment++;
    },
    initPayload() {
      const contact =
        (this.isSale
          ? this.defaultContacts['customer']
          : this.defaultContacts['supplier']) || {};

      this.collectComponentData();
      let taxflag = 0;
      if (this.isGst) {
        taxflag = 7;
      }
      if (this.isVat) {
        taxflag = 22;
      }
      let invoice = {
        // dcid: null, // Has to be filled when Delivery Note is implemented. If no Deliver Note is available skip this property
        invoiceno: this.form.memo.no,
        invoicedate: this.form.memo.date,
        orgstategstin: this.form.memo.gstin || null,

        roundoffflag: this.form.total.roundFlag ? 1 : 0,

        paymentmode: this.form.payment.mode,

        custid: contact.value || '',

        // === Total Invoice price data ===
        invoicetotal: this.form.total.amount,
        invoicetotalword: this.form.total.text,

        // === Sale / Purchase related data ===
        sourcestate: this.form.memo.state.name || null,
        taxstate: this.form.memo.taxState?.name || null,

        // === GST/ VAT related data ===
        inoutflag: this.isSale ? 15 : 9,
        taxflag, // 7 - GST, 22 - VAT, else null

        discflag: 1, // discount flag, 1 - amount, 16 - percent
        icflag: 3, // 3 - cash memo, 9 - invoice
      };

      // === Delivery Note ===
      if (this.delNote.id) {
        invoice.dcid = this.delNote.id;
      }

      // === Bill data ===
      let contents = {};
      let stock = { items: {}, inout: invoice.inoutflag };
      // let pricedetails = [];
      let tax = {};
      let cess = {};
      let av = {
        product: {},
        prodData: {},
        taxpayment: 0,
        totaltaxable: 0,
      };
      let freeqty = {};
      let discount = {};
      this.form.bill.forEach((item) => {
        let taxable = item.rate * item.qty - item.discount.total;

        if (contents[item.product.id] === undefined) {
          contents[item.product.id] = {};
        }

        contents[item.product.id][item.rate] = parseFloat(item.qty).toFixed(2);
        stock.items[item.product.id] = parseFloat(item.qty).toFixed(2);

        if (this.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
          av.avtax = {
            GSTName: this.isCgst ? 'CGST' : 'IGST',
            CESSName: 'CESS',
          };
        } else {
          tax[item.product.id] = parseFloat(item.vat.rate).toFixed(2);
          av.taxpayment += taxable;
        }

        freeqty[item.product.id] = isNaN(parseFloat(item.fqty))
          ? 0
          : parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.total).toFixed(2);

        av.product[item.product.name] = parseFloat(taxable).toFixed(2);
        av.prodData[item.product.id] = parseFloat(taxable).toFixed(2);
        av.totaltaxable += taxable;

        // pricedetails.push({
        //   custid: this.form.party.name.id || '',
        //   productcode: item.product.id,
        //   inoutflag: invoice.inoutflag,
        //   lastprice: item.rate,
        // });
      });

      av.taxpayment = parseFloat(av.taxpayment).toFixed(2);
      av.totaltaxable = parseFloat(av.totaltaxable).toFixed(2);

      Object.assign(invoice, {
        contents,
        // pricedetails,
        tax,
        cess,
        av,
        freeqty,
        discount,
      });

      // === payment details, mode = 2 ===
      if (this.form.payment.mode === PAYMENT_TYPE['bank']) {
        invoice.bankdetails = {
          accountno: this.form.payment.bank.no,
          bankname: this.form.payment.bank.name,
          ifsc: this.form.payment.bank.ifsc,
          branch: this.form.payment.bank.branch,
        };
      }

      // console.log({ invoice, stock });
      return { invoice, stock };
    },
    initDelNotePayload() {
      const contact =
        (this.isSale
          ? this.defaultContacts['customer']
          : this.defaultContacts['supplier']) || {};

      this.collectComponentData();

      let taxflag = 0;
      if (this.isGst) {
        taxflag = 7;
      }
      if (this.isVat) {
        taxflag = 22;
      }
      let delchal = {
        custid: parseInt(contact.value) || '',
        dcno: this.form.memo.delNoteNo,
        dcdate: this.form.memo.date,
        dcflag: this.isSale ? 4 : 16,
        taxstate: this.form.memo.state.name, // for cash memo tax state / place of supply is same as org state
        sourcestate: this.form.memo.state.name || null,
        orgstategstin: this.form.memo.gstin || '',
        discflag: 1,
        dcnarration: 'Delivery to Retail Customer with Cash Memo',
        roundoffflag: this.form.total.roundFlag ? 1 : 0,
        consignee: {},

        inoutflag: this.isSale ? 15 : 9, // 15- sale, 9 - purchase
        taxflag, // 7 - GST, 22 - VAT, else null

        issuername: this.issuer,
        designation: this.role,

        vehicleno: '',
        modeoftransport: 'Road',
        noofpackages: 0,
      };

      // === Sale / Purchase related data ===
      if (!this.isSale) {
        delete delchal.ewaybillno;
      }

      // === Total Invoice price data ===
      delchal.delchaltotal = this.form.total.amount;
      delchal.totalinword = this.form.total.text;

      // === Consignee data ===
      // if (this.form.ship.name) {
      //   delchal.consignee = {
      //     consigneename: this.form.party.name || '',
      //     tinconsignee: this.form.party.tin || '',
      //     gstinconsignee: this.form.party.gstin || '',
      //     consigneeaddress: this.form.party.addr || '',
      //     consigneestate: this.form.party.state.name || null,
      //     consigneestatecode: this.form.party.state.id || null,
      //     consigneepincode: this.form.party.pin || '',
      //   };
      // }

      // === Bill data ===
      let contents = {};
      let stock = {
        inout: delchal.inoutflag,
        goid: this.goid,
      };
      let pricedetails = [];
      let tax = {};
      let cess = {};
      let freeqty = {};
      let discount = {};
      this.form.bill.forEach((item) => {
        if (contents[item.product.id] === undefined) {
          contents[item.product.id] = {};
        }

        contents[item.product.id][item.rate] = parseFloat(item.qty).toFixed(2);

        if (this.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
        } else {
          tax[item.product.id] = parseFloat(item.vat.rate).toFixed(2);
        }

        freeqty[item.product.id] = isNaN(parseFloat(item.fqty))
          ? 0
          : parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.total).toFixed(2);

        pricedetails.push({
          custid: parseInt(contact.value) || '',
          productcode: item.product.id,
          inoutflag: delchal.inoutflag,
          lastprice: item.rate,
        });
      });

      Object.assign(delchal, {
        contents,
        tax,
        cess,
        freeqty,
        discount,
      });

      delchal.dateofsupply = this.form.memo.date;

      return { delchaldata: delchal, stockdata: stock };
    },
    confirmOnSubmit() {
      Object.assign(this.form.memo, this.$refs.memo.form);
      const self = this;
      let text = `Create Cash Memo (${this.form.memo.no}) for ${
        this.isSale ? 'Sale' : 'Purchase'
      }?`;
      let textDom = this.$createElement('div', {
        domProps: {
          innerHTML: text,
        },
      });
      this.$bvModal
        .msgBoxConfirm(textDom, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          // bodyClass: 'p-2',
          centered: true,
        })
        .then((val) => {
          if (val) {
            self.onSubmit();
          }
        });
    },
    onSubmit() {
      this.isLoading = true;
      this.createCashMemo();
    },
    createCashMemo() {
      const self = this;
      const payload = this.initPayload();
      const delchalPayload = this.initDelNotePayload();
      axios
        .post('/invoice', {payload, delchalPayload})
        .then((resp) => {
          self.isLoading = false;

          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
            case 0:
              {
                // success

                this.displayToast(
                  this.$gettext(`Create Cash Memo Successfull!`),
                  `Cash Memo saved with entry no. ${resp.data.invoiceid ||
                    resp.data.gkresult ||
                    resp.data.vchData.vchno}`,
                  'success'
                );

                let log = {
                  activity: `cash memo created: ${self.form.memo.no}`,
                };
                axios.post('/log', log);

                this.memoId = resp.data.gkresult;
                this.resetForm();
                this.showPrintModal = true;
              }
              break;
            case 1:
              // Duplicate entry
              this.displayToast(
                this.$gettext(`Create Cash Memo Failed!`),
                this.$gettext('Duplicate Entry, Check Cash Memo Id'),
                'warning'
              );
              break;
            case 2:
              // Unauthorized access
              this.displayToast(
                this.$gettext(`Create Cash Memo Failed!`),
                this.$gettext('Unauthorized Access, Contact Admin'),
                'warning'
              );
              break;
            case 3:
              // Connection failed, Check inputs and try again
              this.displayToast(
                this.$gettext(`Create Cash Memo Failed!`),
                this.$gettext('Please check your input and try again later'),
                'danger'
              );
            }
          }
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
    createDelNote() {
      this.delNote.id = -1;

      const payload = this.initDelNotePayload();

      return axios
        .post('/delchal', payload)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            if (resp.data.gkresult) {
              this.delNote.id = resp.data.gkresult || null;
            }
            return resp.data.gkresult;
          } else if (resp.data.gkstatus === 1) {
            // let no = payload.delchaldata.dcno;
            // let
            // this.form.inv.delNoteNo = parseInt(no.split('/')[0])++;
            // this.createDelNote();
          }
        })
        .catch(() => {
          return -1;
        });
    },
    fetchUserData() {
      let self = this;
      return axios
        .get(`/gkuser`)
        .then((resp) => {
          // === User name and role ===
          if (resp.data.gkstatus === 0) {
            self.issuer = resp.data.gkresult.username;
            self.role = resp.data.gkresult.userroleName;
          } else {
            // User data not available, check again
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch User Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },
    resetForm() {
      this.showPrintModal = false;
      let paymentMode;
      switch (this.defaultPaymentMode) {
      case 'bank':
        {
          paymentMode = PAYMENT_TYPE['bank'];
        }
        break;
      case 'cash':
      default: {
        paymentMode = PAYMENT_TYPE['cash'];
      }
      }
      let type = this.form.type;
      this.form = {
        type: type,
        memo: {
          no: null,
          date: this.formatDateObj(new Date()),
          state: { id: null },
          taxState: { id: null },
          gstin: null,
          options: {
            gstin: {},
          },
        },
        narration: null,
        taxType: null,
        bill: [
          {
            product: { name: '', id: '' },
            hsn: '',
            qty: 0,
            fqty: 0,
            rate: 0,
            discount: { rate: 0, amount: 0 },
            taxable: 0,
            igst: { rate: 0, amount: 0 },
            cess: { rate: 0, amount: 0 },
            vat: { rate: 0, amount: 0 },
            total: 0,
            isService: false, // used to make certain fields readonly
          },
        ],
        total: {
          taxable: 0,
          igst: 0,
          cess: 0,
          vat: 0,
          discount: 0,
          amount: 0,
          rounded: 0,
          text: '',
        },
        payment: {
          mode: paymentMode,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        },
      };

      this.setBankDetails();
      this.updateComponentData();
    },
    /**
     * formatDateObj(date)
     *
     * Description: Converts a js Date object, into yyyy-mm-dd string
     */
    formatDateObj(date) {
      let month = date.getMonth() + 1;
      month = month > 9 ? month : '0' + month;
      let day = date.getDate();
      day = day > 9 ? day : '0' + day;
      return `${date.getFullYear()}-${month}-${day}`;
    },
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
  },
  beforeMount() {
    this.vuexNameSpace = 'cashMemoConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, cashMemoConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initCashMemoConfig`, {
      orgCode: this.orgCode,
    });
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future
    // this.formMode = this.mode;
    // this.invoiceId = this.invid;
    // this.initForm();
    this.fetchUserData();
    this.resetForm();
    this.form.taxType = this.defaultTaxMode;
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>
