<template>
  <b-container
    style="min-width: 300px"
    fluid
    class="mt-2 px-md-3 px-2 align-form-label-right"
  >
    <b-form @submit.prevent="confirmOnSubmit">
      <div class="text-center pt-2">
        <h4 v-translate>
          Create Delivery Note
        </h4>
      </div>
      <hr>
      <div class="mb-2">
        <b-form-radio-group
          v-model="form.type"
          button-variant="outline-secondary"
          size="sm"
          buttons
          class="mx-1"
        >
          <b-form-radio value="sale">
            <translate> Sale </translate>
          </b-form-radio>
          <b-form-radio value="purchase">
            <translate> Purchase </translate>
          </b-form-radio>
        </b-form-radio-group>
        <div class="clearfix" />
      </div>
      <b-card-group
        class="d-block d-md-flex my-2"
        deck
      >
        <!-- Buyer/Seller Details -->
        <party-details
          :mode="form.type"
          :parent-data="form.party"
          :gst-flag="isGst"
          :invoice-party="invoiceParty"
          :config="config.party"
          :sale-flag="isSale"
          @details-updated="onComponentDataUpdate"
          :update-counter="updateCounter.party"
          ref="party"
        />
        <!-- Delivery Note Details -->
        <delivery-note-details
          :config="config.delNote"
          :sale-flag="isSale"
          @details-updated="onComponentDataUpdate"
          :update-counter="updateCounter.delNote"
          :parent-data="form.delNote"
          ref="delNote"
        />
        <!-- Shipping Details -->
        <ship-details
          :states="options.states"
          :gst-flag="isGst"
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
        v-if="config.taxType"
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
        :inv-date="form.delNote.date"
        :sale-flag="isSale"
        :block-empty-stock="isSale"
        :gst-flag="isGst"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :update-counter="updateCounter.bill"
        :parent-data="form.bill"
        :cgst-flag="isCgst"
        :godown-id="form.delNote.godown"
        :tax-state="taxState"
        ref="bill"
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
              :bill-data="form.bill"
              :update-counter="updateCounter.totalTable"
              :cgst-flag="isCgst"
              ref="totalTable"
            />
          </b-col>
        </b-row>
      </div>
      <b-card-group
        class="d-block d-md-flex"
        deck
      >
        <!-- Transport Details -->
        <transport-details
          ref="transport"
          :config="config.transport"
          :update-counter="updateCounter.transport"
          :parent-data="form.transport"
          :inv-date="form.delNote.date"
          @details-updated="onComponentDataUpdate"
        />
        <!-- Invoice Comments -->
        <comments
          :name="`Delivery Note`"
          ref="narration"
          :config="config.comments"
          :update-counter="updateCounter.comments"
          :parent-data="form.comments"
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
          <span v-if="formMode === 'create'">
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

          <span v-else>
            <b-spinner
              v-if="isLoading"
              small
            />
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle mr-1"
              icon="cloud-arrow-up"
            />
            <span
              class="align-middle"
              v-translate
            >Save Changes</span>
          </span>
        </b-button>
      </div>
      <div class="clearfix" />
    </b-form>
    <print-page
      :show="showPrintModal"
      name="DeliveryNote"
      title="Delivery Note"
      :id="delNoteId"
      :pdata="{
        printTitle: {page: 'Delivery Note', file: 'delivery_note'},
        useTriplicate: true,
      }"
      @hidden="showPrintModal = false"
    />
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
// import Config from '../../components/Config.vue';

import PartyDetails from '../../components/form/transaction/PartyDetails.vue';
import ShipDetails from '../../components/form/transaction/ShipDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';
import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import Comments from '../../components/form/transaction/Comments.vue';
import DeliveryNoteDetails from '../../components/form/transaction_details/DeliveryNoteDetails.vue';

import delNoteConfig from '../../js/config/transaction/deliveryNote';

import PrintPage from '../../components/workflow/PrintPage.vue';

