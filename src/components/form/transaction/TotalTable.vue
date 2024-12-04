<template>
  <div>
    <b-form-checkbox
      switch
      inline
      size="sm"
      v-model="form.roundFlag"
      v-if="config.roundOff"
      class="mb-3 float-right"
    >
      <translate>Round Off Total Value</translate>
    </b-form-checkbox>
    <b-table-simple responsive>
      <b-tbody>
        <b-tr>
          <b-td v-translate>
            Total
          </b-td>
          <b-td
            :style="{minWidth: '70px'}"
            class="text-right text-truncate"
          >
            {{ totalPrice }}
          </b-td>
        </b-tr>
        <b-tr v-if="config.discount && !crdrnote">
          <b-td v-translate>
            Discount
          </b-td>
          <b-td class="text-right">
            {{ totalDiscount }}
          </b-td>
        </b-tr>
        <template v-if="isIndia">
          <b-tr v-if="(gstFlag || vatFlag) && config.taxable">
            <b-td v-translate>
              Taxable Amount
            </b-td>
            <b-td class="text-right">
              {{ form.taxable || '-' }}
            </b-td>
          </b-tr>
          <b-tr v-if="gstFlag && cgstFlag && config.igst">
            <b-td>CGST</b-td>
            <b-td class="text-right">
              {{ form.igst / 2 || '-' }}
            </b-td>
          </b-tr>
          <b-tr v-if="gstFlag && cgstFlag && config.igst">
            <b-td>SGST</b-td>
            <b-td class="text-right">
              {{ form.igst / 2 || '-' }}
            </b-td>
          </b-tr>
          <b-tr v-if="gstFlag && !cgstFlag && config.igst">
            <b-td>IGST</b-td>
            <b-td class="text-right">
              {{ form.igst || '-' }}
            </b-td>
          </b-tr>
          <b-tr v-if="gstFlag && config.cess">
            <b-td>CESS</b-td>
            <b-td class="text-right">
              {{ form.cess || '-' }}
            </b-td>
          </b-tr>
          <b-tr v-if="vatFlag && config.vat">
            <b-td>VAT</b-td>
            <b-td class="text-right">
              {{ form.vat || '-' }}
            </b-td>
          </b-tr>
        </template>
      </b-tbody>
      <b-tfoot>
        <b-tr v-if="config.value">
          <b-th>
            <span class="float-left">{{ transactionName }}</span>
          </b-th>
          <b-th class="text-right">
            {{ form.amount || '-' }}
          </b-th>
        </b-tr>
        <b-tr v-if="form.roundFlag && config.roundOff">
          <b-th>
            {{ transactionName }} <span v-translate>(Rounded Off)</span>
          </b-th>
          <b-th class="text-right">
            {{ form.rounded || '-' }}
          </b-th>
        </b-tr>
        <b-tr v-if="config.valueText">
          <b-th>
            {{ transactionName }} <span v-translate>(in words)</span>
          </b-th>
          <b-th class="text-right">
            {{ totalText }}
          </b-th>
        </b-tr>
      </b-tfoot>
    </b-table-simple>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { numberToRupees } from '../../../js/utils';

export default {
  name: 'TotalTable',
  props: {
    config: {
      type: Object,
      required: true,
    },
    billData: {
      type: Array,
      required: true,
    },
    crdrnote: {
      type: Boolean,
      required: false,
      default: false,
      note: 'Flag to check if credit/debit note',
    },
    gstFlag: {
      type: Boolean,
      required: true,
    },
    cgstFlag: {
      type: Boolean,
      required: false,
      default: false,
    },
    vatFlag: {
      type: Boolean,
      required: false,
      default: false,
    },
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      form: {
        taxable: this.getTotal('taxable'),
        igst: this.getTotal('igst', 'amount'),
        cess: this.getTotal('cess', 'amount'),
        vat: this.getTotal('vat', 'amount'),
        discount: this.getTotal('discount', 'total'),
        amount: this.getTotal('total'),
        rounded: Math.round(this.getTotal('total')).toFixed(2),
        text: this.totalText,
        roundFlag: false,
      },
    };
  },
  watch: {
    updateCounter() {
      this.form = {
        taxable: this.getTotal('taxable'),
        igst: this.getTotal('igst', 'amount'),
        cess: this.getTotal('cess', 'amount'),
        vat: this.getTotal('vat', 'amount'),
        discount: this.getTotal('discount', 'total'),
        amount: this.getTotal('total'),
        rounded: Math.round(this.getTotal('total')).toFixed(2),
        text: this.totalText,
        roundFlag: this.form.roundFlag,
      };
      this.onUpdateDetails();
    },
  },
  computed: {
    totalPrice: (self) => (
      (parseFloat(self.form.taxable) + parseFloat(self.form.discount))
        .toFixed(2)
    ),
    totalDiscount: (self) => (
      parseFloat(self.form.discount)
        ? `-${parseFloat(self.form.discount).toFixed(2)}`
        : '0.00'
    ),
    totalText: (self) => {
      let total = self.form.amount;
      let text = '';
      if (total > 0) {
        if (self.form.roundFlag) {
          total = Math.round(total).toFixed(2);
        }
        text = numberToRupees(total);
      }
      return text;
    },
    transactionName: (self) => {
      return typeof self.config.value === 'object'
        ? self.config.value.text
        : self.$gettext('Grand Total');
    },
    ...mapGetters('global', ['isIndia']),
  },
  methods: {
    onUpdateDetails() {
      setTimeout(() =>
        this.$emit('details-updated', {
          data: this.form,
          name: 'total-table',
        })
      );
    },
    /**
     * getTotal(key)
     *
     * returns the total sum of the given key for all items in bill
     */
    getTotal(key, subKey) {
      let total = 0;
      if (subKey) {
        total = this.billData.reduce((acc, curr) => {
          return (
            parseFloat(acc) +
            (curr[key] ? parseFloat(curr[key][subKey]) || 0 : 0)
          );
        }, 0);
      } else {
        total = this.billData.reduce(
          (acc, curr) => parseFloat(acc) + (parseFloat(curr[key]) || 0),
          0
        );
      }
      if (isNaN(total)) {
        return null;
      }
      return total.toFixed(2);
    },
  },
};
</script>
