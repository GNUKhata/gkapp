<!-- Note: Uses Mixin located at /src/mixins/voucher.js, please refer there for 
list of all the props, methods, computed and data items not defined in this file  -->
<template>
  <div class="card mx-0">
    <div class="card-header text-left py-2 bg-dark text-light">
      <b v-translate>{{ vtitle }}</b>
      <slot name="close-button" />
    </div>
    <div class="card-body pb-2 align-form-label-right">
      <b-overlay
        :show="isLoading"
        variant="secondary"
        no-wrap
        blur
      />
      <b-form
        class="text-left"
        @submit.prevent="confirmOnSubmit"
      >
        <b-card
          bg-variant="light"
          class="text-left mb-3"
        >
          <b-card-text>
            <h5 class="text-center">
              Invoice Details
            </h5>
            No : {{ creditInvData?.invoiceno }} <br class="d-sm-none">
            <span class="float-sm-right">
              Date: {{ creditInvData?.invoicedate }}
            </span>
            <br>
            Invoice Amount : {{ creditInvData?.invoicetotal || '' }} <br>
            Balance Amount : {{ creditInvData?.balanceamount || '' }} <br>
          </b-card-text>
        </b-card>
        <b-form-group
          label="Date"
          label-cols="3"
          label-size="sm"
          id="ci-input-group-1"
        >
          <template #label>
            <translate> Date </translate>
          </template>
          <gk-date
            id="ci-date-1"
            :format="dateFormat"
            v-model="form.date"
            :min="minDate"
            :max="_maxDate"
            @validity="setDateValidity"
            :required="true"
          />
        </b-form-group>
        <b-form-group
          label-size="sm"
          label="Bank Transfer Amount"
          label-for="ci-input-20"
          label-cols="3"
        >
          <template #label>
            <translate> Bank Transfer Amount </translate>
          </template>

          <b-form-input
            size="sm"
            id="ci-input-20"
            type="number"
            class="gk-currency"
            no-wheel
            min="0"
            v-model="bank"
            step="0.1"
          />
        </b-form-group>
        <b-form-group
          label-size="sm"
          label="Cash Transfer Amount"
          label-for="ci-input-10"
          label-cols="3"
        >
          <template #label>
            <translate> Cash Transfer Amount </translate>
          </template>

          <b-form-input
            size="sm"
            id="ci-input-10"
            type="number"
            step="0.1"
            class="gk-currency"
            no-wheel
            v-model="cash"
            min="0"
          />
        </b-form-group>
        <b-form-group
          label-size="sm"
          label="Balance Due"
          label-for="ci-input-10"
          label-cols="3"
        >
          <template #label>
            <translate> Balance Due </translate>
          </template>

          <b-form-input
            size="sm"
            id="ci-input-10"
            type="number"
            class="gk-currency"
            step="0.1"
            no-wheel
            v-model="due"
            disabled
            :class="{'text-danger': !isDueValid}"
          />
        </b-form-group>
        <b-form-group
          label-size="sm"
          label="Narration"
          label-for="ci-input-30"
          label-cols="3"
        >
          <b-form-textarea
            :placeholder="defComment"
            id="ci-input-30"
            size="sm"
            rows="2"
            max-rows="3"
          />
        </b-form-group>

        <hr class="my-2">
        <div class="float-right">
          <b-button
            size="sm"
            class="m-1"
            variant="warning"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle mr-1"
              icon="arrow-repeat"
              @click.prevent="resetForm"
            />
            <span
              class="align-middle"
              v-translate
            >Reset</span>
          </b-button>
          <b-button
            :disabled="!allValid"
            type="submit"
            size="sm"
            class="m-1"
            variant="success"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle mr-1"
              icon="plus-square"
            />
            <span
              class="align-middle"
              v-translate
            >Save</span>
          </b-button>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import voucherMixin from '@/mixins/voucher.js';
