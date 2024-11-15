<template>
  <div
    class="card mx-2 align-form-label-right"
    :style="{minWidth: '300px'}"
  >
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div class="card-header text-left py-2">
      <b v-translate>Billwise Acccounting</b>
    </div>
    <div class="card-body pb-2 px-0 px-md-1">
      <b-form
        class="text-left px-2"
        @submit.prevent="confirmOnSubmit"
      >
        <b-row no-gutters>
          <b-col>
            <b-form-radio-group
              v-model="csflag"
              button-variant="outline-secondary"
              size="sm"
              buttons
              @input="custid = ''"
              class="d-inline-block float-left mb-2"
            >
              <b-form-radio value="3">
                <translate> Customer </translate>
              </b-form-radio>
              <b-form-radio value="19">
                <translate> Supplier </translate>
              </b-form-radio>
            </b-form-radio-group>
            <b-form-group class="d-inline-block mb-2 ml-sm-2">
              <v-select
                v-model="custid"
                :options="currentPartyOptions"
                @input="fetchUnadjustedItems"
                required
                label="custname"
                :reduce="(cust) => cust.custid"
                style="min-width: 200px"
                :placeholder="isSupplier ? 'Choose Supplier' : 'Choose Customer'"
              />
            </b-form-group>
          </b-col>
          <b-col
            cols="12"
            md="5"
          >
            <b-form-group
              label="Vouchers"
              label-for="input-9"
              label-cols="3"
              label-size="sm"
            >
              <template #label>
                <translate> Vouchers </translate>
              </template>
              <v-select
                v-model="vcode"
                :options="options.vouchers"
                required
                placeholder="Choose a Voucher"
                label="text"
                :reduce="(vdata) => vdata.value"
              />
            </b-form-group>
          </b-col>
          <b-col
            cols="12"
            v-if="custid !== null"
          >
            <div v-if="options.invoices.length">
              <b-table
                caption="Uncleared Invoices"
                caption-top
                bordered
                small
                head-variant="dark"
                :fields="options.invFields"
                :items="options.invoices"
                responsive="sm"
                table-class="text-center"
              >
                <template #cell(invoiceno)="data">
                  <b-link
                    :to="{
                      name: 'Workflow',
                      params: {wfName: 'Transactions-Invoice'},
                      wfId: data.item.invid,
                    }"
                  >
                    {{ data.value }}
                  </b-link>
                </template>
                <template #cell(balanceamount)="data">
                  <small
                    class="text-secondary"
                    v-if="data.item.adjusted"
                  >( {{ data.value }} - {{ data.item.adjusted }} = )</small>
                  {{ parseFloat(data.value - data.item.adjusted).toFixed(2) }}
                </template>

                <!-- Adjusted -->
                <template #cell(adjusted)="data">
                  <b-input
                    v-model="data.item.adjusted"
                    class="hide-spin-button text-right"
                    type="number"
                    no-wheel
                    step="0.01"
                    min="0"
                    :max="data.item.balanceamount"
                    size="sm"
                  />
                </template>
                <template #custom-foot>
                  <b-tr class="text-right">
                    <b-th colspan="3">
                      <translate> Total Adjusted </translate>
                    </b-th>
                    <b-th>₹ {{ totalAdjusted }}</b-th>
                  </b-tr>
                </template>
              </b-table>
              <span
                class="text-danger"
                v-if="!isTotalValid && vcode"
              >
                <span v-if="totalAdjusted > 0">
                  <translate
                    :translate-params="{
                      totalAdjusted: totalAdjusted,
                      voucherAmount: options.voucherPriceMap[vcode],
                    }"
                  >
                    * Total amount (₹ %{totalAdjusted}) must not exceed the
                    voucher amount (₹ %{voucherAmount})
                  </translate>
                </span>
                <span v-else>
                  <translate
                    :translate-params="{totalAdjusted: totalAdjusted}"
                  >
                    * Total amount (₹ %{totalAdjusted}) must greater than 0
                  </translate>
                </span>
              </span>
            </div>
            <b
              v-else
              v-translate
            >No Outstanding Invoices To Be Adjusted! </b>
          </b-col>
        </b-row>
        <hr class="my-2 mx-0">
        <div>
          <b-button
            size="sm"
            class="m-1"
            variant="warning"
            @click="showVoucherForm = !showVoucherForm"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle mr-1"
              icon="plus-square"
            />
            <translate>Add Voucher</translate>
          </b-button>
          <div class="float-right">
            <b-button
              size="sm"
              class="m-1"
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
              size="sm"
              type="submit"
              class="m-1"
              variant="success"
              :disabled="!isTotalValid"
            >
              <b-spinner
                v-if="isLoading"
                small
              />
              <b-icon
                v-else
                aria-hidden="true"
                class="align-middle mr-1"
                icon="check-square"
              />
              <span
                class="align-middle"
                v-translate
              >Adjust</span>
            </b-button>
          </div>
        </div>
      </b-form>
      <b-modal
        size="lg"
        v-model="showVoucherForm"
        centered
        static
        body-class="p-0"
        id="contact-item-modal"
        hide-footer
        hide-header
      >
        <voucher
          :hide-back-button="true"
          :in-overlay="true"
          :on-save="onVoucherSave"
          :type="csflag === '19' ? 'payment' : 'receipt'"
          :customer="custname"
          :is-open="showVoucherForm"
          mode="create"
        >
          <template #close-button>
            <b-button
              size="sm"
              class="float-right py-0"
              @click.prevent="
                () => {
                  showVoucherForm = false;
                }
              "
            >
              x
            </b-button>
          </template>
        </voucher>
      </b-modal>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import Voucher from '../components/form/Voucher.vue';

