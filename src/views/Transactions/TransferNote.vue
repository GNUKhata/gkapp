<template>
  <b-container
    style="min-width: 300px"
    fluid
    class="mt-2 px-md-3 px-2 align-form-label-right"
  >
    <b-form @submit.prevent="confirmOnSubmit">
      <div class="text-center pt-2">
        <h4 v-translate>
          Create Transfer Note
        </h4>
      </div>
      <hr>
      <b-card-group
        class="d-block d-md-flex my-2"
        deck
      >
        <!-- Delivery Note Details -->
        <transfer-note-details
          :config="config.transferNote"
          @details-updated="onComponentDataUpdate"
          :update-counter="updateCounter.transferNote"
          ref="transferNote"
        />
        <transport-details
          ref="transport"
          :config="config.transport"
          :update-counter="updateCounter.transport"
          :parent-data="form.transport"
          :inv-date="form.transferNote.date"
        />
      </b-card-group>
      <!-- Bill Table -->
      <bill-table
        :sale-flag="true"
        :gst-flag="true"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :update-counter="updateCounter.bill"
        :parent-data="form.bill"
        :godown-id="form.transferNote.godownFrom"
        bill-type="transfernote"
        ref="bill"
      />
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
          :disabled="!isInvDateValid || !!isLocationValid"
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
      name="TransferNote"
      title="Transfer Note"
      :id="tnoteId"
      :pdata="{}"
      @hidden="showPrintModal = false"
    />
  </b-container>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

import BillTable from '../../components/form/transaction/BillTable.vue';
import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import TransferNoteDetails from '../../components/form/transaction_details/TransferNoteDetails.vue';

import PrintPage from '../../components/workflow/PrintPage.vue';
import TransferNoteConfig from '../../js/config/transaction/transferNote.js';

export default {
  name: 'TransferNote',
  components: {
    BillTable,
    TransportDetails,
    TransferNoteDetails,
    PrintPage,
  },
  data() {
    return {
      showPrintModal: false,
      tnoteId: 0,
      vuexNameSpace: '',
      isLoading: false,
      isInvDateValid: false,
      updateCounter: {
        transferNote: 0,
        bill: 0,
        transport: 0,
      },
      godownFrom: '',
      godownTo: '',
      isLocationValid: '',
      form: {
        transferNote: {
          godownFrom: -1,
        },
        bill: [],
        transport: {},
      },
      options: {
        states: [],
      },
    };
  },
  computed: {
    config: (self) => {
      let newConf =
        self.$store.getters[
          `${self.vuexNameSpace}/getCustomTransferNoteConfig`
        ];
      if (newConf) {
        newConf.transferNote.class = { 'mr-md-1': true };
        newConf.transport.class = { 'ml-md-1': true };
      } else {
        // In Hot Module Reloading during dev, the dynamic Vuex module does not get loaded and errors are printed in console.
        // This is because during HMR, the Invoice component gets loaded before old one can be destroyed, causing an error (https://github.com/vuejs/vue/issues/6518)
        // Adding a empty config as a short term fix for that
        newConf = {
          inv: {
            class: {},
          },
          bill: {},
          transport: {
            class: {},
          },
        };
      }

      return newConf;
    },
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    ...mapState(['yearStart', 'yearEnd', 'orgCode']),
  },
  methods: {
    onComponentDataUpdate(payload) {
      switch (payload.name) {
      case 'transfer-note-details':
        Object.assign(this.form.transferNote, payload.data);
        this.isInvDateValid = payload.options.isDateValid;
        this.godownFrom = payload.options.godownFrom;
        this.godownTo = payload.options.godownTo;
        this.isLocationValid = payload.options.isLocationValid;
        break;
      }
    },
    collectComponentData() {
      Object.assign(this.form.transferNote, this.$refs.transferNote.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.transport, this.$refs.transport.form);
    },
    updateComponentData() {
      this.$refs.transferNote.form.godownFrom = null;
      this.$refs.transferNote.form.godownTo = null;
      Object.assign(this.form.transferNote, this.$refs.transferNote.form);
      this.updateCounter.transferNote++;
      this.updateCounter.transport++;
      this.updateCounter.bill++;
    },
    confirmOnSubmit() {
      const self = this;
      let text = `Create Transfer (${this.form.transferNote.no}) from Godown <b>${this.godownFrom}</b> to <b>${this.godownTo}</b>?`;
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
          centered: true,
        })
        .then((val) => {
          if (val) {
            self.onSubmit();
          }
        });
    },
    onSubmit() {
      const self = this;
      this.isLoading = true;

      const payload = this.initPayload();
      axios
        .post('/transfernote', payload)
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
            case 0:
              {
                // success
                this.displayToast(
                  this.$gettext(`Create Transfer Note Successfull!`),
                  `Transfer Note #${self.form.transferNote.no} was successfully created`,
                  'success'
                );

                let log = {
                  activity: `transfer note created: ${self.form.transferNote.no}`,
                };
                axios.post('/log', log);
                this.resetForm();
                this.showPrintModal = true;
                this.tnoteId = resp.data.gkresult;
              }
              break;
            case 1:
              // Duplicate entry
              this.displayToast(
                this.$gettext(`Create Transfer Note Failed!`),
                this.$gettext('Duplicate Entry, Check No.'),
                'warning'
              );
              break;
            case 2:
              // Unauthorized access
              this.displayToast(
                this.$gettext(`Create Transfer Note Failed!`),
                this.$gettext('Unauthorized Access, Contact Admin'),
                'warning'
              );
              break;
            case 3:
              // Connection failed, Check inputs and try again
              this.displayToast(
                this.$gettext(`Create Transfer Note Failed!`),
                this.$gettext('Please check your input and try again later'),
                'danger'
              );
            }
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(
            this.$gettext(`Create Transfer Note Error!`),
            error.message,
            'warning'
          );
        });
    },
    initPayload() {
      this.collectComponentData();

      const tnote = this.form.transferNote;
      const transport = this.form.transport;
      let transferdata = {
        transfernoteno: tnote.no,
        transfernotedate: tnote.date,
        togodown: tnote.godownTo,
        fromgodown: tnote.godownFrom,
        transportationmode: transport.mode,
        issuername: tnote.issuer,
        designation: tnote.designation,
      };
      let stockdata = {};

      if (this.form.transport.packageCount) {
        transferdata['nopkt'] = this.form.transport.packageCount;
      }

      if (this.form.transport.date) {
        transferdata['duedate'] = this.form.transport.date;
      }
      if (this.form.transport.gracePeriod) {
        transferdata['grace'] = this.form.transport.gracePeriod;
      }

      let products = {};
      this.form.bill.forEach((prod) => {
        products[prod.product.id] = prod.qty;
      });
      stockdata = { items: products };

      return { transferdata, stockdata };
    },
    resetForm() {
      this.showPrintModal = false;
      this.form = {
        transferNote: {
          godownFrom: -1,
        },
        bill: [
          {
            product: { name: '' },
          },
        ],
        transport: {
          mode: 'Road',
          vno: null,
          date: null,
          reverseCharge: false,
          packageCount: 0,
          receiptDate: null,
          gracePeriod: 0,
        },
      };
      this.updateComponentData();
    },
    initForm() {},
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
    this.vuexNameSpace = 'transferNoteConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, TransferNoteConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initTransferNoteConfig`, {
      orgCode: this.orgCode,
    });
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future

    this.initForm();
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>