import GkDate from '@/components/GkDate.vue';
export default {
  name: 'EasyVoucher',
  mixins: [voucherMixin],
  components: { GkDate },
  props: {
    invId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      cash: 0,
      bank: 0,
      due: 0,
      date: {
        format: 'dd-mm-yyyy',
        valid: null,
      },
    };
  },
  computed: {
    vtitle: function() {
      let title = '';
      if (this.type === 'receipt') {
        title += 'Receive payment from';
      } else if (this.type === 'payment') {
        title += 'Make payment to';
      }

      title += ` ${this.creditInvData?.custname || ''}`;
      return title;
    },
    defComment: function() {
      let comment = '';
      let invNo = this.creditInvData?.invoiceno || '';
      let invTotal = parseFloat(this.cash || 0) + parseFloat(this.bank || 0);
      if (this.type === 'receipt') {
        comment += `Received payment of Rs. ${invTotal} from`;
      } else if (this.type === 'payment') {
        comment += `Made payment of Rs. ${invTotal} to`;
      }
      comment += ` ${this.creditInvData?.custname || ''}`;
      comment += ` for Invoice on credit, ${invNo}.`;
      return comment;
    },
    minDate: function() {
      let date = '';
      if (this.creditInvData?.invoicedate) {
        date = this.creditInvData.invoicedate;
      } else {
        date =
          this.dateFormat === 'dd-mm-yyyy'
            ? this.dateReverse(this.yearStart)
            : this.yearStart;
      }
      return date;
    },
    isDueValid: function() {
      let balance = parseFloat(this.creditInvData?.balanceamount || 0);
      return this.due >= 0 && this.due < balance;
    },
    allValid: function() {
      let total = parseFloat(this.cash || 0) + parseFloat(this.bank || 0);
      let balance = parseFloat(this.creditInvData?.balanceamount || 0);
      let totalValid = total > 0 && total <= balance;
      let dueValid = this.due >= 0 && this.due < balance;
      let dateValid = this.isDateValid || this.isDateValid === null;
      return dateValid && totalValid && dueValid;
    },
  },
  watch: {
    invId(id) {
      if (id) {
        const self = this;
        this.resetForm().then(() => {
          self.form.inv = id;
          self.onInvSelect();
          self.bank = parseFloat(self.creditInvData.balanceamount || 0);
        });
      }
    },
    cash() {
      this.due =
        parseFloat(this.creditInvData.balanceamount) -
        (parseFloat(this.cash || 0) + parseFloat(this.bank || 0));
    },
    bank() {
      this.due =
        parseFloat(this.creditInvData.balanceamount) -
        (parseFloat(this.cash || 0) + parseFloat(this.bank || 0));
    },
  },
  methods: {
    setDateValidity(validity) {
      this.date.valid = validity;
    },
    confirmOnSubmit() {
      let total = parseFloat(this.cash || 0) + parseFloat(this.bank || 0);
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `${this.vtitle} of Rs. ${total}?"`,
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
      const method = 'post';
      const failTitle = this.$gettext('Create Voucher Failure!'),
            failMessage = this.$gettext('Voucher Creation Failed!');

      axios({ method: method, url: '/transaction', data: payload })
        .then((resp) => {
          self.isLoading = false;
          switch (resp.data.gkstatus) {
          case 0:
            {
              self.displayToast(
                this.$gettext('Success!'),
                `Successfully ${self.defComment}`,
                'success'
              );
              const accMap = self.options.acc;
              let dr = self.form.dr.reduce(
                (acc, dr) => acc + `${accMap[dr.account]}, `,
                ''
              );
              let cr = self.form.cr.reduce(
                (acc, cr) => acc + `${accMap[cr.account]}, `,
                ''
              );
              dr = dr.substring(0, dr.length - 2);
              cr = cr.substring(0, cr.length - 2);
              let log = {
                activity: `${self.form.vtype.value} voucher created: dr [ ${dr} ], cr [ ${cr} ]`,
              };
              axios.post('/log', log);

              // update billwise if receipt or payment
              let billData = {
                adjbills: [
                  {
                    invid: parseInt(payload.invid),
                    adjamount: parseFloat(self.totalCr),
                    vouchercode: resp.data.vouchercode,
                  },
                ],
              };

              axios.post('/billwise', billData).finally(() => {
                if (self.onSave !== null) {
                  self.onSave(resp.data);
                }
              });
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
      // convert the easy voucher data format to normal voucher data format
      // and use _initPayload
      this.form.cr = [];
      this.form.dr = [];
      let cashAccType = this.type === 'receipt' ? 'dr' : 'cr';
      let custAccType = this.type === 'receipt' ? 'cr' : 'dr';

      let cashAcc = this.options[cashAccType].find(
        (acc) => acc.accountname === 'Cash in hand'
      );
      let bankAcc = this.options[cashAccType].find(
        (acc) => acc.accountname === 'Bank A/C'
      );
      let custAcc = this.options[custAccType].find(
        (acc) => acc.accountname === this.customerName
      );

      if (this.cash && parseFloat(this.cash) > 0) {
        this.form[cashAccType].push({
          account: cashAcc.accountcode,
          amount: parseFloat(this.cash),
        });
      }
      if (this.bank && parseFloat(this.bank) > 0) {
        this.form[cashAccType].push({
          account: bankAcc.accountcode,
          amount: parseFloat(this.bank),
        });
      }

      const total = parseFloat(this.cash || 0) + parseFloat(this.bank || 0);

      this.form[custAccType].push({
        account: custAcc.accountcode,
        amount: total,
      });

      if (!this.form.narration) {
        this.form.narration = this.defComment;
      }

      let payload = this._initPayload();
      payload.invid = `${this.form.inv}` || null;
      return payload;
    },
    resetForm() {
      this.cash = 0;
      this.bank = 0;
      this.due = 0;
      return this._resetForm(null, true);
    },
  },
  mounted() {
    const self = this;
    this.isLoading = true;
    this._resetForm().then(() => {
      self.isLoading = false;
      if (this.invId > 0) {
        self.form.inv = this.invId;
        self.onInvSelect();
        self.bank = parseFloat(self.creditInvData.balanceamount || 0);
      }
    });
  },
};
</script>