export default {
  name: 'Billwise',
  components: {
    Voucher,
  },
  props: {
    custType: {
      type: [String, Number],
      validator: function(value) {
        return value == 3 || value == 19;
      },
      required: true,
    },
    custName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      isPreloading: false,
      showVoucherForm: false,
      options: {
        partyIdToName: {},
        customers: [],
        suppliers: [],
        vouchers: [],
        invoices: [],
        voucherPriceMap: {},
        invFields: [
          {
            key: 'invoiceno',
            label: 'No',
          },
          {
            key: 'invoiceamount',
            label: 'Amount',
          },
          {
            key: 'balanceamount',
            label: 'Pending',
          },
          'adjusted',
        ],
      },
      custid: null,
      csflag: '3',
      vcode: null,

      form: {},
    };
  },
  computed: {
    isSupplier: (self) => self.csflag === '19',
    currentPartyOptions: (self) =>
      self.csflag === '19' ? self.options.suppliers : self.options.customers,
    totalAdjusted: (self) => {
      let total = 0;
      if (self.options.invoices !== null) {
        total = self.options.invoices.reduce(
          (sum, inv) =>
            (parseFloat(sum) || 0) + (parseFloat(inv.adjusted) || 0),
          0
        );
        total = parseFloat(total.toFixed(2));
      }

      return total;
    },
    isTotalValid: (self) => {
      return (
        self.totalAdjusted > 0 &&
        self.totalAdjusted <= self.options.voucherPriceMap[self.vcode]
      );
    },
    custname: (self) => self.options.partyIdToName[self.custid] || null,
    ...mapState([]),
  },
  watch: {
    custid(newCustId) {
      if(newCustId === '' || newCustId === null || newCustId === undefined) {
        this.options.invoices = [];
        this.options.vouchers = [];
      }
    }
  },
  methods: {
    /**After creating a new voucher, refetch the List of vouchers and select the new Voucher  */
    onVoucherSave({ vouchercode }) {
      if (vouchercode) {
        this.fetchUnadjustedItems().then(() => {
          this.vcode = vouchercode;
        });
      }
      this.showVoucherForm = false;
    },
    confirmOnSubmit() {
      let invCount = this.options.invoices.reduce(
        (sum, inv) => sum + !!parseInt(inv.adjusted),
        0
      );
      let text = this.$createElement('div', {
        domProps: {
          innerHTML: `Adjust <b>₹ ${
            this.totalAdjusted
          } </b> against <b>${invCount}</b> ${
            invCount > 1 ? 'Invoices' : 'Invoice'
          } for ${this.isSupplier ? 'Supplier' : 'Customer'} ${this.custname}?`,
        },
      });
      this.$bvModal
        .msgBoxConfirm(text, {
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          centered: true,
        })
        .then((val) => {
          if (val) {
            this.onSubmit();
          }
        });
    },
    onSubmit() {
      this.isLoading = true;
      const payload = this.initPayload();
      axios
        .post('/billwise', payload)
        .then((response) => {
          this.isLoading = false;
          switch (response.data.gkstatus) {
          case 0:
            this.displayToast(
              this.$gettext('Bill Adjustment Success!'),
              this.$gettext('Selected Bills were successfully adjusted'),
              'success'
            );

            this.fetchUnadjustedItems();

            break;
          case 2:
            this.displayToast(
              this.$gettext('Bill Adjustment Error!'),
              this.$gettext('Unauthorized access, Please contact admin'),
              'warning'
            );
            break;
          default:
            this.displayToast(
              this.$gettext('Bill Adjustment Error!'),
              this.$gettext(
                'Unable to adjust the chosen bills, Please try again later. Contact admin if problem persists.'
              ),
              'danger'
            );
          } // end switch
        })
        .catch((error) => {
          this.displayToast(
            this.$gettext('Bill Adjustment Error!'),
            error.message,
            'warning'
          );
          this.isLoading = false;
        });
    },
    /**Format the data before submitting it */
    initPayload() {
      const payload = {
        adjbills: [],
      };

      this.options.invoices.forEach((inv) => {
        inv.adjusted = parseFloat(inv.adjusted);
        inv.balanceamount = parseFloat(inv.balanceamount);
        if (inv.adjusted > 0) {
          if (inv.adjusted > inv.balanceamount) {
            inv.adjusted = inv.balanceamount;
          }
          payload.adjbills.push({
            vouchercode: this.vcode,
            adjamount: inv.adjusted,
            invid: inv.invid,
          });
        }
      });

      return payload;
    },
    /**Fetch Invoices that are still in credit for a given Customer/Supplier and
     * the list of vouchers that can adjust them */
    fetchUnadjustedItems() {
      this.options.vouchers = [];
      this.options.invoices = [];
      this.vcode = '';
      if (this.custid !== null && !isNaN(parseInt(this.custid))) {
        this.updateUrl();
        return axios
          .get(`/billwise?csid=${this.custid}&csflag=${this.csflag}`)
          .then((resp) => {
            if (resp.data.gkstatus === 0) {
              // vouchers
              resp.data.vouchers.sort((a, b) => a.vouchercode - b.vouchercode);
              this.options.vouchers = resp.data.vouchers.map((voucher) => {
                this.options.voucherPriceMap[voucher.vouchercode] =
                  voucher.amtadj;
                return {
                  text: `${voucher.vouchernumber} - ₹ ${voucher.amtadj}`,
                  value: voucher.vouchercode,
                };
              });

              // invoices on credit
              resp.data.invoices.sort((a, b) => a.invid - b.invid);
              this.options.invoices = resp.data.invoices.map((inv) =>
                Object.assign({ adjusted: 0 }, inv)
              );
            } else {
              this.displayToast(
                this.$gettext('Fetch Unadjusted Invoices and Vouchers Failed!'),
                this.$gettext('Please Try again later'),
                'warning'
              );
            }
          })
          .catch((error) => {
            this.displayToast(
              this.$gettext('Fetch Unadjusted Invoices and Vouchers Failed!'),
              error.message,
              'danger'
            );
            return error;
          });
      }
      return Promise.resolve(); // an empty promise to continue on, in case the above condition is not met
    },
    /**Pre-Load the Customer/Supplier list */
    preloadData() {
      this.isPreloading = true;
      const requests = [
        axios.get('/customer?qty=custall').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Customer List Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
        axios.get('/customer?qty=supall').catch((error) => {
          this.displayToast(
            this.$gettext('Fetch Supplier List Failed!'),
            error.message,
            'danger'
          );
          return error;
        }),
      ];

      const self = this;
      return Promise.all(requests).then(([resp1, resp2]) => {
        self.isPreloading = false;
        let preloadErrorList = ''; // To handle the unloaded data, at once than individually

        let pidToName = {};
        // === Customer List ===
        if (resp1.status === 200) {
          if (resp1.data.gkstatus === 0) {
            this.options.customers = resp1.data.gkresult;
            resp1.data.gkresult.forEach((cust) => {
              pidToName[cust.custid] = cust.custname;
            });
          } else {
            preloadErrorList += ' Customer List, ';
          }
        }

        // === Supplier List ===
        if (resp2.status === 200) {
          if (resp2.data.gkstatus === 0) {
            this.options.suppliers = resp2.data.gkresult;
            resp2.data.gkresult.forEach((cust) => {
              pidToName[cust.custid] = cust.custname;
            });
          } else {
            preloadErrorList += ' Supplier List,';
          }
        }

        this.options.partyIdToName = pidToName;

        if (preloadErrorList !== '') {
          this.displayToast(
            this.$gettext('Error: Unable to Preload Data'),
            this.$gettextInterpolate(
              this.$gettext(
                `Issues with fetching %{preloadErrorList} Please try again or Contact Admin`
              ),
              { preloadErrorList: preloadErrorList }
            ),
            'danger'
          );
        }
      });
    },
    /** Update the URL based on customer/supplier selected */
    updateUrl() {
      let url = window.location.href.split('#')[0];
      let custType = this.csflag;
      let custName = this.options.partyIdToName[this.custid] || -1;

      url += `#/billwise/${custType}/${custName}`;
      history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
      // instead of creating a new history instance every time a customer / supplier is selected
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
  mounted() {
    // translating option strings
    this.options.invFields = [
      {
        key: 'invoiceno',
        label: this.$gettext('No'),
      },
      {
        key: 'invoiceamount',
        label: this.$gettext('Amount'),
      },
      {
        key: 'balanceamount',
        label: this.$gettext('Pending'),
      },
      {
        key: 'adjusted',
        label: this.$gettext('Adjusted'),
      },
    ];

    this.csflag = this.custType;
    this.preloadData().then(() => {
      if (this.custName !== '-1') {
        let party = this.currentPartyOptions.find(
          (party) => party.custname === this.custName
        );
        this.custid = party ? party.custid : this.custid;
        this.fetchUnadjustedItems();
      }
    });
  },
};
</script>
