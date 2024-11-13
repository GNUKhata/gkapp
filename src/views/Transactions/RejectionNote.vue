<template>
  <b-container
    style="min-width: 300px"
    fluid
    class="mt-2 px-md-3 px-2 align-form-label-right"
  >
    <b-form @submit.prevent="confirmOnSubmit">
      <div class="text-center pt-2">
        <h4 v-translate>
          Create Rejection Note
        </h4>
      </div>
      <hr class="">
      <div class="mb-2">
        <b-form-radio-group
          v-model="form.type"
          button-variant="outline-secondary"
          size="sm"
          buttons
          class="mx-1"
          @input="resetForm(true)"
        >
          <b-form-radio value="sale">
            <translate> Sale Rejection </translate>
          </b-form-radio>
          <b-form-radio value="purchase">
            <translate> Purchase Rejection </translate>
          </b-form-radio>
        </b-form-radio-group>
        <span
          id="edit-invoice-list"
          class="d-inline-block mt-2 mt-sm-0"
        >
          <b-form-select
            id="input-8-2"
            v-model="invIndex"
            :options="invList"
            required
            @input="updateFormData"
            label="text"
            :reduce="(invdata) => invdata.value"
            style="min-width: 200px"
            :reset-on-options-change="true"
          >
            <template #first>
              <b-form-select-option value="null">-- Please select an invoice --</b-form-select-option>
            </template>
          </b-form-select>
        </span>
        <div class="clearfix" />
      </div>
      <b-card-group
        class="d-block d-md-flex my-2"
        deck
      >
        <!-- Rejection Note Details -->
        <rejection-note-details
          :sale-flag="isSale"
          :config="config.rnote"
          :inv-date="form.invoice.date"
          ref="rnote"
          @details-updated="onComponentDataUpdate"
          :update-counter="updateCounter.rnote"
        />
        <!-- Invoice Details -->
        <invoice-details
          :config="config.inv"
          :sale-flag="isSale"
          :parent-data="form.invoice"
          @details-updated="onComponentDataUpdate"
          :update-counter="updateCounter.invoice"
          ref="invoice"
        />
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
      </b-card-group>
      <!-- Bill Table -->
      <bill-table
        :gst-flag="isGst"
        :config="config.bill"
        @details-updated="onComponentDataUpdate"
        :update-counter="updateCounter.bill"
        :parent-data="form.bill"
        :on-row-selected="onRowSelected"
        ref="bill"
        :inv-date="form.invoice.date"
        :cgst-flag="isCgst"
        :godown-id="-1"
        :sale-flag="isSale"
        :block-empty-stock="isSale"
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
            order-lg="1"
            order="2"
          >
            <b-card-group
              class="d-block d-md-flex"
              deck
            >
              <!-- Invoice Comments -->
              <comments
                :name="`Rejection Note`"
                ref="narration"
                :config="config.comments"
                :update-counter="updateCounter.comments"
                :parent-data="form.comments"
              />
            </b-card-group>
          </b-col>
          <b-col
            cols="12"
            lg="6"
            order-lg="2"
            order="1"
          >
            <total-table
              :config="config.total"
              :gst-flag="isGst"
              :bill-data="form.bill"
              :update-counter="updateCounter.totalTable"
              ref="totalTable"
            />
          </b-col>
        </b-row>
      </div>
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
          variant=""
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
          @click.prevent="resetForm(true)"
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
          variant="danger"
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
              icon="x-circle"
            />
            <span
              v-if="isSale"
              class="align-middle"
              v-translate
            >Reject Sale</span>
            <span
              v-else
              class="align-middle"
              v-translate
            >
              Reject Purchase</span>
          </span>
        </b-button>
      </div>
      <div class="clearfix" />
    </b-form>
    <print-page
      :show="showPrintModal"
      name="RejectionNote"
      title="Rejection Note"
      :id="rnoteId"
      :pdata="{
        printTitle: {page: 'Tax RejectionNote', file: 'tax_rejectionNote'},
        useTriplicate: false,
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
import RejectionNoteDetails from '../../components/form/transaction_details/RejectionNoteDetails.vue';
import BillTable from '../../components/form/transaction/BillTable.vue';
import TotalTable from '../../components/form/transaction/TotalTable.vue';
// import TransportDetails from '../../components/form/transaction/TransportDetails.vue';
import Comments from '../../components/form/transaction/Comments.vue';
import InvoiceDetails from '../../components/form/transaction_details/InvoiceDetailsEdit.vue';

