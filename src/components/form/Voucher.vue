<template>
  <div class="card">
    <div class="card-header py-1 px-2">
      <!-- === Voucher Type Dropdown -->
      <b-dropdown
        size="sm"
        variant="outline-dark"
        :disabled="!isCreateMode"
      >
        <template #button-content>
          <b> {{ form.vtype.text }} Voucher </b>
        </template>
        <b-dropdown-item
          v-for="(type, index) in options.vtype"
          :key="index"
          @click.prevent="
            () => {
              form.vtype = type;
              preloadData();
            }
          "
        >
          {{ type.text }}
        </b-dropdown-item>
      </b-dropdown>
      <slot name="close-button" />
    </div>
    <div>
      <b-form
        class="p-2 pt-3"
        @submit.prevent="confirmOnSubmit"
      >
        <b-row no-gutters>
          <b-col
            cols="12"
            sm="6"
          >
            <div v-if="isReceiptOrPayment && !inOverlay">
              <v-select
                class="my-1"
                id="v-input-11"
                :options="creditInv"
                v-model="form.inv"
                placeholder="Select an Invoice"
                :required="true"
                :reduce="(inv) => inv.id"
                @input="onInvSelect"
                style="max-width: 250px"
              />
              <p v-if="form.inv">
                Total Invoice Amount: {{ creditInvData.invoicetotal }}<br>
                Invoice Balance Amount: {{ creditInvData.balanceamount }}
              </p>
            </div>
            <div>
              <b-checkbox
                v-if="isJournal"
                v-model="allFlag"
                @change="preloadData"
              >
                Use All Accounts
              </b-checkbox>
            </div>
          </b-col>
          <b-col
            sm="6"
            class="mb-2"
          >
            <gk-date
              class="float-left float-sm-right my-1"
              id="v-date-1"
              :format="dateFormat"
              v-model="form.date"
              :min="_minDate"
              :max="_maxDate"
              @validity="setDateValidity"
              :required="true"
            />
          </b-col>
          <b-col cols="12">
            <b-table-simple
              hover
              small
              caption-top
              bordered
            >
              <b-thead head-variant="dark">
                <!-- table header -->
                <b-tr class="text-center">
                  <b-th :style="{maxWidth: '25px', width: '25px'}">
                    -
                  </b-th>
                  <b-th
                    :style="{
                      maxWidth: '300px',
                      width: '150px',
                      minWidth: '90px',
                    }"
                  >
                    <translate> Account </translate>
                    <b-button
                      class="ml-2 py-0 px-1"
                      variant="success"
                      size="sm"
                      @click.prevent="onCreateAccount(1,2)"
                    >
                      +
                    </b-button>
                  </b-th>
                  <b-th
                    :style="{
                      maxWidth: '200px',
                      width: '150px',
                      minWidth: '70px',
                    }"
                  >
                    <translate> Balance </translate>
                  </b-th>
                  <b-th
                    :style="{
                      maxWidth: '200px',
                      width: '110px',
                      minWidth: '75px',
                    }"
                  >
                    <b-button
                      @click.prevent="addRow('dr')"
                      class="py-0"
                      variant="success"
                      size="sm"
                    >
                      +
                    </b-button>
                    Dr
                  </b-th>
                  <b-th
                    :style="{
                      maxWidth: '200px',
                      width: '110px',
                      minWidth: '75px',
                    }"
                  >
                    <b-button
                      @click.prevent="addRow('cr')"
                      class="py-0"
                      variant="success"
                      size="sm"
                    >
                      +
                    </b-button>
                    Cr
                  </b-th>
                </b-tr>
              </b-thead>
              <b-tbody>
                <!-- Debit Row -->
                <b-tr
                  class="text-center"
                  v-for="(data, indexDr) in form.dr"
                  :key="indexDr + '-dr'"
                  variant="success"
                >
                  <!-- Type  -->
                  <b-td class="text-capitalize align-middle">
                    <b-button
                      @click.prevent="deleteRow('dr', indexDr)"
                      class="py-0 px-1"
                      variant="success"
                      size="sm"
                    >
                      -
                    </b-button>
                  </b-td>

                  <!-- Account -->
                  <b-td>
                    <v-select
                      :options="options['dr']"
                      v-model="form.dr[indexDr].account"
                      label="accountname"
                      required
                      @input="onAccountSelect(data.account, 'dr', indexDr)"
                      class="text-left"
                      :reset-on-options-change="true"
                    />
                  </b-td>

                  <!-- Balance -->
                  <b-td
                    class="position-relative"
                    :style="{'font-size': '0.85rem'}"
                  >
                    <b-overlay
                      :show="data.isLoading"
                      variant="secondary"
                      no-wrap
                      blur
                    />
                    <b>{{ data.balance }}</b>
                  </b-td>

                  <!-- Dr Amount -->
                  <b-td>
                    <b-input
                      v-model="data.amount"
                      class="hide-spin-button text-right px-1"
                      type="number"
                      no-wheel
                      step="0.01"
                      min="0.01"
                      debounce="500"
                      required
                      size="sm"
                    />
                  </b-td>

                  <!-- Cr Amount -->
                  <b-td />
                </b-tr>
                <!-- Credit Row -->
                <b-tr
                  class="text-center"
                  v-for="(data, indexCr) in form.cr"
                  :key="indexCr + '-cr'"
                  variant="warning"
                >
                  <!-- Type  -->
                  <b-td class="text-capitalize align-middle">
                    <b-button
                      @click.prevent="deleteRow('cr', indexCr)"
                      class="py-0 px-1"
                      variant="success"
                      size="sm"
                    >
                      -
                    </b-button>
                  </b-td>

                  <!-- Account -->
                  <b-td>
                    <v-select
                      class="text-left"
                      v-model="form.cr[indexCr].account"
                      :options="options['cr']"
                      label="accountname"
                      required
                      @input="onAccountSelect(data.account, 'cr', indexCr)"
                      :reset-on-options-change="true"
                    />
                  </b-td>

                  <!-- Balance -->
                  <b-td
                    class="position-relative"
                    :style="{'font-size': '0.85rem'}"
                  >
                    <b-overlay
                      :show="data.isLoading"
                      variant="secondary"
                      no-wrap
                      blur
                    />
                    <b>{{ data.balance }}</b>
                  </b-td>

                  <!-- Dr Amount -->
                  <b-td />

                  <!-- Cr Amount -->
                  <b-td>
                    <b-input
                      v-model="data.amount"
                      class="hide-spin-button text-right px-1"
                      type="number"
                      no-wheel
                      step="0.01"
                      min="0.01"
                      debounce="500"
                      required
                      size="sm"
                    />
                  </b-td>
                </b-tr>
              </b-tbody>
              <b-tfoot>
                <b-tr
                  variant="secondary"
                  class="text-right"
                >
                  <b-th colspan="3">
                    <translate> Total </translate>
                  </b-th>
                  <b-th>
                    <span>₹ {{ totalDr }}</span>
                  </b-th>
                  <b-th>
                    <span>₹ {{ totalCr }}</span>
                  </b-th>
                </b-tr>
              </b-tfoot>
            </b-table-simple>
          </b-col>
          <b-col
            cols="12"
            sm="6"
          />
          <b-col
            cols="12"
            sm="6"
          >
            <b-form-group
              label="Comments"
              label-for="vo-comment"
              label-cols="auto"
              label-size="sm"
              label-cols-lg="autauto"
            >
              <b-form-textarea
                size="sm"
                id="vo-comment"
                v-model="form.narration"
                rows="4"
                max-rows="5"
                trim
              />
            </b-form-group>
          </b-col>
        </b-row>

        <hr class="my-2 mx-0">
        <div class="float-right">
          <b-button
            size="sm"
            class="mr-1"
            variant="secondary"
            @click.prevent="$router.go(-1)"
            v-if="!hideBackButton"
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
            class="mx-1"
            variant="secondary"
            @click.prevent="_resetForm(true)"
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
            size="sm"
            class="mx-1"
            variant="danger"
            @click.prevent="confirmOnDelete"
            v-if="!isCreateMode"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle mr-1"
              icon="trash"
            />
            <span
              class="align-middle"
              v-translate
            >Delete</span>
          </b-button>
          <b-button
            size="sm"
            type="submit"
            class="ml-1"
            variant="success"
            :disabled="!isDateValid || !isVoucherTotalValid"
          >
            <b-spinner
              v-if="isLoading"
              small
            />
            <b-icon
              v-else
              aria-hidden="true"
              class="align-middle mr-1"
              :icon="isCreateMode ? 'plus-square' : 'cloud-arrow-up'"
            />
            <span
              class="align-middle"
              v-if="isCreateMode"
              v-translate
            >
              Save
            </span>
            <span
              v-else
              class="align-middle"
              v-translate
            >Update</span>
          </b-button>
        </div>
        <div class="clearfix" />
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { numberToRupees } from '../../js/utils';
import GkDate from '../GkDate.vue';
import voucherMixin from '@/mixins/voucher.js';

