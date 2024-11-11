<template>
  <b-container
    style="min-width: 300px"
    fluid
    class="mt-2 px-md-3 px-2 align-form-label-right"
  >
    <h3 class="text-center">
      Create Invoice
    </h3>
    <hr class="mb-2 mt-0">

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
          Sale
        </b-form-radio>
        <b-form-radio value="purchase">
          Purchase
        </b-form-radio>
      </b-form-radio-group>
      <!-- <span id="edit-invoice-list" class="d-inline-block" v-if="!isCreate">
        <b-form-select
          size="sm"
          v-model="invoiceId"
          :options="editableInvoices"
          @change="initForm()"
        ></b-form-select>
      </span> -->
      <span class="float-right">
        <config
          v-if="user_role === -1"
          title="Invoice Page Configuration"
          :get-default="`${this.vuexNameSpace}/getDefaultInvoiceConfig`"
          :set-custom="`${this.vuexNameSpace}/updateInvoiceConfig`"
          :get-custom="`${this.vuexNameSpace}/getCustomInvoiceConfig`"
          confirm-message="Invoice page config will be applied organisation wide. Do you want to proceed?"
          @update="resetForm"
        />
      </span>
      <div class="clearfix" />
    </div>
    <b-form @submit.prevent="confirmOnSubmit">
      <b-card-group
        class="d-block d-md-flex my-2"
        deck
      >
        <!-- Buyer/Seller Details -->
        <party-details
          :mode="form.type"
          :parent-data="form.party"
          :gst-flag="isGst"
          :vat-flag="isVat"
          :invoice-party="invoiceParty"
          :config="config.party"
          :sale-flag="isSale"
          @details-updated="onComponentDataUpdate"
          :update-counter="updateCounter.party"
          ref="party"
        />
        <!-- Invoice Details -->
        <invoice-details
          :config="config.inv"
          :sale-flag="isSale"
          :parent-data="form.inv"
          @details-updated="onComponentDataUpdate"
          :update-counter="updateCounter.inv"
          :party-country="form.party.country"
          ref="inv"
        />
        <!-- Shipping Details -->
        <ship-details
          :gst-flag="isGst"
          :vat-flag="isVat"
          :sale-flag="isSale"
          :billing-details="form.party"
          :organisation-details="options.orgDetails"
          :update-counter="updateCounter.ship"
          :config="config.ship"
          ref="ship"
        />
      </b-card-group>
      <div
        class="my-2"
        v-if="config.taxType && isGstEnabled && isVatEnabled && isIndianParty"
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
        :inv-date="form.inv.date"
        :tax-state="form.inv?.taxState?.name"
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
              :config="config.total"
              :gst-flag="isGst"
              :cgst-flag="isCgst"
              :vat-flag="isVat"
              :bill-data="form.bill"
              :update-counter="updateCounter.totalTable"
              ref="totalTable"
            />
          </b-col>
        </b-row>
      </div>
      <b-card-group
        class="d-block d-md-flex"
        deck
      >
        <!-- Payment Details -->
        <payment-details
          ref="payment"
          :update-counter="updateCounter.payment"
          :config="config.payment"
          :sale-flag="isSale"
          :parent-data="form.payment"
          :options-data="{
            payModes: options.payModes,
          }"
          @details-updated="onComponentDataUpdate"
        />
        <!-- Transport Details -->
        <transport-details
          ref="transport"
          :config="config.transport"
          :update-counter="updateCounter.transport"
          :parent-data="form.transport"
          :inv-date="form.inv.date"
          @details-updated="onComponentDataUpdate"
        />
        <!-- Invoice Comments -->
        <comments
          :name="`Invoice`"
          ref="narration"
          :config="config.comments"
          :update-counter="updateCounter.comments"
          :parent-data="form.comments"
          :place-holder="defaultNarration"
        />
      </b-card-group>
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
      <attachments
        class="mt-2"
        ref="attachments"
        :update-counter="updateCounter.attachments"
        :parent-data="form.attachments"
      />
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
          :disabled="isInvDateValid === false"
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

          <!-- <span v-else>
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle mr-1"
              icon="cloud-arrow-up"
            ></b-icon>
            <span class="align-middle" v-translate>Save Changes</span>
          </span> -->
        </b-button>
      </div>
      <div class="clearfix" />
    </b-form>
    <print-page
      :show="showPrintModal"
      name="Invoice"
      title="Invoice"
      :id="invModalId"
      :pdata="{
        printTitle: {
          page: `${(isGstEnabled || isVatEnabled) ? 'Tax Invoice' : 'Invoice'}`,
          file: 'tax_invoice',
        },
        useTriplicate: true,
      }"
      @hidden="showPrintModal = false"
    />
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';

import { PAGES, CONFIGS, PAYMENT_TYPE } from '@/js/enum.js';

// import { getBase64 } from '../../js/utils.js';