export default {
  name: 'DeliveryNote',
  components: {
    // Config,

    PartyDetails,
    ShipDetails,
    BillTable,
    TotalTable,
    TransportDetails,
    Comments,
    DeliveryNoteDetails,

    PrintPage,
  },
  props: {
    mode: {
      type: String,
      validator: function(value) {
        return ['create', 'edit'].indexOf(value) !== -1;
      },
      required: true,
    },
    invid: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      showPrintModal: false,
      delNoteId: 0,
      vuexNameSpace: '',
      // config: {},
      updateCounter: {
        party: 0,
        delNote: 0,
        ship: 0,
        bill: 0,
        totalTable: 0,
        transport: 0,
        comments: 0,
      },
      formMode: '',
      invoiceId: '',
      // check resetForm() for the fully defined form{} object
      form: {
        type: 'sale',
        delNote: {
          state: { id: null },
          taxState: { id: null },
        },
        party: {
          state: { id: null },
        },
        ship: {},
        taxType: 'gst', // vat
        bill: [],
        transport: {},
        narration: null,
        total: {},
      },
      isLoading: false,
      isPreloading: false,
      temp: null,
      options: {
        states: [],
        editableInvoices: {
          purchase: [],
          sale: [],
        },
        orgDetails: {},
      },
      editFlag: null, // A flag used to skip fetchProductDetails() method call,
      // when the bill table is populated when the page loads in edit mode
    };
  },
  computed: {
    taxState: (self) => {
      // debugger;
      return self.form.delNote.taxState ? self.form.delNote.taxState.name : '';
    },
    // config : Gets the custom config from the invoiceConfig Vuex module and
    //          prepares it for use by adding some custom additions to it (that should not be user editable)
    config: (self) => {
      let newConf =
        self.$store.getters[`${self.vuexNameSpace}/getCustomDelNoteConfig`];
      if (newConf) {
        newConf.bill.footer.headingColspan =
          !!newConf.bill.index +
          !!newConf.bill.product +
          !!newConf.bill.hsn +
          !!newConf.bill.qty +
          !!newConf.bill.rate || 1;

        if (newConf.delNote.class) {
          newConf.delNote.class = {
            'mr-md-1': !!newConf.ship,
            'ml-md-1': !!newConf.party,
          };
        }
        if (newConf.ship.class) {
          newConf.ship.class = {
            'ml-md-1': !!(newConf.delNote || newConf.party),
          };
        }
        if (newConf.party.class) {
          newConf.party.class = {
            'mr-md-1': !!(newConf.delNote || newConf.ship),
          };
        }

        if (newConf.transport.class) {
          newConf.transport.class = {
            'mr-md-1': !!newConf.comments,
            // 'ml-md-1': !!newConf.payment,
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
          delNote: {
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
            footer: {
              headingColspan: 1,
            },
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
      self.$store.getters[`${self.vuexNameSpace}/getDefaultDelNoteConfig`],
    party: (self) =>
      self.form.party.type === 'customer' ? 'Customer' : 'Supplier',
    isSale: (self) => self.form.type === 'sale',
    isGst: (self) => self.form.taxType === 'gst',
    isCgst: (self) => {
      if (self.form.delNote.state && self.form.party.state) {
        if (self.form.delNote.state.name === self.form.party.state.name) {
          return true;
        }
      }
      return false;
    },
    minDate: (self) => new Date(self.yearStart),
    maxDate: (self) => new Date(self.yearEnd),
    isInvDateValid: (self) => {
      let currDate = new Date(self.form.delNote.date).getTime(),
          minDate = self.minDate.getTime(),
          maxDate = self.maxDate.getTime();
      return !isNaN(currDate)
        ? currDate >= minDate && currDate <= maxDate
        : null;
    },
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    ...mapState(['yearStart', 'yearEnd', 'invoiceParty', 'orgCode']),
  },
  methods: {
    collectComponentData() {
      this.updateCounter.totalTable++;
      Object.assign(this.form.delNote, this.$refs.delNote.form);
      Object.assign(this.form.party, this.$refs.party.form);
      Object.assign(this.form.ship, this.$refs.ship.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      Object.assign(this.form.transport, this.$refs.transport.form);
      this.form.narration = this.$refs.narration.form.narration;
    },
    updateComponentData() {
      this.updateCounter.party++;
      this.updateCounter.delNote++;
      this.updateCounter.ship++;
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.transport++;
      this.updateCounter.comments++;
    },
    onComponentDataUpdate(payload) {
      const self = this;
      switch (payload.name) {
      case 'delivery-note-details':
        {
          // debugger;
          Object.assign(this.form.delNote, payload.data);
          this.form.transport.date = this.form.delNote.date;
          setTimeout(function() {
            self.updateCounter.transport++;
          });
        }
        break;
      case 'party-details':
        // debugger;
        Object.assign(this.form.party, payload.data);
        this.updateCounter.ship++;
        this.form.delNote.taxState = payload.data.state;
        setTimeout(function() {
          self.updateCounter.delNote++;
        }, 1);
        break;
      case 'bill-table':
        Object.assign(this.form.bill, payload.data);
        this.updateCounter.totalTable++;
        break;
      case 'transport-details':
        Object.assign(this.form.transport, payload.data);
        break;
      }
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
      return Promise.all(requests).then(([resp1, resp2]) => {
        self.isPreloading = false;

        // === State List ===
        if (resp1.data.gkstatus === 0) {
          self.options.states = resp1.data.gkresult.map((item) => {
            return {
              text: Object.values(item)[0],
              value: {
                id: Object.keys(item)[0],
                name: Object.values(item)[0],
              },
            };
          });
        }
        if (resp2.data.gkstatus === 0) {
          let state = self.options.states.find(
            (state) => state.text === resp2.data.gkdata.orgstate
          );
          let stateCode = state ? state.value.id : null;
          let gstin = resp2.data.gkdata.gstin;
          self.options.orgDetails = {
            name: resp2.data.gkdata.orgname,
            addr: resp2.data.gkdata.orgaddr,
            state: state.value,
            gstin: stateCode && gstin ? gstin[stateCode] : '',
            tin: '',
            pin: resp2.data.gkdata.orgpincode,
          };
        }
      });
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
    confirmOnSubmit() {
      Object.assign(this.form.delNote, this.$refs.delNote.form);
      const self = this;
      let text = '';
      if (this.isSale) {
        text = this.$gettextInterpolate(
          this.$gettext(`Create Delivery Note (%{delNoteNo}) for Sale?`),
          { delNoteNo: this.form.delNote.no }
        );
      } else {
        text = this.$gettextInterpolate(
          this.$gettext(`Create Delivery Note (%{delNoteNo}) for Purchase?`),
          { delNoteNo: this.form.delNote.no }
        );
      }
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
      let self = this;
      this.isLoading = true;
      const payload = this.initPayload();
      let successTitle, successMessage, failTitle;
      if (this.formMode === 'create') {
        successTitle = this.$gettext('Create Delivery Note Successful!');
        successMessage = this.$gettextInterpolate(
          `Delivery Note %{delNoteNo} was successfully created.`, {
            delNoteNo: payload.delchaldata?.dcno,
          });
        failTitle = this.$gettext('Create Delivery Note Failed!');

      } else {
        successTitle = this.$gettext('Edit Delivery Note Successful!');
        successMessage = this.$gettextInterpolate(
          `Delivery Note %{delNoteNo} was successfully edited.`, {
            delNoteNo: payload.delchaldata.dcno,
          }
        );
        failTitle = this.$gettext('Edit Delivery Note Failed!');
      }
      axios
        .post('/delchal', payload)
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
            case 0:
              {
                // success
                this.displayToast(successTitle, successMessage, 'success');

                let log = {
                  activity: `delivery note ${
                    self.formMode === 'create' ? 'created' : 'updated'
                  }: ${self.form.delNote.no}`,
                };
                axios.post('/log', log);

                this.delNoteId = resp.data.gkresult;
                this.resetForm();
                this.showPrintModal = true;
              }
              break;
            case 1:
              // Duplicate entry
              this.displayToast(
                failTitle,
                this.$gettext('Duplicate Entry, Check Delivery Note Id'),
                'warning'
              );
              break;
            case 2:
              // Unauthorized access
              this.displayToast(
                failTitle,
                this.$gettext('Unauthorized Access, Contact Admin'),
                'warning'
              );
              break;
            case 3:
              // Connection failed, Check inputs and try again
              this.displayToast(
                failTitle,
                this.$gettext('Please check your input and try again later'),
                'danger'
              );
            }
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(failTitle, error.message, 'warning');
        });
    },
    initPayload() {
      this.collectComponentData();

      let delchal = {
        custid: parseInt(this.form.party.name.id) || '',
        dcno: this.form.delNote.no,
        dcdate: this.form.delNote.date,
        dcflag: this.form.delNote.type,
        taxstate: this.form.party.state.name,
        orgstategstin: this.form.delNote.gstin || '',
        discflag: 1,
        dcnarration: this.form.narration,
        roundoffflag: this.form.total.roundFlag ? 1 : 0,
        consignee: {},

        issuername: this.form.delNote.issuer,
        designation: this.form.delNote.role,

        vehicleno: this.form.transport.vehicleno || '',
        modeoftransport: this.form.transport.mode,
        noofpackages: this.form.transport.packageCount,
      };

      // === Sale / Purchase related data ===
      if (this.isSale) {
        delchal.sourcestate = this.form.delNote.state.name || null;
        delchal.taxstate = this.form.party.state.name || null;
        delchal.inoutflag = 15; // sale
      } else {
        delchal.sourcestate = this.form.party.state.name || null;
        delchal.taxstate = this.form.delNote.state.name || null;
        delchal.inoutflag = 9; // purchase
        delete delchal.ewaybillno;
      }

      // Place of supply is used as taxstate
      if (typeof this.form.delNote.taxState === 'object') {
        if (this.form.delNote.taxState.name) {
          delchal.taxstate = this.form.delNote.taxState.name;
        }
      }

      // === GST/ VAT related data ===
      if (this.isGst) {
        delchal.taxflag = 7;
      } else {
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
          consigneestate: this.form.ship.state.name || null,
          consigneestatecode: this.form.ship.state.id || null,
          consigneepincode: this.form.ship.pin || '',
        };
      }

      // === Bill data ===
      let contents = {};
      let stock = {
        // items: {},
        inout: delchal.inoutflag,
        goid: this.form.delNote.godown,
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
      this.form.bill.forEach((item) => {
        // let taxable = item.total * item.qty - item.discount.amount;

        if (contents[item.product.id] === undefined) {
          contents[item.product.id] = {};
        }

        contents[item.product.id][item.rate] = parseFloat(item.qty).toFixed(2);
        // stock.items[item.product.id] = parseFloat(item.qty).toFixed(2);

        if (this.isGst) {
          tax[item.product.id] = parseFloat(item.igst.rate).toFixed(2);
          cess[item.product.id] = parseFloat(item.cess.rate).toFixed(2);
          // // av.avtax = { GSTName: 'IGST', CESSName: 'CESS' };
        } else {
          tax[item.product.id] = parseFloat(item.vat.rate).toFixed(2);
          // av.taxpayment += taxable;
        }

        freeqty[item.product.id] = isNaN(parseFloat(item.fqty))
          ? 0
          : parseFloat(item.fqty).toFixed(2);
        discount[item.product.id] = parseFloat(item.discount.total).toFixed(2);

        // av.product[item.product.name] = parseFloat(taxable).toFixed(2);
        // av.prodData[item.product.id] = parseFloat(taxable).toFixed(2);
        // av.totaltaxable += taxable;

        pricedetails.push({
          custid: this.form.party.name.id || '',
          productcode: item.product.id,
          inoutflag: delchal.inoutflag,
          lastprice: item.rate,
        });
      });

      // // av.taxpayment = parseFloat(av.taxpayment).toFixed(2);
      // // av.totaltaxable = parseFloat(av.totaltaxable).toFixed(2);

      Object.assign(delchal, {
        contents,
        // pricedetails,
        tax,
        cess,
        // av,
        freeqty,
        discount,
      });

      // // === payment details, mode = 2 ===
      // if (this.form.payment.mode === 2) {
      //   delchal.bankdetails = {
      //     accountno: this.form.payment.bank.no,
      //     bankname: this.form.payment.bank.name,
      //     ifsc: this.form.payment.bank.ifsc,
      //     branch: this.form.payment.bank.branch,
      //   };
      // }

      if (this.form.transport.mode === 'Road') {
        delchal.vehicleno = this.form.transport.vno;
      }

      if (this.form.transport.date) {
        delchal.dateofsupply = this.form.transport.date;
      }

      // if (this.formMode === 'edit') {
      //   const av = Object.assign({}, invoice.av);
      //   invoice.invid = parseInt(this.invoiceId);

      //   delete invoice.av;
      //   delete invoice.pincode;
      //   delete invoice.discflag;

      //   return { invoice, stock, av };
      // }
      return { delchaldata: delchal, stockdata: stock };
    },
    resetForm() {
      this.showPrintModal = false;
      let delNote = this.form.delNote;
      this.form = {
        type: 'sale',
        delNote: {
          no: delNote.no + 1,
          date: delNote.date,
          state: delNote.state,
          godown: delNote.godown,
          type: delNote.type,
          gstin: delNote.gstin,
          issuer: delNote.issuer,
          role: delNote.role,
          options: delNote.options,
          taxState: { id: null },
        },
        party: {
          name: false,
          state: { id: null },
        },
        ship: {},
        taxType: 'gst', // vat
        bill: [
          {
            product: { name: '', id: '' },
          },
        ],
        total: {},
        transport: {
          mode: 'Road',
          vno: null,
          date: null,
          reverseCharge: false,
          packageCount: 0,
        },
        narration: null,
      };
      this.updateComponentData();
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
    initForm() {
      let self = this;
      this.resetForm();
      this.preloadData().then(() => {
        self.$nextTick().then(() => {
          if (!self.isInvDateValid) {
            self.form.delNote.date = self.yearStart;
          }
        });
      });
    },
  },
  beforeMount() {
    this.vuexNameSpace = 'deliveryNoteConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, delNoteConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initDelNoteConfig`, {
      orgCode: this.orgCode,
    });
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future
    this.formMode = this.mode;
    this.invoiceId = this.invid;
    this.initForm();
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