import rejectionNoteConfig from '../../js/config/transaction/rejectionNote.js';
import PrintPage from '../../components/workflow/PrintPage.vue';

import { reverseDate } from '../../js/utils';

export default {
  name: 'RejectionNote',
  components: {
    // Config,

    PartyDetails,
    RejectionNoteDetails,
    BillTable,
    TotalTable,
    // TransportDetails,
    Comments,
    InvoiceDetails,
    PrintPage,
  },
  data() {
    return {
      showPrintModal: false,
      rnoteId: 0,
      vuexNameSpace: '',
      isLoading: false,
      isInvDateValid: false,
      updateCounter: {
        invoice: 0,
        party: 0,
        rnote: 0,
        bill: 0,
        totalTable: 0,
        comments: 0,
      },
      saleInvIndex: null,
      purchaseInvIndex: null,
      form: {
        type: 'sale',
        rnote: {},
        invoice: {
          date: '',
          state: { id: '' },
          taxState: { id: '' },
        },
        party: { state: { id: '' } },
        taxType: 'gst', // vat
        bill: [],
        narration: null,
        total: {},
      },
      options: {
        invData: {
          sale: [],
          purchase: [],
        },
        invoices: {
          sale: [],
          purchase: [],
        },
      },
    };
  },
  computed: {
    invIndex: {
      set: function(newValue) {
        if (this.isSale) {
          this.saleInvIndex = newValue;
        } else {
          this.purchaseInvIndex = newValue;
        }
      },
      get: function() {
        return this.isSale ? this.saleInvIndex : this.purchaseInvIndex;
      },
    },
    invSelected: (self) =>
      self.isSale
        ? self.options.invData.sale[self.invIndex]
        : self.options.invData.purchase[self.invIndex],
    invList: (self) =>
      self.isSale ? self.options.invoices.sale : self.options.invoices.purchase,
    config: (self) => {
      let newConf =
        self.$store.getters[
          `${self.vuexNameSpace}/getCustomRejectionNoteConfig`
        ];
      if (newConf) {
        newConf.bill.footer.headingColspan =
          !!newConf.bill.index +
          !!newConf.bill.product +
          !!newConf.bill.hsn +
          !!newConf.bill.qty +
          !!newConf.bill.rejectedQty +
          !!newConf.bill.rate || 1;

        if (newConf.inv.class) {
          newConf.inv.class = {
            'mr-md-1': !!newConf.party,
            'ml-md-1': !!newConf.rnote,
          };
        }
        // if (newConf.ship.class) {
        //   newConf.ship.class = {
        //     'ml-md-1': !!(newConf.inv || newConf.party),
        //   };
        // }
        if (newConf.party.class) {
          newConf.party.class = {
            'ml-md-1': !!(newConf.inv || newConf.rnote),
          };
        }

        if (newConf.rnote.class) {
          newConf.rnote.class = {
            'mr-md-1': !!(newConf.inv || newConf.party),
          };
        }

        // if (newConf.comments.class) {
        //   newConf.comments.class = {
        //     'ml-md-1': !!(newConf.transport || newConf.payment),
        //   };
        // }
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
          taxType: true,
          bill: {
            footer: {
              headingColspan: 1,
            },
          },
          comments: {
            class: {},
          },
          total: {},
        };
      }

      return newConf;
    },
    party: (self) =>
      self.form.party.type === 'customer' ? 'Customer' : 'Supplier',
    isSale: (self) => self.form.type === 'sale',
    isCgst: (self) => {
      if (
        self.form.invoice.state &&
        (self.form.invoice.taxState || self.form.party.state)
      ) {
        if (self.form.invoice.taxState) {
          if (
            parseInt(self.form.invoice.state.id) ===
            parseInt(self.form.invoice.taxState.id)
          ) {
            return true;
          }
        } else if (
          parseInt(self.form.invoice.state.id) ===
          parseInt(self.form.party.state.id)
        ) {
          return true;
        }
      }
      return false;
    },
    isGst: (self) => self.form.taxType === 'gst',
    showErrorToolTip: (self) =>
      self.isInvDateValid === null ? false : !self.isInvDateValid,
    ...mapState(['yearStart', 'yearEnd', 'invoiceParty', 'orgCode']),
  },
  methods: {
    onComponentDataUpdate(payload) {
      switch (payload.name) {
      case 'rejection-note-details':
        Object.assign(this.form.rnote, payload.data);
        this.isInvDateValid = payload.options.isDateValid;
        break;
      case 'party-details':
        Object.assign(this.form.party, payload.data);
        this.updateCounter.ship++;
        break;
      case 'bill-table':
        Object.assign(this.form.bill, payload.data);
        this.updateCounter.totalTable++;
        break;
      }
    },
    collectComponentData() {
      this.updateCounter.totalTable++;
      Object.assign(this.form.invoice, this.$refs.invoice.form);
      Object.assign(this.form.rnote, this.$refs.rnote.form);
      Object.assign(this.form.party, this.$refs.party.form);
      Object.assign(this.form.bill, this.$refs.bill.form);
      Object.assign(this.form.total, this.$refs.totalTable.form);
      this.form.narration = this.$refs.narration.form.narration;
    },
    updateComponentData(updateNoteDetails) {
      this.updateCounter.invoice++;
      this.updateCounter.party++;
      if (updateNoteDetails) {
        this.updateCounter.rnote++;
      }
      this.updateCounter.bill++;
      this.updateCounter.totalTable++;
      this.updateCounter.comments++;
    },
    initPayload() {
      this.collectComponentData();

      let rndata = {
        rnno: this.form.rnote.no,
        rndate: this.form.rnote.date,
        inout: this.isSale ? 9 : 15,
        rejprods: {},
        rejectedtotal: this.form.total.amount,
        invid: this.invSelected.invid,
      };

      let stock = {
        inout: this.isSale ? 9 : 15, // for rejection note 9 is used for IN and 15 for OUT
        items: {},
        goid: this.form.invoice.godown
      };

      let products = {};

      this.form.bill.forEach((item) => {
        products[item.pid] = {};
        products[item.pid][item.rate] = item.rejectedQty || 0;
      });

      rndata.rejprods = stock.items = products;

      if (this.form.narration) {
        rndata.rejnarration = this.form.narration;
      }

      return {
        rejectionnotedata: rndata,
        stockdata: stock,
      };
    },
    confirmOnSubmit() {
      Object.assign(this.form.invoice, this.$refs.invoice.form);
      Object.assign(this.form.rnote, this.$refs.rnote.form);
      const self = this;
      let text = `Create Rejection Note (${this.form.rnote.no}) for ${
        this.isSale ? 'Sale' : 'Purchase'
      } Invoice (${this.form.invoice.no})?`;
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
      const self = this;
      this.isLoading = true;
      const payload = this.initPayload();
      axios
        .post('/rejectionnote', payload)
        .then((resp) => {
          self.isLoading = false;
          if (resp.status === 200) {
            switch (resp.data.gkstatus) {
            case 0:
              {
                // success
                this.displayToast(
                  this.$gettext(`Create Rejection Note Successfull!`),
                  `Rejection Note #${self.form.rnote.no} was successfully created`,
                  'success'
                );

                let log = {
                  activity: `rejection note created: ${self.form.rnote.no}`,
                };
                axios.post('/log', log);
                this.resetForm(true);
                this.showPrintModal = true;
                this.rnoteId = resp.data.gkresult;
              }
              break;
            case 1:
              // Duplicate entry
              this.displayToast(
                this.$gettext(`Create Rejection Note Failed!`),
                this.$gettext('Duplicate Entry, Check No.'),
                'warning'
              );
              break;
            case 2:
              // Unauthorized access
              this.displayToast(
                this.$gettext(`Create Rejection Note Failed!`),
                this.$gettext('Unauthorized Access, Contact Admin'),
                'warning'
              );
              break;
            case 3:
              // Connection failed, Check inputs and try again
              this.displayToast(
                this.$gettext(`Create Rejection Note Failed!`),
                this.$gettext('Please check your input and try again later'),
                'danger'
              );
            }
          }
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(
            this.$gettext(`Create Rejection Note Error!`),
            error.message,
            'warning'
          );
        });
    },
    preloadData() {
      const requests = [
        axios
          .get('/invoice/nonrejected', {
            data: { inputdate: this.yearEnd },
          })
          .catch((error) => {
            this.displayToast(
              this.$gettext('Fetch Non Rejected Invoice List Failed!'),
              error.message,
              'danger'
            );
            return error;
          }),
      ];
      const self = this;
      return Promise.all(requests).then(([resp1]) => {
        if (resp1.data.gkstatus === 0) {
          let saleData = [],
              purchaseData = [],
              sale = [],
              purchase = [];
          resp1.data.gkresult.forEach((inv) => {
            if (inv.inoutflag === 15) {
              saleData.push(inv);
              sale.push({
                text: `${inv.invoiceno},${inv.invoicedate},${inv.custsupdetail.custname}`,
                value: saleData.length - 1,
              });
            } else {
              purchaseData.push(inv);
              purchase.push({
                text: `${inv.invoiceno},${inv.invoicedate},${inv.custsupdetail.custname}`,
                value: purchaseData.length - 1,
              });
            }
          });
          self.options.invData = {
            sale: saleData,
            purchase: purchaseData,
          };
          self.options.invoices = {
            sale,
            purchase,
          };
        }
      });
    },
    /**
     * updateBillTable()
     *
     * Given an invoice id, updates the products in the bill table
     */
    updateBillTable(invoiceId, prodCount) {
      let self = this;
      axios
        .get(`/invoice/${invoiceId}`)
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let data = resp.data.gkresult;
            self.form.party.type =
              data.custSupDetails.csflag === 3 ? 'customer' : 'supplier';
            self.form.taxType = data.taxflag === 7 ? 'gst' : 'vat';
            self.form.invoice.state =
              data.inoutflag === 9
                ? { id: data.taxstatecode, name: data.destinationstate }
                : { id: data.sourcestatecode, name: data.sourcestate };
            self.form.invoice.taxState =
              data.inoutflag === 9
                ? { id: data.sourcestatecode, name: data.sourcestate }
                : { id: data.taxstatecode, name: data.destinationstate };

            let item, itemName, billItem;
            self.form.bill = [];
            for (const itemCode in data.invcontents) {
              let qty = prodCount[itemCode];
              if (!qty) {
                continue;
              }
              item = data.invcontents[itemCode];
              itemName = data.invcontents[itemCode].proddesc;
              billItem = {
                product: { name: itemName, id: itemCode },
                discount: { amount: parseFloat(item.discount) },
                qty: parseFloat(qty),
                fqty: item.freeqty,
                rate: parseFloat(item.priceperunit),
                isService: item.gsflag === 19,
                igst: { rate: 0 },
                cgst: { rate: 0 },
                sgst: { rate: 0 },
                cess: { rate: 0 },
                vat: { rate: 0 },
              };
              if (billItem.isService) {
                billItem.qty = 1;
              }
              self.form.bill.push(billItem);
            }

            self.updateCounter.bill++;
            self.updateCounter.invoice++;
          }
        })
        .catch(() => {
          return false;
        });
    },
    /**
     * updateFormData()
     *
     * Update the form's data based on the invoice selected
     */
    updateFormData() {
      if (!this.invIndex && this.invIndex !== 0) {
        return;
      }
      const inv = this.invSelected;
      Object.assign(this.form.invoice, {
        no: inv.invoiceno,
        date: reverseDate(inv.invoicedate),
      });
      Object.assign(this.form.party, {
        name: inv.custsupdetail.custname,
        type: inv.custsupdetail.csflag === 3 ? 'customer' : 'supplier',
      });
      this.updateComponentData(true);
      this.updateBillTable(inv.invid, inv.rejcontent);
    },
    /**
     * onRowSelected
     *
     * When a row is selected, that rejected quantity for that product is made equal
     * to qty available
     */
    onRowSelected(index, billArr) {
      if (billArr[index].rowSelected) {
        billArr[index].rejectedQty = billArr[index].qty;
      } else {
        billArr[index].rejectedQty = 0;
      }
    },
    resetForm(resetNoteDetails) {
      this.showPrintModal = false;
      this.saleInvIndex = null;
      this.purchaseInvIndex = null,
      Object.assign(this.form, {
        rnote: {
          no: '',
          date: '',
        },
        invoice: {
          no: null,
          date: '',
          addr: null,
          gstin: null,
          state: {},
        },
        party: {
          name: null,
        },
        bill: [],
        narration: null,
        total: {},
      });
      this.updateComponentData(resetNoteDetails);
      // this.invIndex = 0;
    },
    initForm() {
      this.preloadData();
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
    this.vuexNameSpace = 'rejectionNoteConfig_' + Date.now();
    // Dynamically load the config to Vuex, just before the Invoice component is mounted
    this.$store.registerModule(this.vuexNameSpace, rejectionNoteConfig);
    this.$store.dispatch(`${this.vuexNameSpace}/initRejectionNoteConfig`, {
      orgCode: this.orgCode,
    });
  },
  mounted() {
    // Using non props to store these props, as these can be edited in the future

    this.initForm();
    this.resetForm(false);
  },
  beforeDestroy() {
    // Remove the config from Vuex when exiting the Invoice page
    // prevent webpack HRM to destroy our store. But if you are production, please go away~
    this.$store.unregisterModule(this.vuexNameSpace);
  },
};
</script>