import PartyDetails from '../../components/form/transaction/PartyDetails.vue';
import ShipDetails from '../../components/form/transaction/ShipDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';
import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import Comments from '../../components/form/transaction/Comments.vue';
import PaymentDetails from '../../components/form/transaction/PaymentDetails.vue';
import InvoiceDetails from '../../components/form/transaction_details/InvoiceDetails.vue';
import Attachments from '../../components/form/transaction/Attachments.vue';

import PrintPage from '../../components/workflow/PrintPage.vue';

import Config from '../../components/Config.vue';

import invoiceConfig from '../../js/config/transaction/invoiceConfig';

export default {
  name: 'Invoice',
  components: {
    Config,

    PartyDetails,
    InvoiceDetails,
    ShipDetails,
    BillTable,
    TotalTable,
    PaymentDetails,
    TransportDetails,
    Comments,
    Attachments,

    PrintPage,
  },
  data() {
    return {
      // config: {},
      posFlag: true,
      showPrintModal: false,
      vuexNameSpace: '',
      formMode: '',
      invoiceId: 0,
      invModalId: 0,
      goid: -1,
      dcId: '',
      updateCounter: {
        party: 0,
        ship: 0,
        bill: 0,
        totalTable: 0,
        payment: 0,
        transport: 0,
        comments: 0,
        inv: 0,
        attachments: 0,
      },
      form: {
        type: 'sale', // purchase
        inv: {
          state: {
            id: null,
            name: '',
          },
          taxState: {
            id: null,
            name: '',
          },
        },
        party: {
          state: {
            id: null,
            name: '',
          },
        },
        ship: {},
        taxType: null,
        bill: [],
        payment: {},
        transport: {},
        total: {},
        narration: null,
        totalRoundFlag: false,
        attachments: [],
      },
      // attachments: [],
      isLoading: false,
      isPreloading: false,
      showContactForm: false,
      showBusinessForm: false,
      defaultNarration: '',
      temp: null,
      options: {
        dcData: {},
        customers: [],
        suppliers: [],
        products: [],
        services: [],
        states: [],
        payModes: [
          { text: '-- Payment Mode --', value: null },
          { text: 'Cash', value: 3 },
          { text: 'Bank', value: 2 },
          { text: 'On Credit', value: 15 },
        ],
        transportModes: [
          { text: '-- Transport Mode --', value: null },
          'Road',
          'Rail',
          'Air',
          'Ship',
          'Other',
        ],
        orgDetails: {},
        partyDetails: {},
        bill: [],
        editableInvoices: {
          purchase: [],
          sale: [],
        },
      },
      isCollapsed: {
        billedTo: false,
        invoice: false,
        shipping: false,
        payment: false,
        transport: false,
        comments: false,
      },
      editFlag: null, // A flag used to skip fetchProductDetails() method call,
      // when the bill table is populated when the page loads in edit mode
    };
  },
  computed: {
    taxState: (self) =>
      self.form.inv.taxState ? self.form.inv.taxState.name : '',
    // config : Gets the custom config from the invoiceConfig Vuex module and
    //          prepares it for use by adding some custom additions to it (that should not be user editable)
    config: (self) => {
      let newConf =
        self.$store.getters[`${self.vuexNameSpace}/getCustomInvoiceConfig`];
      if (newConf && Object.keys(newConf).length) {
        if (newConf.inv.class) {
          newConf.inv.class = {
            'mr-md-1': !!newConf.ship,
            'ml-md-1': !!newConf.party,
          };
        }
        if (newConf.ship.class) {
          newConf.ship.class = {
            'ml-md-1': !!(newConf.inv || newConf.party),
          };
        }
        if (newConf.party.class) {
          newConf.party.class = {
            'mr-md-1': !!(newConf.inv || newConf.ship),
          };
        }

        if (newConf.payment.class) {
          newConf.payment.class = {
            'mr-md-1': !!(newConf.transport || newConf.comments),
          };
        }

        if (newConf.transport.class) {
          newConf.transport.class = {
            'mr-md-1': !!newConf.comments,
            'ml-md-1': !!newConf.payment,
          };
        }

        if (newConf.comments.class) {
          newConf.comments.class = {
            'ml-md-1': !!(newConf.transport || newConf.payment),
          };
        }
      } else {
        // In Hot Module Reloading during dev, the dynamic Vuex module does not get loaded and errors are printed in console.
        // This is because during HMR, the Invoice component gets loaded before old one can be destroyed, causing an error (https://github.com/vuejs/vue/issues/6518)
        // Adding a empty config as a short term fix for that
        newConf = {
          inv: {
            class: {},
          },
          party: {
            class: {},
          },
          ship: {
            class: {},
          },
          taxType: true,
          bill: {
            qty: { checkStock: true },
            footer: {},
          },
          payment: {
            bank: {},
            class: {},
          },
          transport: {
            class: {},
          },
          comments: {
            class: {},
          },
          total: {},
        };
      }

      return newConf;
    },
    defaultConfig: (self) =>
      self.$store.getters[`${self.vuexNameSpace}/getDefaultInvoiceConfig`],
    defaultPaymentMode: (self) =>
      self.$store.getters['global/getDefaultPaymentMode'],
    billLength: (self) => self.form.bill.length,
    height: () =>
      window.innerHeight -
      document.getElementById('app-header').offsetHeight -
      30,
    party: (self) =>
      self.form.party.type === 'customer' ? 'Customer' : 'Supplier',
    // isCreate: (self) => self.formMode === 'create',
    isSale: (self) => self.form.type === 'sale',
    defaultTaxMode: (self) => {
      const taxMode = self.$store.getters['global/getDefaultTaxMode'];
      // If both GST & VAT are enabled, GST options will be shown first.
      if (taxMode === 'GST & VAT') {
        return 'gst';
      }
      return taxMode.toLowerCase();
    },
    useBillAddress: {
      get: function() {
        return this.form.ship.copyFlag;
      },
      set: function(flag) {
        this.form.ship.copyFlag = !!flag;
        this.setShippingDetails();
      },
    },
    minDate: (self) => new Date(self.yearStart),
    maxDate: (self) => new Date(self.yearEnd),
    isInvDateValid: (self) => {
      let currDate = new Date(self.form.inv.date).getTime(),
          minDate = self.minDate.getTime(),
          maxDate = self.maxDate.getTime();
      return !isNaN(currDate)
        ? currDate >= minDate && currDate <= maxDate
        : null;
    },
    editableInvoices: (self) => {
      return self.options.editableInvoices[self.form.type];
    },
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    isIndianParty: (self) =>
      !self.form.party.country || self.form.party.country === 'India',
    ...mapState(['yearStart', 'yearEnd', 'invoiceParty']),
    ...mapGetters('global', ['isIndia', 'isGstEnabled', 'isVatEnabled']),
    isVat: (self) =>
      self.isVatEnabled && self.isIndianParty && self.form.taxType === 'vat',
    isGst: (self) =>
      self.isGstEnabled && self.isIndianParty && self.form.taxType === 'gst',
    isCgst: (self) => {
      if (
        self.isIndia && (
          parseInt(self.form.inv.state.id) ===
          parseInt(self.form.inv.taxState.id)
        )
      ) {
        return true;
      }
      return false;
    },
  },
  methods: {
    confirmOnSubmit() {
      Object.assign(this.form.inv, this.$refs.inv.form);
      const self = this;
      let text = `Create ${this.isSale ? 'Sale' : 'Purchase'} Invoice (${
        this.form.inv.no
      })?`;
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
    collectComponentData() {
      this.updateCounter.totalTable++;
      Object.assign(this.form.inv, this.$refs.inv.form);
      Object.assign(this.form.party, this.$refs.party.form);
      Object.assign(this.form.ship, this.$refs.ship.form);

      this.form.bill = this.$refs.bill.form;
      // Object.assign(this.form.bill, this.$refs.bill.form);

      Object.assign(this.form.payment, this.$refs.payment.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      Object.assign(this.form.transport, this.$refs.transport.form);
      this.form.attachments = this.$refs.attachments.form.attachments;
      this.form.narration = this.$refs.narration.form.narration;
    },
    updateComponentData() {
      this.updateCounter.party++;
      this.updateCounter.inv++;
      this.updateCounter.ship++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.payment++;
      this.updateCounter.transport++;
      this.updateCounter.comments++;
      this.updateCounter.attachments++;
    },
    onComponentDataUpdate(payload) {
      switch (payload.name) {
      case 'invoice-details':
        {
          // if (payload.data.delNote !== this.form.inv.delNote) {
          //   this.fetchDelNoteData(payload.data.delNote);
          // } else {
          //   }

          this.goid = payload.data.godown || -1;
          Object.assign(this.form.inv, payload.data);
          this.form.inv.taxState = payload.data.placeOfSupply;
          // if (!this.isCreate) {
          //   this.form.inv.no = oldInvNo;
          // }
          this.form.transport.date = this.form.inv.date;
          const self = this;
          self.updateCounter.transport++;
        }
        break;
      case 'party-details':
        {
          this.options.partyDetails = payload;

          this.setBankDetails();
          this.form.party = Object.assign({}, this.form.party, payload.data);

          this.updateCounter.ship++;
          Object.assign(this.form.inv.taxState, payload.data.state);
          this.updateCounter.inv++;
          // if (this.isCreate) {
          // }
          this.updateDefaultNarration();
        }
        break;
      case 'bill-table':
        this.form.bill = payload.data;
        this.updateCounter.totalTable++;
        this.updateDefaultNarration();
        break;
      case 'transport-details':
        Object.assign(this.form.transport, payload.data);
        break;
      case 'payment-details':
        Object.assign(this.form.payment, payload.data);
        this.updateDefaultNarration();
        break;
      }
    },
    updateDefaultNarration() {
      let total = this.form.bill.reduce((acc, item) => {
        return acc + parseFloat(item.total);
      }, 0);
      let party = this.form.party.name ? this.form.party.name.name || '' : '';
      let invNo = this.form.inv.no || '';
      let type = this.isSale ? 'Sold' : 'Bought';
      let toOrFrom = this.isSale ? 'to' : 'from';
      let payment = '';
      switch (this.form.payment.mode) {
      case PAYMENT_TYPE['cash']:
        payment = 'by cash';
        break;
      case PAYMENT_TYPE['credit']:
        payment = 'on credit';
        break;
      case PAYMENT_TYPE['bank']:
        payment = 'by cheque';
      }
      this.defaultNarration = `${type} goods worth Rupees ${total.toFixed(2)} ${toOrFrom} ${party} ${payment}, ref invoice no. ${invNo}`;
    },
    fetchDelNoteGodown(dcid) {
      const self = this;
      axios.get(`/delchal/${dcid}`).then((resp) => {
        if (resp.data.gkstatus === 0) {
          self.options.dcData = resp.data.gkresult.delchaldata;
          self.form.inv.godown = resp.data.gkresult.delchaldata.goid;
          self.form.inv.dnNo = resp.data.gkresult.delchaldata.dcno;
          self.updateComponentData();
        }
      });
      // },
      // fetchAttachments() {
      //   // if (this.form.attachments.length) {
      //   return;
      // }
      // this.isAttachmentLoading = true;
      axios.get(`/invoice/attachment/${this.invoiceId}`).then((resp) => {
        this.form.attachments = resp.data.gkresult;
        this.updateComponentData(); // this.isAttachmentLoading = false;
      });
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
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get('/state').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch State Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get(`/organisation`).catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Organisation Profile Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      const self = this;
      return Promise.all(requests).then(([resp1, resp6]) => {
        self.isPreloading = false;
        let preloadErrorList = ''; // To handle the unloaded data, at once than individually

        /**
         * The data obtained are updated, to be comptaible with the
         * component they are used with (<b-form-select>)
         * and based on requirement
         */

        // === State List ===
        if (resp1.data.gkstatus === 0) {
          self.options.states = resp1.data.gkresult.map((item) => {
            return {
              id: Object.keys(item)[0],
              name: Object.values(item)[0],
            };
          });
        } else {
          preloadErrorList += ' States,';
        }

        if (resp6.data.gkstatus === 0) {
          let orgState = resp6.data.gkdata.orgstate;
          let state = self.options.states.find(
            (state) => state.name === orgState
          );
          let stateCode = state ? state.id : null;
          let gstin = resp6.data.gkdata.gstin;
          self.options.orgDetails = {
            name: resp6.data.gkdata.orgname,
            addr: resp6.data.gkdata.orgaddr,
            state: state ? state : null,
            gstin: stateCode && gstin ? gstin[stateCode] : '',
            tin: '',
            pin: resp6.data.gkdata.orgpincode,
            bankDetails: resp6.data.gkdata.bankdetails,
          };
          if (!self.options.orgDetails.gstin && stateCode < 10) {
            self.options.orgDetails.gstin = gstin[`0${stateCode}`];
          }
          setTimeout(() => {
            self.setOrgDetails();
          }, 1);
        }

        if (preloadErrorList !== '') {
          this.displayToast(
            this.$gettext('Error: Unable to Preload Data'),
            `Issues with fetching ${preloadErrorList} Please try again or Contact Admin`,
            'danger'
          );
        }
      });
    },
    fetchUserData() {
      let self = this;
      return axios
        .get(`/gkuser`)
        .then((resp) => {
          // === User name and role ===
          if (resp.status === 200) {
            if (resp.data.gkstatus === 0) {
              self.form.inv.issuer = resp.data.gkresult.username;
              self.form.inv.role = resp.data.gkresult.userroleName;
            } else {
              // User data not available, check again
            }
          } else {
            // User data not available, check again
          }
        })
        .catch((error) => {
          this.displayToast('Fetch User Data Failed!', error.message, 'danger');
          return error;
        });
    },
    fetchContactList() {
      const requests = [
        axios.get('/customer?qty=custall').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Customer Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get('/customer?qty=supall').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Supplier Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      let self = this;
      return Promise.all(requests)
        .then(([resp1, resp2]) => {
          // === Customer List ===
          if (resp1.status === 200) {
            if (resp1.data.gkstatus === 0) {
              resp1.data.gkresult.sort((a, b) => a.custid - b.custid); // sorting items based on custid, to display in the order of creation
              self.options.customers = resp1.data.gkresult.map((item) => {
                return {
                  text: item.custname,
                  value: {
                    id: item.custid,
                    name: item.custname,
                  },
                };
              });
            } else {
              // Customer List not loaded
            }
          }

          // === Supplier List ===
          if (resp2.status === 200) {
            if (resp2.data.gkstatus === 0) {
              resp2.data.gkresult.sort((a, b) => a.custid - b.custid); // sorting items based on custid, to display in the order of creation
              self.options.suppliers = resp2.data.gkresult.map((item) => {
                return {
                  text: item.custname,
                  value: {
                    id: item.custid,
                    name: item.custname,
                  },
                };
              });
            } else {
              // Supplier list not loaded
            }
          }

          // If coming from Contact's page, autofill invoice party details from store
          if (self.invoiceParty.id !== null) {
            self.form.type =
              self.invoiceParty.type === 'customer' ? 'sale' : 'purchase';
            Object.assign(self.form.party, {
              type: self.invoiceParty.type,
              name: {
                id: self.invoiceParty.id,
                name: self.invoiceParty.name,
              },
            });
          }
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Customer/Supplier Data Failed!'),
            error.message,
            'danger'
          );
          return error;
        });
    },

    onSubmit() {
      this.isLoading = true;
      this.createInvoice();
      // console.log(this.initDelNotePayload());
      // console.log(this.initPayload());
    },
    createInvoice() {
      const self = this;
      const delchalPayload = this.initDelNotePayload();
      const payload = this.initPayload();
      axios
        .post('/invoice', {payload, delchalPayload})
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
            case 0:
              {
                // success
                self.invoiceId = resp.data.gkresult;
                self.invModalId = self.invoiceId;
                self.displayToast(
                  self.$gettext(`Create Invoice Successfull!`),
                  `Invoice saved with entry no. ${resp.data.invoiceid ||
                    resp.data.gkresult ||
                    resp.data.vchData.vchno}`,
                  'success'
                );

                let log = {
                  activity: `invoice ${
                    'created' // self.isCreate ? 'created' : 'updated'
                  }: ${self.form.inv.no}`,
                };
                axios.post('/log', log);

                self
                  .updateInvNoCounter()
                  .then(() => {
                    self.resetForm();
                    self.showPrintModal = true;
                  })
                  .catch(() => {
                    self.showPrintModal = true;
                  });
                // if (self.isCreate) {
                // }
                // else {
                //   self.showPrintModal = self.isSale; // show print screen if sale and not if purchase
                // }
              }
              break;
            case 1:
              // Duplicate entry
              self.displayToast(
                self.$gettext(`Create Invoice Failed!`),
                self.$gettext('Duplicate Entry, Check Invoice Id'),
                'warning'
              );
              break;
            case 2:
              // Unauthorized access
              self.displayToast(
                self.$gettext(`Create Invoice Failed!`),
                self.$gettext('Unauthorized Access, Contact Admin'),
                'warning'
              );
              break;
            case 3:
              // Connection failed, Check inputs and try again
              self.displayToast(
                self.$gettext(`Create Invoice Failed!`),
                self.$gettext('Please check your input and try again later'),
                'danger'
              );
            }

            if (resp.data.gkstatus !== 0) {
              self.deleteDelNote(self.dcId);
            }
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(
            this.$gettext(`Create Invoice Error!`),
            error.message,
            'warning'
          );
        });
    },
    initPayload() {
      this.collectComponentData();
      this.updateDefaultNarration();
      let billItems = this.sanitizeBillItems();
      if (!billItems.length) {
        return false;
      }
      let paymentMode = this.form.payment.mode;
      let partyVoucherFlag = this.$store.getters['global/getPartyVoucherFlag'];
      if (partyVoucherFlag) {
        if (paymentMode === 2) {
          paymentMode = 4;
        } else if (paymentMode === 3) {
          paymentMode = 5;
        }
      }

      let invoice = {
        invoiceno: this.form.inv.no,
        ewaybillno: this.form.inv.ebn,
        invoicedate: this.form.inv.date,
        sourcestate: this.form.inv.state.name || null,
        orgstategstin: null,
        issuername: this.form.inv.issuer,
        designation: this.form.inv.role,
        address: this.form.inv.addr,
        pincode: this.form.inv.pin,

        custid: this.form.party.name.id || '',
        consignee: {},

        roundoffflag: this.form.total.roundFlag ? 1 : 0,
        // invtotal: this.getTotal('total'),
        // invtotalword: null,

        taxflag: 0,
        taxstate: null,

        pricedetails: [],

        paymentmode: paymentMode,

        transportationmode: this.form.transport.mode,
        reversecharge: this.form.transport.reverseCharge ? 1 : 0,

        discflag: 1, // discount flag, 1 - amount, 16 - percent
        invnarration: this.form.narration || this.defaultNarration,
      };

      // === Delivery Note ===
      if (this.dcId) {
        invoice.dcid = this.dcId;
      }
      // === Sale / Purchase related data ===
      invoice.sourcestate = this.form.inv.state.name || null;
      invoice.taxstate = this.form.party.state.name || null;
      if (this.isSale) {
        invoice.inoutflag = 15; // sale
      } else {
        invoice.inoutflag = 9; // purchase
        delete invoice.ewaybillno;
        invoice.supinvno = this.form.inv.supno;
        invoice.supinvdate = this.form.inv.supdate;
      }

      // Place of supply is used as taxstate
      if (typeof this.form.inv.taxState === 'object') {
        if (this.form.inv.taxState.name) {
          invoice.taxstate = this.form.inv.taxState.name;
        }
      }

      // === GST/ VAT related data ===
      if (this.isGst) {
        invoice.taxflag = 7;
      }
      if (this.isVat) {
        invoice.taxflag = 22;
      }

      // === Total Invoice price data ===
      invoice.invoicetotal = this.form.total.amount;
      invoice.invoicetotalword = this.form.total.text;

      // === Consignee data ===
      if (this.form.ship.name) {
        invoice.consignee = {
          consigneename: this.form.ship.name || '',
          tinconsignee: this.form.ship.tin || '',
          gstinconsignee: this.form.ship.gstin || '',
          consigneeaddress: this.form.ship.addr || '',
          consigneestate: this.form.ship.state?.name || null,
          consigneestatecode: this.form.ship.state?.id || null,
          consigneepincode: this.form.ship.pin || '',
        };
      }

      // === Bill data ===
      let contents = {};
      let stock = { items: {}, inout: invoice.inoutflag };
      let pricedetails = [];
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

      const self = this;
      billItems.forEach((item) => {
        let inclusiveFlag = false; // must add ths to global settings and fetch from there
        let rate = item.rate;
        if (inclusiveFlag) {
          // cess + gst + rate = item rate
          let inclusiveRate = item.rate;
          rate =
            inclusiveRate / (0.01 * item.igst.rate + 0.01 * item.cess.rate + 1);
        }
        let taxable = rate * item.qty - item.discount.total;

        if (contents[item.product.id] === undefined) {
          contents[item.product.id] = {};
        }

        contents[item.product.id][rate] = parseFloat(item.qty).toFixed(2);
        stock.items[item.product.id] = parseFloat(item.qty).toFixed(2);

        if (self.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
          av.avtax = {
            GSTName: self.isCgst ? 'CGST' : 'IGST',
            CESSName: 'CESS',
          };
        } else {
          let vat = { rate: 0, amount: 0 };
          if (self.taxState && item.vatMap && item.vatMap[self.taxState]) {
            vat = item.vatMap[self.taxState];
          }
          tax[item.product.id] = parseFloat(vat.rate).toFixed(2);
          av.taxpayment += taxable;
        }

        freeqty[item.product.id] = isNaN(parseFloat(item.fqty))
          ? 0
          : parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.total).toFixed(2);

        av.product[item.product.name] = parseFloat(taxable).toFixed(2);
        av.prodData[item.product.id] = parseFloat(taxable).toFixed(2);
        av.totaltaxable += taxable;

        pricedetails.push({
          custid: self.form.party.name.id || '',
          productcode: item.product.id,
          inoutflag: invoice.inoutflag,
          lastprice: item.rate,
        });
      });

      av.taxpayment = parseFloat(av.taxpayment).toFixed(2);
      av.totaltaxable = parseFloat(av.totaltaxable).toFixed(2);

      Object.assign(invoice, {
        contents,
        pricedetails,
        tax,
        cess,
        av,
        freeqty,
        discount,
      });

      // === payment details, mode = 2 ===
      if (this.form.payment.mode === 2) {
        invoice.bankdetails = {
          accountno: this.form.payment.bank.no,
          bankname: this.form.payment.bank.name,
          ifsc: this.form.payment.bank.ifsc,
          branch: this.form.payment.bank.branch,
        };
      }

      if (this.form.transport.mode === 'Road') {
        invoice.vehicleno = this.form.transport.vno;
      }

      if (this.form.transport.date) {
        invoice.dateofsupply = this.form.transport.date;
      }

      if (this.form.attachments.length) {
        invoice.attachment = this.form.attachments;
        invoice.attachmentcount = this.form.attachments.length;
      }

      // if (!this.isCreate) {
      //   const av = Object.assign({}, invoice.av);
      //   invoice.invid = parseInt(this.invoiceId);

      //   delete invoice.av;
      //   delete invoice.pincode;
      //   delete invoice.discflag;

      //   return { invoice, stock, av };
      // }

      // console.log({ invoice, stock });
      return { invoice, stock };
    },
    updateInvNoCounter() {
      if (
        this.config &&
        this.config.inv &&
        this.config.inv.no &&
        this.config.inv.no.counter
      ) {
        let counter = {
          sale: this.config.inv.no.counter.sale,
          purchase: this.config.inv.no.counter.purchase,
        };
        if (this.isSale) {
          counter.sale++;
        } else {
          counter.purchase++;
        }

        const payload = {
          config: counter,
          path: [
            PAGES['create-invoice'] + '',
            CONFIGS['page-layout'] + '',
            'inv',
            'no',
            'counter',
          ],
        };
        return axios.put(
          '/config?conftype=org&update=path&confcategory=transaction',
          payload
        );
      } else {
        return Promise.resolve();
      }
    },
    createDelNote() {
      const payload = this.initDelNotePayload();
      if (!payload) {
        this.displayToast(
          this.$gettext(`Create Delivery Note Failed!`),
          this.$gettext('Please check your input and try again later'),
          'danger'
        );
        return -1;
      }
      let method = 'post',
          url = '/delchal';

      // if (!this.isCreate && this.dcId) {
      //   method = 'put';
      //   url = `/delchal/${this.dcId}`;
      // }

      return axios({ method: method, url: url, data: payload })
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            this.dcId = resp.data.gkresult || null;
            // if (resp.data.gkresult || this.isCreate) {
            // }
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
    deleteDelNote(dcid) {
      return axios.delete(`/delchal/${dcid}`).then((resp) => {
        return resp.data.gkstatus;
      });
    },
    sanitizeBillItems() {
      return this.form.bill.filter(
        (item) =>
          item.product &&
          item.rate &&
          item.qty &&
          item.product.id &&
          item.product.name
      );
    },
    initDelNotePayload() {
      this.collectComponentData();
      let billItems = this.sanitizeBillItems();
      if (!billItems.length) {
        return false;
      }
      this.updateDefaultNarration();
      let delchal = {
        custid: parseInt(this.form.party.name?.id) || '',
        dcno: this.form.inv.dnNo,
        dcdate: this.form.inv.date,
        dcflag: this.isSale ? 4 : 16,
        taxstate: this.form.party.state.name,
        orgstategstin: this.form.inv.gstin || '',
        discflag: 1,
        taxflag: 0,
        dcnarration: this.form.narration || this.defaultNarration,
        roundoffflag: this.form.total.roundFlag ? 1 : 0,
        consignee: {},

        issuername: this.form.inv.issuer,
        designation: this.form.inv.role,

        vehicleno: this.form.transport.vehicleno || '',
        modeoftransport: this.form.transport.mode,
        noofpackages: this.form.transport.packageCount,
      };
      // === Sale / Purchase related data ===
      delchal.sourcestate = this.form.inv.state.name || null;
      delchal.taxstate = this.form.party.state.name || null;
      if (this.isSale) {
        delchal.inoutflag = 15; // sale
      } else {
        delchal.inoutflag = 9; // purchase
        delete delchal.ewaybillno;
      }

      // Place of supply is used as taxstate
      if (typeof this.form.inv.taxState === 'object') {
        if (this.form.inv.taxState.name) {
          delchal.taxstate = this.form.inv.taxState.name;
        }
      }
      // if purchase invoice, place of supply is party state

      // === GST/ VAT related data ===
      if (this.isGst) {
        delchal.taxflag = 7;
      }
      if (this.isVat) {
        delchal.taxflag = 22;
      }

      // === Total Invoice price data ===
      delchal.delchaltotal = this.form.total.amount;
      delchal.totalinword = this.form.total.text;

      // === Consignee data ===
      if (this.form.ship.name) {
        delchal.consignee = {
          consigneename: this.form.ship.name || '',
          tinconsignee: this.form.ship.tin || '',
          gstinconsignee: this.form.ship.gstin || '',
          consigneeaddress: this.form.ship.addr || '',
          consigneestate: this.form.ship.state
            ? this.form.ship.state.name || null
            : null,
          consigneestatecode: this.form.ship.state
            ? this.form.ship.state.id || null
            : null,
          consigneepincode: this.form.ship.pin || '',
        };
      }

      // === Bill data ===
      let contents = {};
      let stock = {
        // items: {},
        inout: delchal.inoutflag,
        goid: this.form.inv.godown,
      };
      let pricedetails = [];
      let tax = {};
      let cess = {};
      // let av = {
      //   product: {},
      //   prodData: {},
      //   taxpayment: 0,
      //   totaltaxable: 0,
      // };
      let freeqty = {};
      let discount = {};

      const self = this;
      billItems.forEach((item) => {
        // let taxable = item.total * item.qty - item.discount.amount;
        if (contents[item.product.id] === undefined) {
          contents[item.product.id] = {};
        }

        contents[item.product.id][item.rate] = parseFloat(item.qty).toFixed(2);
        // stock.items[item.product.id] = parseFloat(item.qty).toFixed(2);

        if (self.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
          // // av.avtax = { GSTName: 'IGST', CESSName: 'CESS' };
        } else {
          let vat = { rate: 0, amount: 0 };
          if (self.taxState && item.vatMap && item.vatMap[self.taxState]) {
            vat = item.vatMap[self.taxState];
          }
          tax[item.product.id] = parseFloat(vat.rate).toFixed(2);
          // av.taxpayment += taxable;
        }

        freeqty[item.product.id] = isNaN(parseFloat(item.fqty))
          ? 0
          : parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.total).toFixed(2);

        pricedetails.push({
          custid: self.form.party.name.id || '',
          productcode: item.product.id,
          inoutflag: delchal.inoutflag,
          lastprice: item.rate,
        });
      });


      Object.assign(delchal, {
        contents,
        // pricedetails,
        tax,
        cess,
        // av,
        freeqty,
        discount,
      });

      if (this.form.transport.mode === 'Road') {
        delchal.vehicleno = this.form.transport.vno;
      }

      if (this.form.transport.date) {
        delchal.dateofsupply = this.form.transport.date;
      }
      return { delchaldata: delchal, stockdata: stock };
    },
    resetForm() {
      this.showPrintModal = false;
      this.$store.dispatch(`${this.vuexNameSpace}/initInvoiceConfig`);
      let paymentMode;
      switch (this.defaultPaymentMode) {
      case 'credit':
        {
          paymentMode = 15;
        }
        break;
      case 'bank':
        {
          paymentMode = 2;
        }
        break;
      case 'cash':
      default: {
        paymentMode = 3;
      }
      }
      let type = this.form.type;
      this.form = {
        type: type,
        inv: {
          state: {
            id: null,
            name: '',
          },
          taxState: {
            id: null,
            name: '',
          },
        },
        party: {
          name: false,
          state: {
            id: null,
            name: '',
          },
        },
        ship: {},
        taxType: this.form.taxType,
        bill: [
          {
            product: { name: '', id: '' },
          },
        ],
        payment: {
          mode: paymentMode,
          bank: {
            no: null,
            name: null,
            branch: null,
            ifsc: null,
          },
        },
        transport: {
          packageCount: 0,
          mode: 'Road',
          vno: null,
          date: null,
          reverseCharge: false,
        },
        narration: null,
        total: {},
        attachments: [],
      };
      this.setOrgDetails();
      this.setBankDetails();
      this.updateComponentData();
    },
    setOrgDetails() {
      if (this.options.orgDetails !== null) {
        if (this.options.orgDetails.orgname) {
          Object.assign(this.form.inv, {
            addr: this.options.orgDetails.addr,
            pin: this.options.orgDetails.pin,
            state: this.options.orgDetails.state
              ? this.options.orgDetails.state
              : null,
          });
        }
      }
    },

    // initPartyEdit() {
    //   this.form.party.editFlag = true;
    //   this.form.party.editMode = {
    //     addr: this.form.party.addr,
    //     state: this.form.party.state,
    //     gstin: this.form.party.gstin,
    //     pin: this.form.party.pin,
    //   };
    // },
    // fetchEditableInvoices() {
    //   const self = this;
    //   const requests = [
    //     axios.get(`/invoice/list/rectify?invtype=15`),
    //     axios.get(`/invoice/list/rectify?invtype=9`),
    //   ];

    //   Promise.all(requests).then(([resp1, resp2]) => {
    //     if (resp1.data.gkstatus === 0) {
    //       self.options.editableInvoices['sale'] = resp1.data.invoices.map(
    //         (inv) => {
    //           return {
    //             text: `${inv.invoiceno}, ${inv.invoicedate}, ${inv.custname}`,
    //             value: inv.invid,
    //           };
    //         }
    //       );
    //     }

    //     if (resp2.data.gkstatus === 0) {
    //       self.options.editableInvoices['purchase'] = resp2.data.invoices.map(
    //         (inv) => {
    //           return {
    //             text: `${inv.invoiceno}, ${inv.invoicedate}, ${inv.custname}`,
    //             value: inv.invid,
    //           };
    //         }
    //       );
    //     }
    //   });
    // },
    //TODO: reset the timer to 3 seconds
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 30 * 1000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
    /** Update the URL based on form mode selected (Create/Edit) */
    // updateUrl() {
    //   let url = window.location.href.split('#')[0];
    //   url += `#/invoice`; // /${this.formMode}/0
    //   history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
    //   // instead of creating a new history instances for every entity selected
    // },
    initForm() {
      let self = this;
      // this.updateUrl();
      this.resetForm();
      this.preloadData().then(() => {
        let bd = self.options.orgDetails.bankDetails || {};
        Object.assign(self.form.payment.bank, {
          no: bd.accountno || '',
          name: bd.bankname || '',
          branch: bd.branchname || '',
          ifsc: bd.ifsc || '',
        });
        self.updateCounter.payment++;

        // self.fetchEditableInvoices();
        // self.$nextTick().then(() => {
        //   if (self.formMode === 'edit') {
        //     self.fetchInvoiceData().then(() => {
        //       self.fetchDelNoteGodown(this.dcId);
        //     });
        //     // self.fetchDelNoteData();
        //   }
        // });
      });
    },
  },
  watch: {
    defaultTaxMode(newMode) {
      this.form.taxType = newMode;
    },
    isSale() {
      this.setBankDetails();
    },
  },
  beforeMount() {
    this.vuexNameSpace = 'invoiceConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, invoiceConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initInvoiceConfig`);
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future
    // this.invoiceId = parseInt(this.invid);
    this.initForm();
    if (isNaN(this.user_role)) {
      this.get_user_role();
    }
    this.form.taxType = this.defaultTaxMode;
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>

<style scoped>
@media only screen and (max-width: 450px) {
  #edit-invoice-list {
    max-width: 150px;
  }
}
</style>