export default {
  name: 'Voucher',
  components: { GkDate },
  mixins: [voucherMixin],
  props: {
    customer: {
      type: String,
      required: false,
      default: '-1',
    },
    hideBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
    isOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
    mode: {
      type: String,
      required: true,
      validator: (mode) => {
        let values = ['create', 'edit'];
        return values.indexOf(mode) >= 0;
      },
    },
    vid: {
      type: [Number, String],
      required: false,
      default: -1,
      note: 'Used while in edit mode to fetch the voucher details',
    },
  },
  data() {
    return {};
  },
  computed: {
    isCreateMode: (self) => self.mode === 'create',
  },
  watch: {
    customer(name) {
      if (name) this.customerName = name;
    },
    isOpen(val) {
      if (this.inOverlay) {
        if (val) {
          this.updateAccounts();
        }
      }
    },
    vid(id) {
      this.fetchVoucherDetails(id);
    },
  },
  methods: {
    updateCreditInvoiceBalance() {
      axios.get(`/billwise?type=all`).then((resp) => {
        this.options.creditInv.sale = []
        this.options.creditInv.purchase = []
        resp?.data.invoices.forEach((item) => {
          let option = {
            id: item.invid,
            label: `${item.invoiceno}, ${item.custname}, ${item.invoicedate}`,
          };
          if (item.inoutflag === 15) {
            this.options.creditInv.sale.push(option);
          } else {
            this.options.creditInv.purchase.push(option);
          }
          this.options.creditInv.map[item.invid] = item;
        });
      });
    },
    onCreateAccount(gid, sgid) {
      this.updateUrl();
      this.$router.push({
        name: 'Create_Account',
        params: { group: gid, subGroup: sgid },
      });
    },
    updateUrl() {
      let url = window.location.href.split('#')[0];
      url+="#/voucher/create/receipt/-1";
      history.replaceState(null, '', url); // replace state method allows us to update the last history instance inplace,
      // instead of creating a new history instances for every entity selected
    },
    confirmOnDelete() {
      const self = this;
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Delete ${this.form.vtype.text} Voucher <b>${this.form.vno}</b>?"`,
        },
      });
      this.$bvModal
        .msgBoxConfirm(text, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          centered: true,
        })
        .then((val) => {
          if (val) {
            axios
              .delete('/transaction', {
                data: {
                  vouchercode: this.vid,
                },
              })
              .then((resp) => {
                if (resp.data.gkstatus === 0) {
                  self.$router.push({
                    name: 'Workflow',
                    params: { wfName: 'Transactions-Voucher', wfId: '-1' },
                  });
                  self.displayToast(
                    this.$gettext(`Voucher Delete success!`),
                    `${self.form.vtype.text} Voucher : ${self.form.vno}, deleted successfully.`,
                    'success'
                  );
                } else {
                  self.displayToast(
                    this.$gettext(`Voucher Delete failed!`),
                    `Unable to delete ${self.form.vtype.text} Voucher : ${self.form.vno}`,
                    'danger'
                  );
                }
              });
          }
        });
    },
    confirmOnSubmit() {
      const fromAcc = this.form.cr
        .reduce((acc, cr) => (acc += `  ${cr.account.accountname},`), '')
        .slice(0, -1);
      const toAcc = this.form.dr
        .reduce((acc, dr) => (acc += `  ${dr.account.accountname},`), '')
        .slice(0, -1);
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Create ${
            this.form.vtype.text
          } Voucher of ${numberToRupees(this.totalDr)} <b>(₹ ${
            this.totalDr
          })</b>, for transaction from Acc <b>"${fromAcc}"</b> to <b>"${toAcc}</b>?"`,
        },
      });
      this.$bvModal
        .msgBoxConfirm(text, {
          size: 'md',
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
      const self = this;
      const payload = this.initPayload();

      if (!payload.invid || payload.invid == null) {
        delete payload.invid;
      }

      const method = this.isCreateMode ? 'post' : 'put';
      const failTitle = this.isCreateMode
              ? this.$gettext('Create Voucher Failure!')
              : this.$gettext('Update Voucher Failure!'),
            failMessage = this.isCreateMode
              ? this.$gettext('Voucher Creation Failed!')
              : this.$gettext('Voucher Updation Failed!');
      axios({ method: method, url: '/transaction', data: payload })
        .then((resp) => {
          self.isLoading = false;
          switch (resp.data.gkstatus) {
          case 0:
            {
              if (this.isCreateMode) {
                self.displayToast(
                  this.$gettext('Create Voucher Success!'),
                  this.$gettext('Voucher Created Successfully!'),
                  'success'
                );
                let dr = self.form.dr.reduce(
                  (acc, dr) => acc + `${dr.account.accountname}, `,
                  ''
                );
                let cr = self.form.cr.reduce(
                  (acc, cr) => acc + `${cr.account.accountname}, `,
                  ''
                );
                dr = dr.substring(0, dr.length - 2);
                cr = cr.substring(0, cr.length - 2);
                let log = {
                  activity: `${self.form.vtype.value} voucher created: dr [ ${dr} ], cr [ ${cr} ]`,
                };
                axios.post('/log', log);

                // update billwise if receipt or payment
                if (self.isReceiptOrPayment) {
                  let billData = {
                    adjbills: [
                      {
                        invid: parseInt(payload.invid),
                        adjamount: parseFloat(self.totalCr),
                        vouchercode: resp.data.vouchercode,
                      },
                    ],
                  };

                  axios.post('/billwise', billData).then(() => {
                    this.updateCreditInvoiceBalance();
                  });
                }

                if (self.onSave !== null) {
                  self.onSave(resp.data);
                }
                self.preloadData();
                self._resetForm(true);
              } else {
                self.displayToast(
                  this.$gettext('Update Voucher Success!'),
                  this.$gettextInterpolate(
                    this.$gettext(
                      `Voucher %{voucherNo} Updated Successfully!`
                    ),
                    {
                      voucherNo: self.form.vno,
                    }
                  ),
                  'success'
                );

                let log = {
                  activity: `${self.form.vtype.value} voucher updated: ${self.form.vno} `,
                };
                axios.post('/log', log);
              }
            }
            break;
          default:
            self.displayToast(failTitle, failMessage, 'danger');
          } // end switch
        })
        .catch((error) => {
          self.isLoading = false;
          self.displayToast(failTitle, error.message, 'danger');
        });
    },
    initPayload() {
      let payload = this._initPayload();

      if (!this.isCreateMode) {
        payload.projectcode = null;
        payload.vouchercode = this.vid;
        const vdata = this.options.vdata;
        if (vdata.vouchertype === 'sale' || vdata.vouchertype === 'purchase') {
          payload.invid = vdata.invid ? vdata.invid : '';
        }
      } else if (this.isReceiptOrPayment && !this.inOverlay) {
        payload.invid = `${this.form.inv || ''}` || '';
      }

      return payload;
    },

    // === Edit Mode Methods ===

    fetchVoucherDetails(vid) {
      const self = this;
      axios.get(`/transaction?code=${vid}`).then((resp) => {
        if (resp.data.gkstatus === 0) {
          let data = resp.data.gkresult;
          self.form.date = self.dateReverse(data.voucherdate);
          self.form.narration = data.narration;

          self.form.vtype = self.options.vtype.find(
            (vtype) => vtype.value === data.vouchertype
          );
          self.form.vno = data.vouchernumber;
          self.form.dr = [];
          self.form.cr = [];
          let drs = Object.keys(data.drs);
          let crs = Object.keys(data.crs);
          let dlength = drs.length;
          let clength = crs.length;
          while (dlength--) {
            self.addRow('dr');
          }
          while (clength--) {
            self.addRow('cr');
          }
          self.preloadData().then(() => {
            self.$nextTick().then(() => {
              drs.forEach((acc, index) => {
                let account = {
                  accountcode: acc,
                  accountname: data.drs[acc].accountname,
                }
                Object.assign(self.form.dr[index], {
                  account: account,
                  balance: null,
                  isLoading: false,
                  debit: true,
                  credit: false,
                  amount: data.drs[acc].amount,
                });
              });
              crs.forEach((acc, index) => {
                let account = {
                  accountcode: acc,
                  accountname: data.crs[acc].accountname,
                }
                Object.assign(self.form.cr[index], {
                  account: account,
                  balance: null,
                  isLoading: false,
                  debit: false,
                  credit: true,
                  amount: data.crs[acc].amount,
                });
              });
              self.$forceUpdate();
            });
          });
          self.options.vdata = data;
        }
      });
    },
  },
  mounted() {
    if (this.isCreateMode) {
      this._resetForm();
    } else {
      this.fetchVoucherDetails(this.vid);
    }
  },
};
</script>
