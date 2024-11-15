<template>
  <b-container fluid>
    <b-overlay
      :show="isPreloading"
      variant="secondary"
      no-wrap
      blur
    />
    <div v-if="deletedFlag">
      <span
        class="float-right h5 p-2 bg-danger text-white"
        v-translate
      >Cancelled</span>
      <div class="clearfix" />
      <br>
    </div>
    <!-- action buttons -->
    <div
      class="mb-3 clearfix d-print-none"
      v-if="voucher?.invid && !deletedFlag"
    >
      <div class="float-right">
        <span v-if="voucher?.icflag == 9">
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
          >
            <b-icon
              class="mr-1"
              icon="eye"
            />
            <router-link
              class="custom-link"
              :to="
                `/workflow/Transactions-Invoice/${voucher.invid}`
              "
            >View Invoice
            </router-link>
          </b-button>
        </span>
        <span v-if="voucher?.icflag == 3">
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
          >
            <b-icon
              class="mr-1"
              icon="eye"
            />
            <router-link
              class="custom-link"
              :to="
                `/workflow/Transactions-CashMemo/${voucher.invid}`
              "
            >View Cash Memo
            </router-link>
          </b-button>
        </span>
        <span v-if="!deletedFlag">
          <b-button
            size="sm"
            variant="warning"
            class="mr-1"
            :to="{name: 'Edit_Voucher', params: {vid: id}}"
          >
            <translate> Edit </translate>
          </b-button>
          <b-button
            @click.prevent="onDelete"
            size="sm"
            variant="danger"
          >
            <translate> Delete </translate>
          </b-button>
        </span>
      </div>
    </div>
    <div
      class="mb-3 clearfix d-print-none"
      v-if="type === 'creditnote' || type === 'debitnote'"
    >
      <div class="float-right">
        <span>
          <b-button
            class="mr-1"
            size="sm"
            variant="primary"
            v-b-toggle.voucher-container
          >
            <b-icon
              class="mr-1"
              icon="eye"
            />
            <router-link
              class="custom-link"
              :to="
                `/workflow/Transactions-DebitCreditNote/${voucher.drcrid}`
              "
            >{{ type === 'creditnote' ? 'View Credit Note' : 'View Debit Note' }}
            </router-link>
          </b-button>
        </span>
      </div>
    </div>
    <b-row>
      <b-col
        order="2"
        order-md="1"
      />
      <b-col
        class="text-md-right"
        cols="12"
        md="6"
        order="1"
        order-md="2"
      >
        <b v-translate> Voucher Details </b>
        <!-- Note Details Table -->
        <b-table-lite
          :fields="['title', 'value']"
          :items="voucherData"
          small
          bordered
          thead-class="d-none"
          fixed
          class="text-small table-border-dark"
        />
      </b-col>
    </b-row>
    <b-table-lite
      :items="voucher.content"
      :fields="tableFields"
      bordered
      head-variant="dark"
      foot-clone
      small
      class="text-small table-border-dark"
    >
      <template #cell(account)="data">
        <router-link
          v-if="!deletedFlag"
          :to="`/ledger/${data.item.accountcode}`"
        >
          {{ data.item.account }}
        </router-link>
        <span v-else>{{ data.item.accountcode }}</span>
      </template>
      <template #foot(account)="">
        <span v-translate> Total </span>
      </template>
      <template #foot(dr)="">
        <div class="gk-currency">
          ₹ {{ totalDr }}
        </div>
      </template>
      <template #foot(cr)="">
        <div class="gk-currency">
          ₹ {{ totalCr }}
        </div>
      </template>
    </b-table-lite>
    <p class="text-small">
      <b v-translate> Narration: </b> <br>
      {{ voucher.narration }}
    </p>
    <br><br>
  </b-container>
</template>

<script>
import axios from 'axios';
export default {
  name: 'VoucherProfile',
  props: {
    id: {
      type: Number,
      required: true,
    },
    pdata: {
      type: Object,
      required: true,
      note:
        'parent data. This is data sent from the parent component about this Voucher Profile',
    },
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of Invoice, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  computed: {
    voucherData: (self) => {
      return [
        { title: self.$gettext('No.'), value: self.no },
        { title: self.$gettext('Date'), value: self.voucher.date },
        { title: self.$gettext('Type'), value: self.type },
      ];
    },
    deletedFlag: (self) => !!self.pdata.deletedFlag,
    totalCr: (self) =>
      self.voucher.content
        .reduce((acc, item) => acc + (parseFloat(item.cr) || 0), 0)
        .toFixed(2),
    totalDr: (self) =>
      self.voucher.content
        .reduce((acc, item) => acc + (parseFloat(item.dr) || 0), 0)
        .toFixed(2),
  },
  data() {
    return {
      isPreloading: false,
      tableFields: [
        'account',
        { key: 'dr', label: 'Dr', tdClass: 'gk-currency' },
        { key: 'cr', label: 'Cr', tdClass: 'gk-currency' },
      ],
      voucher: {
        content: [],
        date: '',
        narration: '',
      },
      type: '',
      no: '',
    };
  },
  methods: {
    onDelete() {
      const self = this;
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Delete ${this.type} Voucher <b>${this.no}</b>?"`,
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
                  vouchercode: this.id,
                },
              })
              .then((resp) => {
                if (resp.data.gkstatus === 0) {
                  let log = {
                    activity: `${self.type} voucher deleted: ${self.no}`,
                  };
                  axios.post('/log', log);

                  self.displayToast(
                    this.$gettext(`Voucher Delete success!`),
                    this.$gettextInterpolate(
                      this.$gettext(
                        `%{voucherType} Voucher : %{voucherNo}, deleted successfully.`
                      ),
                      {
                        voucherType: self.type,
                        voucherNo: self.no,
                      }
                    ),
                    'success'
                  );
                  this.onUpdate({ type: 'delete' });
                } else {
                  self.displayToast(
                    this.$gettext(`Voucher Delete failed!`),
                    this.$gettextInterpolate(
                      this.$gettext(
                        `Unable to delete %{voucherType} Voucher : %{voucherNo}`
                      ),
                      {
                        voucherType: self.type,
                        voucherNo: self.no,
                      }
                    ),
                    'danger'
                  );
                }
              });
          }
        });
    },
    /**
     * formatInvoiceDetails()
     *
     * Description: Format the invoice details from gkcore to an
     * internal format for ease of use
     */
    formatVoucherDetails(details) {
      if (details) {
        this.no = details.vouchernumber;
        this.type = details.vouchertype;
        this.voucher.narration = details.narration;
        this.voucher.date = details.voucherdate;
        this.voucher.content = [];
        this.voucher.invid = details?.invid;
        this.voucher.drcrid = details?.drcrid;
        this.voucher.icflag = details?.icflag;
        for (const code in details.drs) {
          const record = details.drs[code];
          
          this.voucher.content.push({
            accountcode: code,
            account: record.accountname,
            dr: record.amount,
            cr: '',
          });
        }
        for (const code in details.crs) {
          const record = details.crs[code];
          this.voucher.content.push({
            accountcode: code,
            account: record.accountname,
            dr: '',
            cr: record.amount,
          });
        }
      }
    },
    getDetails() {
      return axios.get(`/transaction?code=${this.id}`).catch((error) => {
        this.$bvToast.toast(`Error: ${error.message}`, {
          title: this.$gettext(`Fetch Voucher Error!`),
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
          this.formatVoucherDetails(response.data.gkresult);
          break;
        case 2:
          this.$bvToast.toast(
            this.$gettext(`Unauthorized access, Please contact admin`),
            {
              title: this.$gettext(`Fetch Voucher Error!`),
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
              `Unable to Fetch Voucher Details! Please Try after sometime.`
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
  watch: {
    id: function(id) {
      if (id && !this.pdata.deletedFlag) {
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
    pdata: function(data) {
      if (data.deletedFlag) {
        this.formatVoucherDetails(data);
      }
    },
  },
  mounted() {
    if (this.id && !this.pdata.deletedFlag) {
      this.isPreloading = true;
      this.fetchAndUpdateData()
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    } else if (this.pdata.deletedFlag) {
      this.formatVoucherDetails(this.pdata);
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
